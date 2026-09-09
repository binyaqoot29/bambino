import type { Metadata } from "next";
import { Poppins, Tajawal } from "next/font/google";
import { redirect } from "next/navigation";

import { BagProvider } from "@/components/cart/store";
import { AddedToBagDrawer } from "@/components/cart/AddedToBagDrawer";
import { CatalogProvider } from "@/components/catalog/CatalogProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { isLocale, locales, localeMeta, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/resolve-locale";
import { buildProductIndex } from "@/lib/catalog/index-client";
import { buildAgeLinks, buildNav } from "@/lib/nav";
import { visibleCollections } from "@/lib/catalog/collections";
import { text } from "@/lib/catalog/types";
import { languageAlternates } from "@/lib/alternates";
import { announcements } from "@/lib/delivery-copy";
import { loadSettings } from "@/lib/site-settings";
import { serveFromSnapshot } from "@/lib/cache/snapshot";
import "../globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * The storefront renders per request.
 *
 * The catalogue is data the shop owner edits, and an edit should be visible
 * immediately — not after a revalidation round trip. Prerendering would also
 * make every build depend on the database being reachable, so a transient
 * database blip would fail a deploy rather than just a page.
 *
 * The trade is a query per page view instead of static HTML. At this
 * catalogue's size that's the right way round; if traffic ever makes it the
 * wrong way round, this line and `revalidatePath` in the admin actions are the
 * two places to revisit.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  serveFromSnapshot();
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return {
    title: {
      default: `${dict.brand.name} — ${dict.brand.tagline}`,
      template: `%s · ${dict.brand.name}`,
    },
    description: dict.brand.intro,
    alternates: {
      canonical: `/${locale}`,
      languages: await languageAlternates((l) => `/${l}`),
    },
    openGraph: {
      title: `${dict.brand.name} — ${dict.brand.tagline}`,
      description: dict.brand.intro,
      locale: locale === "ar" ? "ar_KW" : "en_KW",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  // Storefront reads come from the KV snapshot; see src/lib/cache/snapshot.ts.
  serveFromSnapshot();
  const { lang } = await params;
  // `/about` or `/cart` with no language: [lang] matched the page name as if it
  // were a locale. Send it to the right language rather than 404 — the
  // multi-segment case lives in app/[...path], and this is the single-segment
  // half of what src/proxy.ts used to do.
  if (!isLocale(lang)) redirect(`/${await resolveLocale()}/${lang}`);

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const ages = buildAgeLinks(locale);
  // One wave, not three: each of these is a separate round trip to the
  // database, and none depends on another.
  const [nav, settings, collections, index] = await Promise.all([
    buildNav(locale),
    loadSettings(),
    visibleCollections(),
    buildProductIndex(locale),
  ]);
  const shipping = settings.shipping;

  // Arabic can be switched off in the admin. Redirecting rather than 404ing
  // keeps every existing /ar link working — it lands on the English page for
  // the same thing instead of a dead end.
  if (locale === "ar" && !settings.languages.arabicEnabled) {
    redirect("/en");
  }

  return (
    <html
      lang={localeMeta[locale].htmlLang}
      dir={localeMeta[locale].dir}
      className={`${poppins.variable} ${tajawal.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main"
          className="focus:bg-brand-500 sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:px-5 focus:py-2.5 focus:text-sm focus:text-white"
        >
          {dict.common.skipToContent}
        </a>

        <CatalogProvider index={index}>
          <BagProvider>
            <Header
              locale={locale}
              nav={nav}
              ages={ages}
              showLanguageSwitch={settings.languages.arabicEnabled}
              collections={collections.map((collection) => ({
                slug: collection.slug,
                label: text(collection.name, locale),
                rule: collection.rule,
              }))}
              announcements={announcements(shipping, dict, locale)}
              strings={{
                searchPlaceholder: dict.nav.searchPlaceholder,
                search: dict.common.search,
                account: dict.nav.account,
                wishlist: dict.nav.wishlist,
                cart: dict.nav.cart,
                changeLanguage: dict.nav.changeLanguage,
                openMenu: dict.nav.openMenu,
                closeMenu: dict.nav.closeMenu,
                shopByAge: dict.nav.shopByAge,
                close: dict.common.close,
              }}
            />

            <main id="main" className="flex-1">
              {children}
            </main>

            <Footer locale={locale} dict={dict} nav={nav} />
            <AddedToBagDrawer
              locale={locale}
              dict={dict}
              rates={{
                freeThreshold: shipping.freeThreshold,
                flatRate: shipping.flatRate,
              }}
            />
          </BagProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
