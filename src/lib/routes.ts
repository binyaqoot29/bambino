import type { Locale } from "@/i18n/config";

export const routes = {
  home: (l: Locale) => `/${l}`,
  category: (l: Locale, slug: string) => `/${l}/c/${slug}`,
  department: (l: Locale, department: string) => `/${l}/d/${department}`,
  collection: (l: Locale, collection: string) =>
    `/${l}/collections/${collection}`,
  product: (l: Locale, handle: string) => `/${l}/p/${handle}`,
  cart: (l: Locale) => `/${l}/cart`,
  wishlist: (l: Locale) => `/${l}/wishlist`,
  search: (l: Locale, query?: string) =>
    query ? `/${l}/search?q=${encodeURIComponent(query)}` : `/${l}/search`,
  about: (l: Locale) => `/${l}/about`,
} as const;

/**
 * Collection slugs, labels and blurbs used to live here as fixed constants.
 * They're rows now — see `src/lib/catalog/collections.ts` — because the shop
 * owner adds, renames, reorders and hides them from the admin panel.
 */
