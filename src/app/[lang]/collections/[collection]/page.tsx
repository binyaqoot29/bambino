import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductListing } from "@/components/plp/ProductListing";
import { parseListingParams } from "@/components/plp/search-params";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { collectionProducts, findCollection } from "@/lib/catalog/collections";
import { getAllProducts } from "@/lib/catalog/queries";
import { text } from "@/lib/catalog/types";
import { languageAlternates } from "@/lib/alternates";
import { routes } from "@/lib/routes";

/**
 * Collections come from the database so the shop owner can add, rename, hide
 * and reorder them. There's no `generateStaticParams` for the same reason there
 * isn't one on the category route: the list isn't known at build time, and a
 * collection created in the admin has to work immediately.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; collection: string }>;
}): Promise<Metadata> {
  const { lang, collection: slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const collection = await findCollection(slug);
  if (!collection || !collection.visible) return {};

  return {
    title: text(collection.name, locale),
    description: collection.blurb ? text(collection.blurb, locale) : undefined,
    alternates: {
      canonical: routes.collection(locale, slug),
      languages: await languageAlternates((l) => routes.collection(l, slug)),
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps<"/[lang]/collections/[collection]">) {
  const { lang, collection: slug } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const collection = await findCollection(slug);
  // A hidden collection is a 404 rather than an empty page: it's been taken out
  // of the shop, and a live URL for it would undo that.
  if (!collection || !collection.visible) notFound();

  const dict = getDictionary(locale);
  // A curated collection defaults to the order it was arranged in; an
  // automatic one has no arrangement to preserve, so it sorts as usual.
  const listingParams = parseListingParams(
    await searchParams,
    collection.rule ? "featured" : "curated",
  );
  const products = await collectionProducts(collection, await getAllProducts());
  const title = text(collection.name, locale);

  return (
    <ProductListing
      title={title}
      description={
        collection.blurb ? text(collection.blurb, locale) : undefined
      }
      crumbs={[
        { label: dict.nav.home, href: routes.home(locale) },
        { label: title },
      ]}
      products={products}
      params={listingParams}
      basePath={routes.collection(locale, slug)}
      locale={locale}
      dict={dict}
    />
  );
}
