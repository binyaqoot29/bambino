import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Listing } from "@/design";
import { parseListingParams } from "@/components/plp/search-params";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getAllProducts } from "@/lib/catalog/queries";
import { CATEGORIES, categoryBySlug } from "@/lib/catalog/taxonomy";
import { DEPARTMENT_LABELS } from "@/lib/catalog/types";
import { routes } from "@/lib/routes";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    CATEGORIES.map((category) => ({ lang, slug: category.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const category = categoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name[locale],
    description: category.blurb?.[locale],
    alternates: {
      canonical: routes.category(locale, slug),
      languages: {
        en: routes.category("en", slug),
        ar: routes.category("ar", slug),
      },
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/[lang]/c/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const category = categoryBySlug(slug);
  if (!category) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const listingParams = parseListingParams(await searchParams);

  const products = getAllProducts().filter((p) => p.category === slug);

  return (
    <Listing
      title={category.name[locale]}
      description={category.blurb?.[locale]}
      crumbs={[
        { label: dict.nav.home, href: routes.home(locale) },
        {
          label: DEPARTMENT_LABELS[category.department][locale],
          href: routes.department(locale, category.department),
        },
        { label: category.name[locale] },
      ]}
      products={products}
      params={listingParams}
      basePath={routes.category(locale, slug)}
      locale={locale}
      dict={dict}
    />
  );
}
