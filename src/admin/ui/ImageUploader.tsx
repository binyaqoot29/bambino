"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { shrink } from "@/admin/ui/shrink";

type Item = { url: string; uploading?: boolean; error?: string };

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
  const [items, setItems] = useState<Item[]>(initial.map((url) => ({ url })));
  const input = useRef<HTMLInputElement>(null);

  const message = (code: string) =>
    code === "size"
      ? labels.tooLarge
      : code === "type"
        ? labels.wrongType
        : labels.failed;

  async function handleFiles(files: FileList) {
    for (const file of Array.from(files)) {
      const placeholder: Item = {
        url: URL.createObjectURL(file),
        uploading: true,
      };
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
      <p className="text-ink-700 text-[12px] font-medium">{labels.title}</p>
      <p className="text-ink-400 mt-0.5 text-[11px]">{labels.hint}</p>

      {/* Only settled uploads are submitted; a failed one must not be saved. */}
      {stored.map((item) => (
        <input key={item.url} type="hidden" name="image" value={item.url} />
      ))}

      <div className="mt-3 flex flex-wrap gap-2.5">
        {items.map((item, index) => (
          <div
            key={item.url}
            className={`ring-ink-200 relative size-24 overflow-hidden rounded-xl ring-1 ${
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
              <span className="text-ink-600 absolute inset-0 grid place-items-center text-[10px] font-medium">
                {labels.uploading}
              </span>
            ) : null}

            {item.error ? (
              <span className="bg-sale/90 absolute inset-x-0 bottom-0 px-1 py-0.5 text-[9px] leading-tight font-medium text-white">
                {item.error}
              </span>
            ) : null}

            {index === 0 && !item.uploading && !item.error ? (
              <span className="bg-brand-900 absolute start-1 top-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white">
                {labels.cover}
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45 opacity-0 transition-opacity hover:opacity-100">
              {index > 0 && !item.error ? (
                <button
                  type="button"
                  onClick={() => move(index)}
                  title={labels.makeFirst}
                  className="px-1.5 py-1 text-[10px] font-medium text-white"
                >
                  ★
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setItems((c) => c.filter((_, i) => i !== index))}
                title={labels.remove}
                className="px-1.5 py-1 text-[10px] font-medium text-white"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => input.current?.click()}
          className="ring-ink-300 text-ink-500 hover:bg-ink-50 hover:text-brand-700 grid size-24 place-items-center rounded-xl text-xs font-medium ring-1 ring-dashed"
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
