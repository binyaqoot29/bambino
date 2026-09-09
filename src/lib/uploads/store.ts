import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

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
  const path = `products/${randomUUID()}.${extension}`;
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

      return {
        ok: true,
        url: `${backend.url}/storage/v1/object/public/${BUCKET}/${path}`,
      };
    }

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

/**
 * Removes an image.
 *
 * Deliberately forgiving: a missing file is the desired end state, and a
 * product edit must not fail because its old photo was already gone.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    if (url.startsWith("/uploads/")) {
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
