import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Product image storage.
 *
 * One interface, two backends — the same split the database uses:
 *
 * - **Deployed** (`BLOB_READ_WRITE_TOKEN` present) → Vercel Blob.
 * - **Local** → `public/uploads/`, served straight off the filesystem.
 *
 * The local path exists because the Blob token is marked Secret on Vercel and
 * can't be pulled to a laptop, exactly like Neon's connection string. Without a
 * local backend, uploading would be untestable anywhere but production.
 */

/** What the shop will accept. Anything else is a mistake or an attack. */
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

/**
 * 6MB. The browser resizes before uploading, so anything near this is a photo
 * that skipped the resize — worth rejecting rather than storing.
 */
export const MAX_BYTES = 6 * 1024 * 1024;

export type SaveResult =
  | { ok: true; url: string }
  | { ok: false; reason: "type" | "size" | "failed" };

function usingBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveImage(file: File): Promise<SaveResult> {
  const extension = ALLOWED.get(file.type);
  if (!extension) return { ok: false, reason: "type" };
  if (file.size > MAX_BYTES) return { ok: false, reason: "size" };

  // A random name, not the uploaded one: filenames arrive from the browser and
  // are attacker-controlled, and the original tells us nothing useful.
  const name = `products/${randomUUID()}.${extension}`;

  try {
    if (usingBlob()) {
      const { put } = await import("@vercel/blob");
      const blob = await put(name, file, {
        access: "public",
        contentType: file.type,
        // The name is already unique; a suffix would only make it uglier.
        addRandomSuffix: false,
      });
      return { ok: true, url: blob.url };
    }

    const dir = join(process.cwd(), "public", "uploads", "products");
    await mkdir(dir, { recursive: true });
    const filename = name.split("/")[1];
    await writeFile(
      join(dir, filename),
      Buffer.from(await file.arrayBuffer()),
    );
    return { ok: true, url: `/uploads/products/${filename}` };
  } catch {
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
    if (usingBlob() && url.startsWith("http")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch {
    // Already gone, or storage unavailable. Neither should block the edit.
  }
}
