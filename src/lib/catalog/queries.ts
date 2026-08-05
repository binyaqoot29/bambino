import type { Locale } from "@/i18n/config";

import { PRODUCTS } from "./products";
import { CATEGORIES, categoryBySlug } from "./taxonomy";
import {
  type AgeGroup,
  type Product,
  type SortKey,
  inStock,
} from "./types";

/**
 * The read layer the pages talk to. Everything is synchronous today because the
 * catalogue is in-process; the signatures are already Promise-friendly, so
 * dropping in a real backend means changing these bodies and nothing else.
 */

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductByHandle(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function getProductsByIds(ids: string[]): Product[] {
  const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

export function getFeatured(limit = 8) {
  return PRODUCTS.filter((p) => p.featured).slice(0, limit);
}

export function getBestsellers(limit = 8) {
  return PRODUCTS.filter((p) => p.bestseller).slice(0, limit);
}

export function getNewIn(limit = 8) {
  return [...PRODUCTS].sort((a, b) => a.daysOld - b.daysOld).slice(0, limit);
}

export function getOnSale(limit = 8) {
  return PRODUCTS.filter((p) => p.compareAtPrice).slice(0, limit);
}

export function getRelated(product: Product, limit = 4) {
  const sameCategory = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const sameDepartment = PRODUCTS.filter(
    (p) =>
      p.department === product.department &&
      p.category !== product.category &&
      p.id !== product.id,
  );
  return [...sameCategory, ...sameDepartment].slice(0, limit);
}

export function getProductsByAge(age: AgeGroup, limit?: number) {
  const matches = PRODUCTS.filter((p) => p.ageGroups.includes(age));
  return limit ? matches.slice(0, limit) : matches;
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

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  locale: Locale,
): Product[] {
  return products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.department && p.department !== filters.department) return false;

    if (filters.ages?.length) {
      if (!filters.ages.some((a) => p.ageGroups.includes(a))) return false;
    }
    if (filters.colours?.length) {
      if (!p.colours.some((c) => filters.colours!.includes(c.key))) return false;
    }
    if (filters.sizes?.length) {
      if (!p.variants.some((v) => filters.sizes!.includes(v.size))) return false;
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
        const category = categoryBySlug(p.category);
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
    for (const c of p.colours) colours.set(c.key, (colours.get(c.key) ?? 0) + 1);
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

export function getCategories() {
  return CATEGORIES;
}

export function countInCategory(slug: string) {
  return PRODUCTS.filter((p) => p.category === slug).length;
}
