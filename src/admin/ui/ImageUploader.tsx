"use client";

import Image from "next/image";
import { useRef, useState } from "react";

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
 * roughly a third of the bytes of the same picture as JPEG. Browsers that
 * cannot encode WebP (none current, but the fallback is free) get JPEG.
 */
const MAX_EDGE = 2000;
const WEBP_QUALITY = 0.86;
const JPEG_QUALITY = 0.9;

type Item = { url: string; uploading?: boolean; error?: string };

/**
 * Shrinks a picked photo before it leaves the browser.
 *
 * Falls back to the original file if anything about the canvas path fails —
 * an unusual colour profile, a format the browser won't decode. A large upload
 * is better than a lost one; the server still rejects genuinely oversized files.
 */
async function shrink(file: File): Promise<Blob> {
  try {
    // "from-image" applies the EXIF rotation, so a portrait phone photo is
    // stored upright instead of relying on every viewer to honour the tag.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    // Already small and already WebP: nothing to gain by re-encoding.
    if (scale === 1 && file.type === "image/webp" && file.size < 400_000) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const encode = (type: string, quality: number) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

    // A browser that cannot encode WebP silently returns PNG from toBlob;
    // the type check catches that and falls back to JPEG.
    let blob = await encode("image/webp", WEBP_QUALITY);
    if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg", JPEG_QUALITY);
    if (!blob) return file;

    // Only if it actually helped. A tiny, already-optimised file can come
    // out larger after re-encoding; the original is the better upload then.
    return scale < 1 || blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function ImageUploader({
  initial,
  labels,
}: {
  initial: string[];
  labels: {
    title: string;
    hint: string;
    add: string;
    uploading: string;
    remove: string;
    makeFirst: string;
    cover: string;
    tooLarge: string;
    wrongType: string;
    failed: string;
    empty: string;
  };
}) {
  const [items, setItems] = useState<Item[]>(
    initial.map((url) => ({ url })),
  );
  const input = useRef<HTMLInputElement>(null);

  const message = (code: string) =>
    code === "size"
      ? labels.tooLarge
      : code === "type"
        ? labels.wrongType
        : labels.failed;

  async function handleFiles(files: FileList) {
    for (const file of Array.from(files)) {
      const placeholder: Item = { url: URL.createObjectURL(file), uploading: true };
      setItems((current) => [...current, placeholder]);

      try {
        const body = new FormData();
        body.append("file", await shrink(file), file.name);
        const response = await fetch("/admin/upload", { method: "POST", body });
        const data = await response.json();

        setItems((current) =>
          current.map((item) =>
            item.url === placeholder.url
              ? response.ok
                ? { url: data.url }
                : { ...item, uploading: false, error: message(data.error) }
              : item,
          ),
        );
        if (response.ok) URL.revokeObjectURL(placeholder.url);
      } catch {
        setItems((current) =>
          current.map((item) =>
            item.url === placeholder.url
              ? { ...item, uploading: false, error: labels.failed }
              : item,
          ),
        );
      }
    }
  }

  const move = (index: number) =>
    setItems((current) => {
      const next = [...current];
      const [picked] = next.splice(index, 1);
      return [picked, ...next];
    });

  const stored = items.filter((i) => !i.uploading && !i.error);

  return (
    <div>
      <p className="text-ink-700 text-xs font-semibold">{labels.title}</p>
      <p className="text-ink-400 mt-0.5 text-[11px]">{labels.hint}</p>

      {/* Only settled uploads are submitted; a failed one must not be saved. */}
      {stored.map((item) => (
        <input key={item.url} type="hidden" name="image" value={item.url} />
      ))}

      <div className="mt-3 flex flex-wrap gap-2.5">
        {items.map((item, index) => (
          <div
            key={item.url}
            className={`ring-ink-200 relative size-24 overflow-hidden rounded-lg ring-1 ${
              item.error ? "ring-sale ring-2" : ""
            }`}
          >
            {/* A blob: URL while uploading, so unoptimized — next/image can't
                transform something that only exists in this browser. */}
            <Image
              src={item.url}
              alt=""
              fill
              sizes="96px"
              unoptimized={item.url.startsWith("blob:")}
              className={`object-cover ${item.uploading ? "opacity-40" : ""}`}
            />

            {item.uploading ? (
              <span className="text-ink-600 absolute inset-0 grid place-items-center text-[10px] font-semibold">
                {labels.uploading}
              </span>
            ) : null}

            {item.error ? (
              <span className="bg-sale/90 absolute inset-x-0 bottom-0 px-1 py-0.5 text-[9px] leading-tight font-semibold text-white">
                {item.error}
              </span>
            ) : null}

            {index === 0 && !item.uploading && !item.error ? (
              <span className="bg-brand-500 absolute start-1 top-1 rounded px-1.5 py-0.5 text-[9px] font-bold text-white">
                {labels.cover}
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45 opacity-0 transition-opacity hover:opacity-100">
              {index > 0 && !item.error ? (
                <button
                  type="button"
                  onClick={() => move(index)}
                  title={labels.makeFirst}
                  className="px-1.5 py-1 text-[10px] font-semibold text-white"
                >
                  ★
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() =>
                  setItems((c) => c.filter((_, i) => i !== index))
                }
                title={labels.remove}
                className="px-1.5 py-1 text-[10px] font-semibold text-white"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => input.current?.click()}
          className="ring-ink-300 text-ink-500 hover:bg-ink-50 hover:text-brand-600 grid size-24 place-items-center rounded-lg text-xs font-semibold ring-1 ring-dashed"
        >
          {labels.add}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-ink-400 mt-2 text-[11px]">{labels.empty}</p>
      ) : null}

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files?.length) handleFiles(event.target.files);
          // Reset so picking the same file twice still fires a change.
          event.target.value = "";
        }}
      />
    </div>
  );
}
