import type { Locale } from "@/i18n/config";

export const routes = {
  home: (l: Locale) => `/${l}`,
  category: (l: Locale, slug: string) => `/${l}/c/${slug}`,
  department: (l: Locale, department: string) => `/${l}/d/${department}`,
  collection: (l: Locale, collection: string) => `/${l}/collections/${collection}`,
  product: (l: Locale, handle: string) => `/${l}/p/${handle}`,
  cart: (l: Locale) => `/${l}/cart`,
  wishlist: (l: Locale) => `/${l}/wishlist`,
  search: (l: Locale, query?: string) =>
    query ? `/${l}/search?q=${encodeURIComponent(query)}` : `/${l}/search`,
  about: (l: Locale) => `/${l}/about`,
} as const;

export const COLLECTIONS = ["new-in", "bestsellers", "sale"] as const;
export type CollectionSlug = (typeof COLLECTIONS)[number];

export const COLLECTION_LABELS: Record<
  CollectionSlug,
  { en: string; ar: string }
> = {
  "new-in": { en: "New in", ar: "وصل حديثاً" },
  bestsellers: { en: "Bestsellers", ar: "الأكثر مبيعاً" },
  sale: { en: "Sale", ar: "التخفيضات" },
};

export const COLLECTION_BLURBS: Record<
  CollectionSlug,
  { en: string; ar: string }
> = {
  "new-in": {
    en: "Everything that landed in the last few weeks.",
    ar: "كل ما وصل خلال الأسابيع الماضية.",
  },
  bestsellers: {
    en: "The pieces Kuwait parents keep coming back for.",
    ar: "القطع التي يعود إليها أهالي الكويت دائماً.",
  },
  sale: {
    en: "Reduced while stock lasts.",
    ar: "بأسعار مخفّضة حتى نفاد الكمية.",
  },
};
