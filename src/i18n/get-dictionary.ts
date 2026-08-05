import type { Locale } from "./config";
import en from "./dictionaries/en.json";
import ar from "./dictionaries/ar.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  // The Arabic file mirrors the English shape; the cast keeps the key union
  // honest so a missing translation is a type error, not a runtime `undefined`.
  ar: ar as Dictionary,
};

/**
 * Dictionaries are plain JSON, so they're safe to hand to client components as
 * props — no context provider and no extra request.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
