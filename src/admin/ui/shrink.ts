/**
 * Longest edge a stored product photo keeps.
 *
 * The stored file is the master: every size the shop shows is derived from it
 * on the fly by Supabase (see src/lib/images/supabase-loader.ts), so it needs
 * enough detail for the largest slot on a 2× screen and no more. 2000px is
 * that, with room for a zoomed gallery later. A phone photo is 4000px+ and
 * 3–8MB; shrinking here keeps uploads under the request limit and stops the
 * bucket filling with pixels nobody will ever see.
 *
 * WebP at 0.86 keeps every detail a person can see in a product photo at
 * roughly a third of the bytes of the same picture as JPEG. Safari cannot
 * encode WebP and gets the JPEG fallback; the server then re-encodes that
 * master as WebP itself (see src/lib/uploads/store.ts), so the stored
 * result is the same whichever browser the photo came from.
 */
const MAX_EDGE = 2000;
const WEBP_QUALITY = 0.86;
const JPEG_QUALITY = 0.85;

/**
 * Shrinks a picked photo before it leaves the browser.
 *
 * Falls back to the original file if anything about the canvas path fails —
 * an unusual colour profile, a format the browser won't decode. A large upload
 * is better than a lost one; the server still rejects genuinely oversized files.
 */
export async function shrink(file: File): Promise<Blob> {
  try {
    // "from-image" applies the EXIF rotation, so a portrait phone photo is
    // stored upright instead of relying on every viewer to honour the tag.
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    // Already small and already WebP: nothing to gain by re-encoding.
    if (scale === 1 && file.type === "image/webp" && file.size < 400_000)
      return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const encode = (type: string, quality: number) =>
      new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, type, quality),
      );

    // A browser that cannot encode WebP silently returns PNG from toBlob;
    // the type check catches that and falls back to JPEG.
    let blob = await encode("image/webp", WEBP_QUALITY);
    if (!blob || blob.type !== "image/webp")
      blob = await encode("image/jpeg", JPEG_QUALITY);
    if (!blob) return file;

    // Only if it actually helped. A tiny, already-optimised file can come
    // out larger after re-encoding; the original is the better upload then.
    return scale < 1 || blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}
