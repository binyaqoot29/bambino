import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isLocale, locales, type Locale } from "@/i18n/config";
import { loadSettings } from "@/lib/site-settings";

/**
 * Decides which language a visitor arriving at `/` gets.
 *
 * This lives in a page rather than in `src/proxy.ts` because the choice depends
 * on settings held in the database, and the proxy runs on every request —
 * Next's guidance is explicit that it isn't the place for data fetching. So the
 * proxy handles locale-less deeper paths with a static fallback, and the
 * entry point everyone actually arrives at resolves the real preference here.
 *
 * Order: a language the visitor asked for and the shop serves, then the shop's
 * configured default.
 */
export default async function RootPage() {
  const settings = await loadSettings();
  const available: Locale[] = settings.languages.arabicEnabled
    ? [...locales]
    : ["en"];

  const header = (await headers()).get("accept-language");
  const ranked = header
    ? header
        .split(",")
        .map((part) => {
          const [tag, q] = part.trim().split(";q=");
          return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
        })
        .sort((a, b) => b.q - a.q)
    : [];

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base) && available.includes(base)) redirect(`/${base}`);
  }

  const fallback = settings.languages.defaultLocale;
  redirect(`/${available.includes(fallback) ? fallback : "en"}`);
}
