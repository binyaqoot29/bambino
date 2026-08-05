import type { Locale } from "./config";

type Vars = Record<string, string | number>;

const pluralRules = new Map<Locale, Intl.PluralRules>();

function rules(locale: Locale) {
  let r = pluralRules.get(locale);
  if (!r) {
    r = new Intl.PluralRules(locale === "ar" ? "ar" : "en");
    pluralRules.set(locale, r);
  }
  return r;
}

function interpolate(template: string, vars?: Vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/**
 * Tiny translator over the JSON dictionaries.
 *
 * - `t(d.plp.sortBy)` — pass the string straight through, so TypeScript catches
 *   a typo'd key at the call site rather than at runtime.
 * - `t(d.plp, "results", { count })` — plural form, picking `results_one` /
 *   `results_other` via `Intl.PluralRules` (Arabic gets zero/two/few/many too,
 *   falling back to `_other` when a form isn't authored).
 */
export function createTranslator(locale: Locale) {
  function t(template: string, vars?: Vars): string {
    return interpolate(template, vars);
  }

  function plural(
    group: Record<string, unknown>,
    key: string,
    count: number,
    vars?: Vars,
  ): string {
    const category = rules(locale).select(count);
    const candidate =
      (group[`${key}_${category}`] as string | undefined) ??
      (group[`${key}_other`] as string | undefined) ??
      (group[key] as string | undefined) ??
      key;
    return interpolate(candidate, { count, ...vars });
  }

  return { t, plural };
}

export type Translator = ReturnType<typeof createTranslator>;
