import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { ProductCard } from "@/components/product/ProductCard";
import { parseListingParams } from "@/components/plp/search-params";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import {
  categoryLookup,
  filterProducts,
  getAllProducts,
  sortProducts,
} from "@/lib/catalog/queries";
import { loadCategories } from "@/lib/catalog/categories";
import { routes } from "@/lib/routes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: getDictionary(locale).search.title,
    robots: { index: false },
  };
}

const POPULAR = ["stroller", "sleepsuit", "muslin", "car seat", "elephant"];

export default async function SearchPage({
  params,
  searchParams,
}: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const { t, plural } = createTranslator(locale);
  const listing = parseListingParams(await searchParams);
  const query = listing.query ?? "";

  const [categories, lookup] = await Promise.all([
    loadCategories(),
    categoryLookup(),
  ]);

  const results = query
    ? sortProducts(
        filterProducts(await getAllProducts(), { query }, locale, lookup),
        listing.sort,
      )
    : [];

  return (
    <div className="container-bambino py-8 lg:py-12">
      <h1 className="text-brand-900 text-3xl font-semibold tracking-tight sm:text-4xl">
        {query ? t(dict.search.resultsFor, { query }) : dict.search.title}
      </h1>

      {query ? (
        <p className="text-ink-500 mt-2 text-sm tabular-nums">
          {plural(dict.plp, "results", results.length)}
        </p>
      ) : null}

      {query && results.length > 0 ? (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} locale={locale} dict={dict} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-canvas-mint mt-8 flex flex-col items-center rounded-[2rem] px-6 py-16 text-center">
          <BambinoMark className="text-mint-400 h-16 w-auto" />
          <h2 className="text-brand-900 mt-6 text-lg font-medium">
            {query ? t(dict.search.noResults, { query }) : dict.search.popular}
          </h2>
          {query ? (
            <p className="text-ink-500 mt-2 max-w-sm text-sm">
              {dict.search.noResultsBody}
            </p>
          ) : null}

          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {POPULAR.map((term) => (
              <li key={term}>
                <Link
                  href={routes.search(locale, term)}
                  className="bg-paper text-ink-700 ring-ink-200 hover:ring-brand-300 inline-flex rounded-full px-4 py-2 text-sm ring-1"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.slice(0, 8).map((category) => (
              <li key={category.slug}>
                <Link
                  href={routes.category(locale, category.slug)}
                  className="text-brand-600 hover:text-brand-700 text-sm underline underline-offset-4"
                >
                  {category.name[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
