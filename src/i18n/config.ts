export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeMeta: Record<
  Locale,
  { label: string; nativeLabel: string; dir: "ltr" | "rtl"; htmlLang: string }
> = {
  en: { label: "English", nativeLabel: "English", dir: "ltr", htmlLang: "en" },
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl", htmlLang: "ar" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dirFor(locale: Locale) {
  return localeMeta[locale].dir;
}

/** Swap the locale segment of a path, keeping the rest intact. */
export function localizePath(path: string, locale: Locale) {
  const segments = path.split("/").filter(Boolean);
  if (segments.length && isLocale(segments[0])) segments[0] = locale;
  else segments.unshift(locale);
  return `/${segments.join("/")}`;
}
