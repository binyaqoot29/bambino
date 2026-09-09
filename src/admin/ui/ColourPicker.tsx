"use client";

import { useMemo, useState } from "react";

type Swatch = { value: string; label: string; hex: string };
type Family = { key: string; label: string; colours: Swatch[] };
type Custom = { en: string; ar: string; hex: string };

/**
 * The product editor's colour control.
 *
 * Sixty-odd palette colours in families, a search box because nobody scans
 * sixty swatches, the chosen ones pinned at the top, and a small form to add
 * a colour the palette lacks — a name in both languages and the exact shade.
 *
 * Everything posts through ordinary form fields: `colours` checkboxes for
 * the keys, and one hidden `customColours` JSON field the action parses. A
 * custom colour's key is derived from its English name on the server, and
 * mirrored here so its checkbox carries the same key.
 */
export function ColourPicker({
  families,
  selected,
  initialCustom,
}: {
  families: Family[];
  selected: string[];
  initialCustom: Custom[];
}) {
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<Set<string>>(() => new Set(selected));
  const [custom, setCustom] = useState<Custom[]>(initialCustom);
  const [draft, setDraft] = useState<Custom>({
    en: "",
    ar: "",
    hex: "#BD72A2",
  });

  const all = useMemo(() => {
    const map = new Map<string, Swatch>();
    for (const family of families)
      for (const c of family.colours) map.set(c.value, c);
    for (const c of custom) {
      const key = customKey(c.en);
      map.set(key, { value: key, label: c.en, hex: c.hex });
    }
    return map;
  }, [families, custom]);

  const q = query.trim().toLowerCase();
  const matches = (c: Swatch) =>
    !q || c.label.toLowerCase().includes(q) || c.value.includes(q);

  function toggle(key: string) {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function addCustom() {
    const en = draft.en.trim();
    if (!en || !/^#[0-9a-fA-F]{6}$/.test(draft.hex)) return;
    const key = customKey(en);
    if (!key || all.has(key)) return;
    setCustom((c) => [
      ...c,
      { en, ar: draft.ar.trim(), hex: draft.hex.toUpperCase() },
    ]);
    setChosen((c) => new Set(c).add(key));
    setDraft({ en: "", ar: "", hex: draft.hex });
  }

  function removeCustom(index: number) {
    const key = customKey(custom[index].en);
    setCustom((c) => c.filter((_, i) => i !== index));
    setChosen((c) => {
      const next = new Set(c);
      next.delete(key);
      return next;
    });
  }

  const chip =
    "ring-ink-300 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs ring-1 transition-colors duration-150 has-checked:ring-ink-900 has-checked:bg-ink-900 has-checked:text-white has-checked:ring-2";
  const field =
    "ring-ink-300 focus:ring-ink-900 h-10 rounded-xl bg-white px-3 text-sm ring-1 focus:outline-none";

  return (
    <div className="space-y-4">
      {/* What is posted: one checkbox per chosen key, one JSON field. */}
      {[...chosen].map((key) => (
        <input
          key={key}
          type="checkbox"
          name="colours"
          value={key}
          checked
          readOnly
          hidden
        />
      ))}
      <input
        type="hidden"
        name="customColours"
        value={JSON.stringify(custom)}
      />

      {chosen.size ? (
        <div className="flex flex-wrap gap-2">
          {[...chosen].map((key) => {
            const c = all.get(key);
            if (!c) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                title="Remove"
                className="bg-ink-900 inline-flex items-center gap-2 rounded-full py-1.5 ps-2 pe-3 text-xs text-white"
              >
                <Dot hex={c.hex} />
                {c.label}
                <span aria-hidden="true" className="ms-1 opacity-70">
                  ✕
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-ink-400 text-[11px]">No colours chosen yet.</p>
      )}

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search colours…"
        aria-label="Search colours"
        className={`${field} w-full sm:max-w-xs`}
      />

      <div className="space-y-4">
        {families.map((family) => {
          const visible = family.colours.filter(matches);
          if (!visible.length) return null;
          return (
            <div key={family.key}>
              <p className="text-ink-400 mb-2 text-[10px] font-medium tracking-[0.14em] uppercase">
                {family.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {visible.map((c) => (
                  <label key={c.value} className={chip}>
                    <input
                      type="checkbox"
                      checked={chosen.has(c.value)}
                      onChange={() => toggle(c.value)}
                      className="sr-only"
                    />
                    <Dot hex={c.hex} />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-ink-200/70 border-t pt-4">
        <p className="text-ink-700 text-[12px] font-medium">
          This product’s own colours
        </p>
        <p className="text-ink-400 mt-0.5 text-[11px]">
          For a shade the palette doesn’t have. Name it in both languages and
          pick the exact colour.
        </p>
        {custom.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {custom.map((c, i) => (
              <li key={`${c.en}-${i}`} className={`${chip} has-checked:ring-1`}>
                <input
                  type="checkbox"
                  checked={chosen.has(customKey(c.en))}
                  onChange={() => toggle(customKey(c.en))}
                  className="sr-only"
                />
                <Dot hex={c.hex} />
                {c.en}
                <span className="opacity-60" dir="rtl">
                  {c.ar}
                </span>
                <button
                  type="button"
                  onClick={() => removeCustom(i)}
                  aria-label={`Remove ${c.en}`}
                  className="ms-1 opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={draft.en}
            onChange={(e) => setDraft({ ...draft, en: e.target.value })}
            placeholder="Name (English)"
            aria-label="Colour name in English"
            className={`${field} w-40`}
          />
          <input
            value={draft.ar}
            onChange={(e) => setDraft({ ...draft, ar: e.target.value })}
            placeholder="الاسم بالعربية"
            aria-label="Colour name in Arabic"
            dir="rtl"
            className={`${field} w-40`}
          />
          <label className="ring-ink-300 flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-white px-3 text-xs ring-1">
            <input
              type="color"
              value={draft.hex}
              onChange={(e) => setDraft({ ...draft, hex: e.target.value })}
              aria-label="Pick the colour"
              className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <span className="text-ink-600 font-mono uppercase" dir="ltr">
              {draft.hex}
            </span>
          </label>
          <button
            type="button"
            onClick={addCustom}
            disabled={!draft.en.trim()}
            className="ring-ink-300 hover:bg-ink-900 hover:text-white h-10 rounded-full bg-white px-4 text-[12px] font-medium ring-1 transition-colors duration-200 disabled:opacity-40"
          >
            Add colour
          </button>
        </div>
      </div>
    </div>
  );
}

function Dot({ hex }: { hex: string }) {
  return (
    <span
      aria-hidden="true"
      className="ring-ink-200 inline-block size-4 shrink-0 rounded-full ring-1"
      style={{ backgroundColor: hex }}
    />
  );
}

/** Must match slugify() + the "c-" prefix in actions.ts. */
function customKey(en: string): string {
  const slug = en
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug ? `c-${slug}` : "";
}
