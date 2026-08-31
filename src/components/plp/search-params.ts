import type { AgeGroup, SortKey } from "@/lib/catalog/types";
import { isSortKey } from "@/lib/catalog/types";

/** Next hands search params through as string | string[] | undefined. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ListingParams = {
  ages: AgeGroup[];
  colours: string[];
  sizes: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sort: SortKey;
  /**
   * What `sort` falls back to for this listing. Carried in the params so
   * `buildQuery` knows which value is the implicit one and can leave it out of
   * the URL, and so the sort dropdown knows whether to offer "curated".
   */
  defaultSort: SortKey;
  page: number;
  query?: string;
};

const AGE_VALUES: AgeGroup[] = [
  "newborn",
  "0-6m",
  "6-12m",
  "1-2y",
  "2-4y",
  "4-6y",
];

/** Repeated (`?age=a&age=b`) and comma-joined (`?age=a,b`) both work. */
function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const parts = Array.isArray(value) ? value : [value];
  return parts
    .flatMap((part) => part.split(","))
    .map((part) => part.trim())
    .filter(Boolean);
}

function num(value: string | string[] | undefined): number | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  if (!first) return undefined;
  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseListingParams(
  raw: RawSearchParams,
  defaultSort: SortKey = "featured",
): ListingParams {
  const sortRaw = Array.isArray(raw.sort) ? raw.sort[0] : raw.sort;
  const queryRaw = Array.isArray(raw.q) ? raw.q[0] : raw.q;

  return {
    ages: list(raw.age).filter((a): a is AgeGroup =>
      (AGE_VALUES as string[]).includes(a),
    ),
    colours: list(raw.colour),
    sizes: list(raw.size),
    minPrice: num(raw.min),
    maxPrice: num(raw.max),
    inStockOnly: raw.stock === "1",
    onSaleOnly: raw.sale === "1",
    sort: sortRaw && isSortKey(sortRaw) ? sortRaw : defaultSort,
    defaultSort,
    page: Math.max(1, num(raw.page) ?? 1),
    query: queryRaw?.trim() || undefined,
  };
}

/** Rebuilds the query string for a filter change, always resetting the page. */
export function buildQuery(
  params: ListingParams,
  patch: Partial<ListingParams>,
): string {
  const next = { ...params, ...patch };
  const search = new URLSearchParams();

  if (next.query) search.set("q", next.query);
  for (const age of next.ages) search.append("age", age);
  for (const colour of next.colours) search.append("colour", colour);
  for (const size of next.sizes) search.append("size", size);
  if (next.minPrice !== undefined) search.set("min", String(next.minPrice));
  if (next.maxPrice !== undefined) search.set("max", String(next.maxPrice));
  if (next.inStockOnly) search.set("stock", "1");
  if (next.onSaleOnly) search.set("sale", "1");
  if (next.sort !== next.defaultSort) search.set("sort", next.sort);
  if (patch.page === undefined) {
    // Any facet change puts us back on page 1.
    if (next.page > 1 && Object.keys(patch).length === 0) {
      search.set("page", String(next.page));
    }
  } else if (next.page > 1) {
    search.set("page", String(next.page));
  }

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function toggle(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

export function activeFilterCount(params: ListingParams): number {
  return (
    params.ages.length +
    params.colours.length +
    params.sizes.length +
    (params.minPrice !== undefined || params.maxPrice !== undefined ? 1 : 0) +
    (params.inStockOnly ? 1 : 0) +
    (params.onSaleOnly ? 1 : 0)
  );
}
