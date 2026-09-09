/**
 * Product image storage.
 *
 * One interface, two backends — the same split the database uses:
 *
 * - **Deployed** (`SUPABASE_URL` present) → Supabase Storage, public bucket.
 * - **Local** → `public/uploads/`, served straight off the filesystem.
 *
 * The local path exists because the service role key can't sit on a laptop,
 * exactly like the database connection string. Without a local backend,
 * uploading would be untestable anywhere but production.
 *
 * Talks to the Storage REST API directly rather than pulling in
 * `@supabase/supabase-js`, which would bring a realtime, auth and PostgREST
 * client along for two calls this file makes by hand.
 *
 * Nothing Node-only is imported at module load. The local branch pulls in
 * `node:fs` and `node:path` only when it runs, so the same file bundles for
 * Cloudflare Workers — where those modules are stubs — and never touches them
 * there, because `SUPABASE_URL` is always set on a deployment.
 */

const BUCKET = "product-images";

/** What the shop will accept. Anything else is a mistake or an attack. */
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

/**
 * 6MB, matching the cap on the bucket itself. The browser resizes before
 * uploading, so anything near this is a photo that skipped the resize — worth
 * refusing rather than storing.
 */
export const MAX_BYTES = 6 * 1024 * 1024;

export type SaveResult =
  | { ok: true; url: string }
  | { ok: false; reason: "type" | "size" | "failed" };

function remote() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export async function saveImage(file: File): Promise<SaveResult> {
  const extension = ALLOWED.get(file.type);
  if (!extension) return { ok: false, reason: "type" };
  if (file.size > MAX_BYTES) return { ok: false, reason: "size" };

  // A random name, not the uploaded one: filenames arrive from the browser and
  // are attacker-controlled, and the original tells us nothing useful.
  const path = `products/${crypto.randomUUID()}.${extension}`;
  const backend = remote();

  try {
    if (backend) {
      const response = await fetch(
        `${backend.url}/storage/v1/object/${BUCKET}/${path}`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${backend.key}`,
            "content-type": file.type,
            // Never silently replace: the path is a fresh UUID, so a collision
            // would mean something is wrong rather than something is a retry.
            "x-upsert": "false",
          },
          body: file,
        },
      );

      if (!response.ok) {
        throw new Error(
          `storage ${response.status}: ${(await response.text()).slice(0, 200)}`,
        );
      }

      const stored = await toWebpMaster(backend, path, file);
      return {
        ok: true,
        url: `${backend.url}/storage/v1/object/public/${BUCKET}/${stored}`,
      };
    }

    const [{ mkdir, writeFile }, { join }] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const dir = join(process.cwd(), "public", "uploads", "products");
    await mkdir(dir, { recursive: true });
    const filename = path.split("/")[1];
    await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
    return { ok: true, url: `/uploads/products/${filename}` };
  } catch (error) {
    // The caller only gets a code — the shop owner can't act on a stack trace.
    // But swallowing it entirely leaves a 500 with no cause in the logs, which
    // is how an upload outage becomes unfixable.
    console.error("[uploads] save failed", {
      backend: backend ? "supabase" : "local",
      type: file.type,
      bytes: file.size,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, reason: "failed" };
  }
}

/** Longest edge of a stored master; matches the browser-side resize. */
const MASTER_EDGE = 2000;
const MASTER_QUALITY = 86;

/**
 * Re-encodes a freshly uploaded JPEG or PNG as a WebP master, server-side.
 *
 * The browser already tries to send WebP, but Safari cannot encode it and
 * falls back to JPEG at around three times the bytes. Workers has no image
 * library, so the conversion is delegated to Supabase's own transformation
 * endpoint: fetch the just-stored object through it at master size with
 * WebP accepted, store the result under a `.webp` name, and delete the
 * original. One transformation per upload; the master is then the same
 * regardless of which browser it came from.
 *
 * Every failure path keeps the original: a master that exists as JPEG is
 * strictly better than an upload that vanished. Returns the path to keep.
 */
async function toWebpMaster(
  backend: { url: string; key: string },
  path: string,
  file: File,
): Promise<string> {
  if (file.type === "image/webp") return path;
  try {
    const rendered = await fetch(
      `${backend.url}/storage/v1/render/image/public/${BUCKET}/${path}` +
        `?width=${MASTER_EDGE}&height=${MASTER_EDGE}&resize=contain&quality=${MASTER_QUALITY}`,
      { headers: { accept: "image/webp,image/*" } },
    );
    if (!rendered.ok || rendered.headers.get("content-type") !== "image/webp") {
      return path;
    }
    const webp = await rendered.arrayBuffer();
    // Not smaller: keep what the browser sent rather than trade bytes for a
    // second transformation.
    if (webp.byteLength >= file.size) return path;

    const webpPath = path.replace(/\.[a-z]+$/, ".webp");
    const put = await fetch(`${backend.url}/storage/v1/object/${BUCKET}/${webpPath}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${backend.key}`,
        "content-type": "image/webp",
        "x-upsert": "false",
      },
      body: webp,
    });
    if (!put.ok) return path;

    // The original is now redundant. Best effort: a leftover file costs a
    // few hundred KB of storage, a failed upload would cost a photo.
    await fetch(`${backend.url}/storage/v1/object/${BUCKET}/${path}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${backend.key}` },
    }).catch(() => undefined);
    return webpPath;
  } catch (error) {
    console.error("[uploads] webp master failed, keeping original", {
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    return path;
  }
}

/**
 * Removes an image.
 *
 * Deliberately forgiving: a missing file is the desired end state, and a
 * product edit must not fail because its old photo was already gone.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    if (url.startsWith("/uploads/")) {
      const [{ unlink }, { join }] = await Promise.all([
        import("node:fs/promises"),
        import("node:path"),
      ]);
      await unlink(join(process.cwd(), "public", url));
      return;
    }

    const backend = remote();
    if (!backend) return;

    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = url.indexOf(marker);
    if (index === -1) return;

    await fetch(
      `${backend.url}/storage/v1/object/${BUCKET}/${url.slice(index + marker.length)}`,
      { method: "DELETE", headers: { authorization: `Bearer ${backend.key}` } },
    );
  } catch {
    // Already gone, or storage unavailable. Neither should block the edit.
  }
}
