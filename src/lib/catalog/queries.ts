import type { Locale } from "@/i18n/config";

import { loadCategories } from "./categories";
import {
  loadCatalogue,
  loadProductByHandle,
  loadProductsByIds,
} from "./repository";
import {
  type AgeGroup,
  type Category,
  type Product,
  type SortKey,
  inStock,
} from "./types";

/**
 * The read layer the pages talk to.
 *
 * Everything that touches the catalogue is async and hits Postgres. The
 * filtering, sorting and faceting below stay in memory deliberately: the
 * catalogue is small, and keeping this logic in TypeScript means the same code
 * serves the storefront's URL-driven facets and the admin's list view without
 * two dialects of the same rules.
 */

export async function getAllProducts(): Promise<Product[]> {
  return loadCatalogue();
}

export async function getProductByHandle(
  handle: string,
): Promise<Product | undefined> {
  return loadProductByHandle(handle);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return loadProductsByIds(ids);
}

export async function getFeatured(limit = 8) {
  return (await loadCatalogue()).filter((p) => p.featured).slice(0, limit);
}

export async function getBestsellers(limit = 8) {
  return (await loadCatalogue()).filter((p) => p.bestseller).slice(0, limit);
}

export async function getNewIn(limit = 8) {
  return [...(await loadCatalogue())]
    .sort((a, b) => a.daysOld - b.daysOld)
    .slice(0, limit);
}

export async function getOnSale(limit = 8) {
  return (await loadCatalogue())
    .filter((p) => p.compareAtPrice)
    .slice(0, limit);
}

export async function getRelated(product: Product, limit = 4) {
  const all = await loadCatalogue();
  const sameCategory = all.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const sameDepartment = all.filter(
    (p) =>
      p.department === product.department &&
      p.category !== product.category &&
      p.id !== product.id,
  );
  return [...sameCategory, ...sameDepartment].slice(0, limit);
}

export async function getProductsByAge(age: AgeGroup, limit?: number) {
  const matches = (await loadCatalogue()).filter((p) =>
    p.ageGroups.includes(age),
  );
  return limit ? matches.slice(0, limit) : matches;
}

export async function getProductsInCategory(slug: string) {
  return (await loadCatalogue()).filter((p) => p.category === slug);
}

export async function getProductsInDepartment(department: string) {
  return (await loadCatalogue()).filter((p) => p.department === department);
}

export async function countInCategory(slug: string) {
  return (await loadCatalogue()).filter((p) => p.category === slug).length;
}

/** Counts for every category in one pass — the nav needs all of them at once. */
export async function countsByCategory(): Promise<Record<string, number>> {
  const [all, categories] = await Promise.all([
    loadCatalogue(),
    loadCategories(),
  ]);
  const counts: Record<string, number> = {};
  for (const category of categories) counts[category.slug] = 0;
  for (const product of all) {
    counts[product.category] = (counts[product.category] ?? 0) + 1;
  }
  return counts;
}

/* -------------------------------------------------------------------------- */

export type ProductFilters = {
  /** Category slug, or a department name to sweep the whole department. */
  category?: string;
  department?: string;
  ages?: AgeGroup[];
  colours?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  query?: string;
};

export type CategoryLookup = (slug: string) => Category | undefined;

/**
 * Synchronous on purpose — it runs inside render for every product. Callers
 * pass a lookup built from the already-loaded category list rather than this
 * awaiting per product.
 */
export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  locale: Locale,
  categoryFor: CategoryLookup = () => undefined,
): Product[] {
  return products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.department && p.department !== filters.department) return false;

    if (filters.ages?.length) {
      if (!filters.ages.some((a) => p.ageGroups.includes(a))) return false;
    }
    if (filters.colours?.length) {
      if (!p.colours.some((c) => filters.colours!.includes(c.key)))
        return false;
    }
    if (filters.sizes?.length) {
      if (!p.variants.some((v) => filters.sizes!.includes(v.size)))
        return false;
    }
    if (filters.minPrice !== undefined && p.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) {
      return false;
    }
    if (filters.inStockOnly && !inStock(p)) return false;
    if (filters.onSaleOnly && !p.compareAtPrice) return false;

    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      if (q) {
        const category = categoryFor(p.category);
        const haystack = [
          p.name[locale],
          p.name.en,
          p.summary[locale],
          category?.name[locale] ?? "",
          category?.name.en ?? "",
          ...p.colours.map((c) => c.name[locale]),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
    }

    return true;
  });
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const list = [...products];
  switch (sort) {
    // The caller arranged these deliberately; re-sorting would discard the
    // whole point of curating a collection.
    case "curated":
      return list;
    case "priceAsc":
      return list.sort((a, b) => a.price - b.price);
    case "priceDesc":
      return list.sort((a, b) => b.price - a.price);
    case "newest":
      return list.sort((a, b) => a.daysOld - b.daysOld);
    case "rating":
      return list.sort(
        (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      );
    case "featured":
    default:
      return list.sort((a, b) => {
        const score = (p: Product) =>
          (p.featured ? 2 : 0) + (p.bestseller ? 1 : 0);
        return score(b) - score(a) || b.rating - a.rating;
      });
  }
}

/** Facet values available for a given result set, with counts. */
export function buildFacets(products: Product[]) {
  const ages = new Map<AgeGroup, number>();
  const colours = new Map<string, number>();
  const sizes = new Map<string, number>();
  let onSale = 0;
  let inStockCount = 0;

  for (const p of products) {
    for (const a of p.ageGroups) ages.set(a, (ages.get(a) ?? 0) + 1);
    for (const c of p.colours)
      colours.set(c.key, (colours.get(c.key) ?? 0) + 1);
    for (const s of new Set(p.variants.map((v) => v.size))) {
      sizes.set(s, (sizes.get(s) ?? 0) + 1);
    }
    if (p.compareAtPrice) onSale++;
    if (inStock(p)) inStockCount++;
  }

  const prices = products.map((p) => p.price);

  return {
    ages,
    colours,
    sizes,
    onSale,
    inStock: inStockCount,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };
}

export type Facets = ReturnType<typeof buildFacets>;

export async function getCategories() {
  return loadCategories();
}

/** A sync lookup for render paths, built from one category query. */
export async function categoryLookup(): Promise<CategoryLookup> {
  const categories = await loadCategories();
  const map = new Map(categories.map((c) => [c.slug, c]));
  return (slug) => map.get(slug);
}
