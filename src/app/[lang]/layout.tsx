import type { Metadata } from "next";
import { Poppins, Tajawal } from "next/font/google";
import { notFound } from "next/navigation";

import { BagProvider } from "@/components/cart/store";
import { AddedToBagDrawer } from "@/components/cart/AddedToBagDrawer";
import { CatalogProvider } from "@/components/catalog/CatalogProvider";
import { SiteFooter, SiteHeader } from "@/design";
import { DesignSwitcher } from "@/design/DesignSwitcher";
import { getDesign } from "@/design/server";
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
  const design = await getDesign();
  const nav = buildNav(locale);
  const ages = buildAgeLinks(locale);

  return (
    <html
      lang={localeMeta[locale].htmlLang}
      dir={localeMeta[locale].dir}
      data-design={design}
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

        <CatalogProvider index={buildProductIndex(locale)}>
          <BagProvider>
            <SiteHeader locale={locale} dict={dict} nav={nav} ages={ages} />

            <main id="main" className="flex-1">
              {children}
            </main>

            <SiteFooter locale={locale} dict={dict} nav={nav} />
            <AddedToBagDrawer locale={locale} dict={dict} />
            <DesignSwitcher current={design} />
          </BagProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
