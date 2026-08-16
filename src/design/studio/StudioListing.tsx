import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ArrowIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import {
  buildFacets,
  categoryLookup,
  filterProducts,
  sortProducts,
} from "@/lib/catalog/queries";
import { SIZE_LABELS, COLOURS } from "@/lib/catalog/taxonomy";
import { AGE_GROUP_LABELS, type AgeGroup } from "@/lib/catalog/types";
import { ActiveFilters } from "@/components/plp/ActiveFilters";
import { FilterRail, FilterSheet, type FacetData } from "@/components/plp/Filters";
import { SortSelect } from "@/components/plp/SortSelect";
import { buildQuery, type ListingParams } from "@/components/plp/search-params";
import type { ListingProps } from "../types";

const PAGE_SIZE = 12;

export async function StudioListing({
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
    <div className="container-bambino py-8 lg:py-12">
      {crumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="text-ink-400 flex flex-wrap items-center gap-1.5 text-xs">
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
                  <span aria-hidden="true" className="opacity-50">
                    /
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <header className="max-w-2xl">
        <h1 className="text-brand-900 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-ink-500 mt-2.5 text-sm leading-relaxed sm:text-base">
            {description}
          </p>
        ) : null}
      </header>

      <div className="mt-8 flex gap-10">
        <FilterRail
          basePath={basePath}
          params={params}
          facets={facets}
          locale={locale}
          dict={dict}
          resultLabel={resultLabel}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-ink-500 text-sm tabular-nums">{resultLabel}</p>
            <div className="flex items-center gap-2">
              <FilterSheet
                basePath={basePath}
                params={params}
                facets={facets}
                locale={locale}
                dict={dict}
                resultLabel={resultLabel}
              />
              <SortSelect basePath={basePath} params={params} dict={dict} />
            </div>
          </div>

          <div className="mb-6">
            <ActiveFilters
              basePath={basePath}
              params={params}
              facets={facets}
              dict={dict}
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState dict={dict} />
          ) : (
            <>
              <ProductGrid products={visible} locale={locale} dict={dict} />
              {totalPages > 1 ? (
                <Pagination
                  basePath={basePath}
                  params={params}
                  page={page}
                  totalPages={totalPages}
                  locale={locale}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ dict }: { dict: Dictionary }) {
  return (
    <div className="bg-canvas-mint flex flex-col items-center rounded-3xl px-6 py-20 text-center">
      <BambinoMark className="text-mint-400 h-16 w-auto" />
      <h2 className="text-ink-900 mt-6 text-lg font-medium">
        {dict.plp.noResults}
      </h2>
      <p className="text-ink-500 mt-2 max-w-sm text-sm">
        {dict.plp.noResultsBody}
      </p>
    </div>
  );
}

function Pagination({
  basePath,
  params,
  page,
  totalPages,
  locale,
}: {
  basePath: string;
  params: ListingParams;
  page: number;
  totalPages: number;
  locale: Locale;
}) {
  const nf = new Intl.NumberFormat(
    locale === "ar" ? "ar-KW-u-nu-latn" : "en-KW",
  );
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={`${basePath}${buildQuery(params, { page: page - 1 })}`}
          rel="prev"
          aria-label="Previous"
          className="text-ink-600 ring-ink-200 hover:ring-brand-300 inline-flex size-10 items-center justify-center rounded-full ring-1"
        >
          <ArrowIcon className="flip-rtl size-4 rotate-180" />
        </Link>
      ) : null}

      {pages.map((n) => (
        <Link
          key={n}
          href={`${basePath}${buildQuery(params, { page: n })}`}
          aria-current={n === page ? "page" : undefined}
          className={`inline-flex size-10 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors ${
            n === page
              ? "bg-brand-500 text-white"
              : "text-ink-600 hover:bg-brand-50"
          }`}
        >
          {nf.format(n)}
        </Link>
      ))}

      {page < totalPages ? (
        <Link
          href={`${basePath}${buildQuery(params, { page: page + 1 })}`}
          rel="next"
          aria-label="Next"
          className="text-ink-600 ring-ink-200 hover:ring-brand-300 inline-flex size-10 items-center justify-center rounded-full ring-1"
        >
          <ArrowIcon className="flip-rtl size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
