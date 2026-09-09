import Link from "next/link";

import { ActiveFilters } from "@/components/plp/ActiveFilters";
import {
  FilterRail,
  FilterSheet,
  type FacetData,
} from "@/components/plp/Filters";
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
import {
  AGE_GROUP_LABELS,
  type AgeGroup,
  type Product,
} from "@/lib/catalog/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { ProductCard } from "@/components/product/ProductCard";

const PAGE_SIZE = 24;

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
 * A serif title over a four-across grid of tall cards, the filter rail as a
 * quiet column at the start, and a one-line toolbar with no box around it.
 * Products get the width; the chrome gets hairlines.
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
  const pageLink = (n: number) =>
    `${basePath}${buildQuery(params, { page: n })}`;
  const pager =
    "text-ink-700 ring-ink-200 hover:ring-ink-900 inline-flex size-10 items-center justify-center rounded-full ring-1 transition-colors duration-200";

  return (
    <div className="bg-paper">
      <div className="container-bambino pt-8 pb-4 lg:pt-12">
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="text-ink-400 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.1em] uppercase [html[lang=ar]_&]:text-[12px] [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case">
              {crumbs.map((crumb, i) => (
                <li
                  key={`${crumb.label}-${i}`}
                  className="flex items-center gap-2"
                >
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-ink-900">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ink-700">{crumb.label}</span>
                  )}
                  {i < crumbs.length - 1 ? (
                    <span aria-hidden="true" className="opacity-50">
                      /
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="max-w-2xl">
          <h1 className="font-display text-ink-900 text-4xl leading-tight sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="text-ink-600 mt-4 text-[15px] leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>

        <div className="mt-10 flex gap-10">
          <FilterRail
            basePath={basePath}
            params={params}
            facets={facets}
            locale={locale}
            dict={dict}
            resultLabel={resultLabel}
          />

          <div className="min-w-0 flex-1">
            <div className="border-ink-200/70 flex flex-wrap items-center justify-between gap-3 border-y py-3">
              <div className="flex items-center gap-4">
                <FilterSheet
                  basePath={basePath}
                  params={params}
                  facets={facets}
                  locale={locale}
                  dict={dict}
                  resultLabel={resultLabel}
                />
                <span className="text-ink-500 text-[13px] tabular-nums">
                  {resultLabel}
                </span>
              </div>
              <SortSelect basePath={basePath} params={params} dict={dict} />
            </div>

            <div className="mt-4">
              <ActiveFilters
                basePath={basePath}
                params={params}
                facets={facets}
                dict={dict}
              />
            </div>

            {visible.length === 0 ? (
              <div className="bg-canvas rounded-card mt-6 px-6 py-24 text-center">
                <h2 className="font-display text-ink-900 text-2xl">
                  {dict.plp.noResults}
                </h2>
                <p className="text-ink-500 mx-auto mt-2 max-w-sm text-sm">
                  {dict.plp.noResultsBody}
                </p>
              </div>
            ) : (
              <>
                <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 xl:grid-cols-4">
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
                  <nav className="mt-14 flex items-center justify-center gap-2">
                    {page > 1 ? (
                      <Link
                        href={pageLink(page - 1)}
                        rel="prev"
                        aria-label="Previous"
                        className={pager}
                      >
                        <ArrowIcon className="flip-rtl size-4 rotate-180" />
                      </Link>
                    ) : null}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (n) => (
                        <Link
                          key={n}
                          href={pageLink(n)}
                          aria-current={n === page ? "page" : undefined}
                          className={
                            n === page
                              ? "bg-brand-900 inline-flex size-10 items-center justify-center rounded-full text-[13px] text-white tabular-nums"
                              : `${pager} text-[13px] tabular-nums`
                          }
                        >
                          {n}
                        </Link>
                      ),
                    )}
                    {page < totalPages ? (
                      <Link
                        href={pageLink(page + 1)}
                        rel="next"
                        aria-label="Next"
                        className={pager}
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
