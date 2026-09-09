import "server-only";

import { cookies, headers } from "next/headers";

import { loadSettings } from "@/lib/site-settings";
import { isLocale, locales, type Locale } from "./config";

/** Set by the storefront when a visitor picks a language explicitly. */
export const LOCALE_COOKIE = "bambino_locale";

/**
 * Which language a visitor should land in when the URL doesn't say.
 *
 * Order: a choice they made earlier (cookie), then what their browser asks for,
 * then the shop's configured default — and only ever a language the shop is
 * currently serving. That last clause is why this is a server function and not
 * middleware: whether Arabic is on is a setting in the database, and middleware
 * runs before the app and isn't the place to fetch it. Doing it here also means
 * an Arabic browser arriving while Arabic is off gets one redirect to English,
 * not a redirect to /ar that the layout then bounces again.
 *
 * Shared by the root page and the catch-all, so the parsing exists once.
 */
export async function resolveLocale(): Promise<Locale> {
  const [settings, jar, head] = await Promise.all([
    loadSettings(),
    cookies(),
    headers(),
  ]);
  const available: readonly Locale[] = settings.languages.arabicEnabled
    ? locales
    : ["en"];

  const saved = jar.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved) && available.includes(saved)) return saved;

  const header = head.get("accept-language");
  if (header) {
    const ranked = header
      .split(",")
      .map((part) => {
        const [tag, q] = part.trim().split(";q=");
        return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { tag } of ranked) {
      const base = tag.split("-")[0];
      if (isLocale(base) && available.includes(base)) return base;
    }
  }

  const fallback = settings.languages.defaultLocale;
  return available.includes(fallback) ? fallback : "en";
}
