import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductListing } from "@/components/plp/ProductListing";
import { parseListingParams } from "@/components/plp/search-params";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getAllProducts } from "@/lib/catalog/queries";
import { inStock } from "@/lib/catalog/types";
import {
  COLLECTIONS,
  COLLECTION_BLURBS,
  COLLECTION_LABELS,
  routes,
  type CollectionSlug,
} from "@/lib/routes";

function isCollection(value: string): value is CollectionSlug {
  return (COLLECTIONS as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    COLLECTIONS.map((collection) => ({ lang, collection })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; collection: string }>;
}): Promise<Metadata> {
  const { lang, collection } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  if (!isCollection(collection)) return {};

  return {
    title: COLLECTION_LABELS[collection][locale],
    description: COLLECTION_BLURBS[collection][locale],
    alternates: {
      canonical: routes.collection(locale, collection),
      languages: {
        en: routes.collection("en", collection),
        ar: routes.collection("ar", collection),
      },
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/[lang]/collections/[collection]">) {
  const { lang, collection } = await params;
  if (!isLocale(lang)) notFound();
  if (!isCollection(collection)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const listingParams = parseListingParams(await searchParams);

  const all = await getAllProducts();
  const products =
    collection === "new-in"
      ? [...all].sort((a, b) => a.daysOld - b.daysOld)
      : collection === "bestsellers"
        ? all.filter((p) => p.bestseller || (p.rating >= 4.7 && inStock(p)))
        : all.filter((p) => p.compareAtPrice);

  return (
    <ProductListing
      title={COLLECTION_LABELS[collection][locale]}
      description={COLLECTION_BLURBS[collection][locale]}
      crumbs={[
        { label: dict.nav.home, href: routes.home(locale) },
        { label: COLLECTION_LABELS[collection][locale] },
      ]}
      products={products}
      params={listingParams}
      basePath={routes.collection(locale, collection)}
      locale={locale}
      dict={dict}
    />
  );
}
