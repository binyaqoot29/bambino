import type { Locale } from "@/i18n/config";
import { loadSettings } from "@/lib/site-settings";

/**
 * `hreflang` alternates for a page, honouring which languages the shop serves.
 *
 * Advertising an Arabic alternate while Arabic is switched off would point
 * search engines at a URL that redirects straight back to English — the classic
 * way to end up with the wrong page indexed.
 */
export async function languageAlternates(
  path: (locale: Locale) => string,
): Promise<Record<string, string>> {
  const { languages } = await loadSettings();

  const alternates: Record<string, string> = { en: path("en") };
  if (languages.arabicEnabled) alternates.ar = path("ar");
  return alternates;
}
