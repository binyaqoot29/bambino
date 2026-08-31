import Link from "next/link";

import { ActiveFilters } from "@/components/plp/ActiveFilters";
import { FilterRail, FilterSheet, type FacetData } from "@/components/plp/Filters";
import { SortSelect } from "@/components/plp/SortSelect";
import { buildQuery, type ListingParams } from "@/components/plp/search-params";
import { ArrowIcon } from "@/components/ui/Icons";
import { createTranslator } from "@/i18n/t";
import {
  buildFacets,
  categoryLookup,
  filterProducts,
  sortProducts,
} from "@/lib/catalog/queries";
import { COLOURS, SIZE_LABELS } from "@/lib/catalog/taxonomy";
import { AGE_GROUP_LABELS, type AgeGroup, type Product } from "@/lib/catalog/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { ProductCard } from "@/components/product/ProductCard";

/** Dense on purpose — this storefront is about seeing more at once. */
const PAGE_SIZE = 20;

export type Crumb = { label: string; href?: string };

export type ListingProps = {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  /** The candidate set before facets — facet counts are derived from it. */
  products: Product[];
  params: ListingParams;
  basePath: string;
  locale: Locale;
  dict: Dictionary;
};

/**
 * A permanent filter rail, a five-across grid, a compact toolbar stating the
 * result count plainly, and the header collapsed to one line so products start
 * high up the page.
 */
export async function ProductListing({
  title,
  description,
  crumbs,
  products,
  params,
  basePath,
  locale,
  dict,
}: ListingProps) {
  const { plural } = createTranslator(locale);

  const filtered = filterProducts(
    products,
    {
      ages: params.ages,
      colours: params.colours,
      sizes: params.sizes,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      inStockOnly: params.inStockOnly,
      onSaleOnly: params.onSaleOnly,
      query: params.query,
    },
    locale,
    await categoryLookup(),
  );
  const sorted = sortProducts(filtered, params.sort);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(params.page, totalPages);
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const raw = buildFacets(products);
  const facets: FacetData = {
    ages: [...raw.ages.entries()]
      .sort(
        (a, b) =>
          Object.keys(AGE_GROUP_LABELS).indexOf(a[0]) -
          Object.keys(AGE_GROUP_LABELS).indexOf(b[0]),
      )
      .map(([value, count]) => ({
        value,
        label: AGE_GROUP_LABELS[value as AgeGroup][locale],
        count,
      })),
    colours: [...raw.colours.entries()].map(([value, count]) => ({
      value,
      label: COLOURS[value]?.name[locale] ?? value,
      hex: COLOURS[value]?.hex,
      count,
    })),
    sizes: [...raw.sizes.entries()]
      .filter(([value]) => value !== "one-size")
      .sort(
        (a, b) =>
          Object.keys(SIZE_LABELS).indexOf(a[0]) -
          Object.keys(SIZE_LABELS).indexOf(b[0]),
      )
      .map(([value, count]) => ({
        value,
        label: SIZE_LABELS[value]?.[locale] ?? value,
        count,
      })),
    minPrice: Math.floor(raw.minPrice / 1000) * 1000,
    maxPrice: Math.ceil(raw.maxPrice / 1000) * 1000,
    onSale: raw.onSale,
    inStock: raw.inStock,
  };

  const resultLabel = plural(dict.plp, "results", sorted.length);

  return (
    <div className="bg-canvas">
      <div className="container-bambino py-5">
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="text-ink-400 flex flex-wrap items-center gap-1.5 text-[11px]">
              {crumbs.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-brand-600">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ink-600">{crumb.label}</span>
                  )}
                  {i < crumbs.length - 1 ? (
                    <span aria-hidden="true" className="opacity-40">
                      ›
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        {/* Title and count share a line — products start higher. */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-ink-900 text-xl font-bold sm:text-2xl">{title}</h1>
          <span className="text-ink-500 text-sm tabular-nums">
            {resultLabel}
          </span>
        </div>
        {description ? (
          <p className="text-ink-500 mt-1 text-xs">{description}</p>
        ) : null}

        <div className="mt-5 flex gap-6">
          <FilterRail
            basePath={basePath}
            params={params}
            facets={facets}
            locale={locale}
            dict={dict}
            resultLabel={resultLabel}
          />

          <div className="min-w-0 flex-1">
            <div className="ring-ink-200 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1">
              <div className="flex items-center gap-2">
                <FilterSheet
                  basePath={basePath}
                  params={params}
                  facets={facets}
                  locale={locale}
                  dict={dict}
                  resultLabel={resultLabel}
                />
                <span className="text-ink-500 hidden text-xs tabular-nums lg:inline">
                  {resultLabel}
                </span>
              </div>
              <SortSelect basePath={basePath} params={params} dict={dict} />
            </div>

            <div className="mb-3">
              <ActiveFilters
                basePath={basePath}
                params={params}
                facets={facets}
                dict={dict}
              />
            </div>

            {visible.length === 0 ? (
              <div className="ring-ink-200 rounded-lg bg-white px-6 py-16 text-center ring-1">
                <h2 className="text-ink-900 text-base font-bold">
                  {dict.plp.noResults}
                </h2>
                <p className="text-ink-500 mx-auto mt-1.5 max-w-sm text-xs">
                  {dict.plp.noResultsBody}
                </p>
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visible.map((product) => (
                    <li key={product.id}>
                      <ProductCard
                        product={product}
                        locale={locale}
                        dict={dict}
                      />
                    </li>
                  ))}
                </ul>

                {totalPages > 1 ? (
                  <nav className="mt-8 flex items-center justify-center gap-1">
                    {page > 1 ? (
                      <Link
                        href={`${basePath}${buildQuery(params, { page: page - 1 })}`}
                        rel="prev"
                        aria-label="Previous"
                        className="text-ink-600 ring-ink-300 hover:border-brand-500 inline-flex size-9 items-center justify-center rounded-lg bg-white ring-1"
                      >
                        <ArrowIcon className="flip-rtl size-4 rotate-180" />
                      </Link>
                    ) : null}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (n) => (
                        <Link
                          key={n}
                          href={`${basePath}${buildQuery(params, { page: n })}`}
                          aria-current={n === page ? "page" : undefined}
                          className={`inline-flex size-9 items-center justify-center rounded-lg text-xs font-semibold tabular-nums ${
                            n === page
                              ? "bg-brand-500 text-white"
                              : "text-ink-600 ring-ink-300 bg-white ring-1 hover:border-brand-500"
                          }`}
                        >
                          {n}
                        </Link>
                      ),
                    )}
                    {page < totalPages ? (
                      <Link
                        href={`${basePath}${buildQuery(params, { page: page + 1 })}`}
                        rel="next"
                        aria-label="Next"
                        className="text-ink-600 ring-ink-300 hover:border-brand-500 inline-flex size-9 items-center justify-center rounded-lg bg-white ring-1"
                      >
                        <ArrowIcon className="flip-rtl size-4" />
                      </Link>
                    ) : null}
                  </nav>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
