"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { DESIGNS, DESIGN_META, persistDesign, type Design } from "./config";

/**
 * Floating control for flipping between the two design directions.
 *
 * Review-build only — it writes a cookie and refreshes so the server picks up
 * the new design. Delete this component (and its mount in the locale layout)
 * once a direction is chosen.
 */
export function DesignSwitcher({ current }: { current: Design }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function choose(design: Design) {
    persistDesign(design);
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="fixed right-4 bottom-4 z-[90] print:hidden">
      {open ? (
        <div className="bg-white ring-ink-200 mb-2 ml-auto w-60 overflow-hidden rounded-2xl shadow-[0_18px_40px_-16px_rgb(36,28,33,0.35)] ring-1">
          <p className="text-ink-400 border-ink-100 border-b px-4 py-2.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
            Design direction
          </p>
          <ul>
            {DESIGNS.map((design) => {
              const active = design === current;
              return (
                <li key={design}>
                  <button
                    type="button"
                    onClick={() => choose(design)}
                    aria-current={active}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-start transition-colors ${
                      active ? "bg-brand-50" : "hover:bg-ink-50"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`size-2.5 shrink-0 rounded-full ${
                        active ? "bg-brand-500" : "bg-ink-300"
                      }`}
                    />
                    <span>
                      <span
                        className={`block text-sm font-medium ${
                          active ? "text-brand-700" : "text-ink-800"
                        }`}
                      >
                        {DESIGN_META[design].label}
                      </span>
                      <span className="text-ink-500 block text-xs">
                        {DESIGN_META[design].blurb}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="bg-ink-900 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-white shadow-lg transition-opacity hover:opacity-90"
      >
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${
            pending ? "bg-brand-300 animate-pulse" : "bg-mint-300"
          }`}
        />
        Design: {DESIGN_META[current].label}
      </button>
    </div>
  );
}
