"use client";

import { useRef, useState, useTransition } from "react";

import { attachPhotos } from "@/admin/actions";
import { shrink } from "@/admin/ui/shrink";

type Labels = {
  pick: string;
  matched: string;
  unmatched: string;
  upload: string;
  uploading: string;
  done: string;
  unknown: string;
  failed: string;
  remove: string;
  fileColumn: string;
  productColumn: string;
};

type Item = {
  file: File;
  handle: string;
  order: number;
  known: boolean;
  status: "pending" | "uploading" | "done" | "failed";
  url?: string;
};

/**
 * "cloud-sleepsuit-2.jpg" → { handle: "cloud-sleepsuit", order: 2 }.
 * Mirrors handleFromFilename on the server; kept here so the match is shown
 * before anything is uploaded.
 */
function parseName(name: string): { handle: string; order: number } {
  const base = name.replace(/\.[a-z0-9]+$/i, "");
  const match = base.match(/[\s_-]*\(?(\d{1,2})\)?$/);
  const order = match ? Number(match[1]) : 0;
  const handle = base
    .replace(/[\s_-]*\(?\d{1,2}\)?$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return { handle, order };
}

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));
}

export function BulkPhotos({
  handles,
  labels,
}: {
  /** Every product handle the shop has, so a match can be shown up front. */
  handles: string[];
  labels: Labels;
}) {
  const known = new Set(handles);
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [result, setResult] = useState<{
    attached: number;
    unknown: string[];
    failed: number;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function pick(files: FileList) {
    const next: Item[] = Array.from(files).map((file) => {
      const { handle, order } = parseName(file.name);
      return {
        file,
        handle,
        order,
        known: known.has(handle),
        status: "pending",
      };
    });
    // Same product, numbered order — so "-1" lands before "-2".
    next.sort((a, b) => a.handle.localeCompare(b.handle) || a.order - b.order);
    setItems((current) => [...current, ...next]);
    setResult(null);
  }

  async function upload() {
    const queue = items.filter((i) => i.known && i.status !== "done");
    setProgress({ done: 0, total: queue.length });
    let done = 0;
    const uploaded: Item[] = [];

    for (const item of queue) {
      setItems((c) =>
        c.map((i) => (i === item ? { ...i, status: "uploading" } : i)),
      );
      try {
        const body = new FormData();
        body.append("file", await shrink(item.file), item.file.name);
        const response = await fetch("/admin/upload", { method: "POST", body });
        const data = await response.json();
        const ok = response.ok && typeof data.url === "string";
        const updated: Item = ok
          ? { ...item, status: "done", url: data.url }
          : { ...item, status: "failed" };
        if (ok) uploaded.push(updated);
        setItems((c) => c.map((i) => (i === item ? updated : i)));
      } catch {
        setItems((c) =>
          c.map((i) => (i === item ? { ...i, status: "failed" } : i)),
        );
      }
      done++;
      setProgress({ done, total: queue.length });
    }

    const batches = new Map<string, string[]>();
    for (const item of uploaded) {
      batches.set(item.handle, [
        ...(batches.get(item.handle) ?? []),
        item.url!,
      ]);
    }
    startTransition(async () => {
      const outcome = await attachPhotos(
        [...batches].map(([handle, urls]) => ({ handle, urls })),
      );
      setResult({ ...outcome, failed: queue.length - uploaded.length });
      setProgress(null);
      setItems((c) => c.filter((i) => i.status !== "done"));
    });
  }

  const uploadable = items.filter((i) => i.known && i.status !== "done").length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="ring-ink-300 hover:bg-ink-900 hover:text-white h-10 rounded-full bg-white px-5 text-[13px] font-medium ring-1 transition-colors duration-200"
        >
          {labels.pick}
        </button>
        {uploadable > 0 ? (
          <button
            type="button"
            onClick={upload}
            disabled={progress !== null || pending}
            className="bg-brand-900 hover:bg-brand-800 h-10 rounded-full px-5 text-[13px] font-medium text-white transition-colors duration-200 disabled:opacity-40"
          >
            {progress
              ? fill(labels.uploading, progress)
              : fill(labels.upload, { count: uploadable })}
          </button>
        ) : null}
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files?.length) pick(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {result ? (
        <div className="mt-4 space-y-1.5 text-sm">
          <p className="text-success">
            {fill(labels.done, { attached: result.attached })}
          </p>
          {result.unknown.length ? (
            <p className="text-sale">
              {fill(labels.unknown, { handles: result.unknown.join(", ") })}
            </p>
          ) : null}
          {result.failed ? (
            <p className="text-sale">
              {fill(labels.failed, { count: result.failed })}
            </p>
          ) : null}
        </div>
      ) : null}

      {items.length ? (
        <ul className="divide-ink-200/70 mt-5 divide-y text-sm">
          <li className="text-ink-500 grid grid-cols-[1fr_1fr_auto] gap-3 pb-2 text-[11px] tracking-[0.12em] uppercase">
            <span>{labels.fileColumn}</span>
            <span>{labels.productColumn}</span>
            <span />
          </li>
          {items.map((item, index) => (
            <li
              key={`${item.file.name}-${index}`}
              className="grid grid-cols-[1fr_1fr_auto] items-center gap-3 py-2.5"
            >
              <span className="text-ink-800 truncate" dir="ltr">
                {item.file.name}
              </span>
              <span
                className={`truncate ${item.known ? "text-ink-700" : "text-sale"}`}
                dir="ltr"
              >
                {item.known
                  ? `${item.handle}${item.order ? ` · #${item.order}` : ""}`
                  : `${item.handle || "?"} — ${labels.unmatched}`}
              </span>
              <span className="text-ink-400 text-xs">
                {item.status === "uploading"
                  ? "…"
                  : item.status === "failed"
                    ? "✕"
                    : null}
                {item.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() =>
                      setItems((c) => c.filter((_, i) => i !== index))
                    }
                    className="hover:text-ink-900"
                  >
                    {labels.remove}
                  </button>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
