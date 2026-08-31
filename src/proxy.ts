import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, locales } from "@/i18n/config";

const LOCALE_COOKIE = "bambino_locale";

/**
 * Every page lives under /{locale}. Requests without one are redirected to the
 * visitor's best match: an explicit choice they made earlier (cookie), then
 * Accept-Language, then English.
 *
 * `/` is deliberately not handled here — it's the entry point almost everyone
 * arrives at, and the language shown there depends on settings in the database.
 * Next's guidance is that the proxy isn't for data fetching, so that decision
 * lives in `src/app/page.tsx`. What's left here are locale-less deeper links,
 * which are rare and fall back to English when nothing matches.
 */
function pickLocale(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && (locales as readonly string[]).includes(saved)) return saved;

  const header = request.headers.get("accept-language");
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
      if ((locales as readonly string[]).includes(base)) return base;
    }
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, the API surface, the admin (English-only, outside the
  // localised storefront) and anything with a file extension.
  // `.+` rather than `.*` so the bare root falls through to app/page.tsx.
  matcher: ["/((?!_next|api|admin|.*\\..*).+)"],
};
