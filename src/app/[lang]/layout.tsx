import type { Metadata } from "next";
import { Poppins, Tajawal } from "next/font/google";
import { notFound } from "next/navigation";

import { BagProvider } from "@/components/cart/store";
import { AddedToBagDrawer } from "@/components/cart/AddedToBagDrawer";
import { CatalogProvider } from "@/components/catalog/CatalogProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { isLocale, locales, localeMeta, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildProductIndex } from "@/lib/catalog/index-client";
import { buildAgeLinks, buildNav } from "@/lib/nav";
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
      languages: { en: "/en", ar: "/ar" },
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
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const nav = await buildNav(locale);
  const ages = buildAgeLinks(locale);

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

        <CatalogProvider index={await buildProductIndex(locale)}>
          <BagProvider>
            <Header
              locale={locale}
              nav={nav}
              ages={ages}
              announcements={[
                dict.announce.shipping,
                dict.announce.returns,
                dict.announce.cod,
              ]}
              strings={{
                newIn: dict.nav.newIn,
                sale: dict.nav.sale,
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
            <AddedToBagDrawer locale={locale} dict={dict} />
          </BagProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
