import type { Fils } from "@/lib/money";
import type { Locale } from "@/i18n/config";

/** Every customer-visible string in the catalog carries both languages. */
export type I18nText = Record<Locale, string>;

export function text(value: I18nText, locale: Locale) {
  return value[locale];
}

/** Keys into the line-art illustration set in components/product/ProductArt. */
export type ArtKey =
  | "bodysuit"
  | "dress"
  | "tee"
  | "sleepsuit"
  | "stroller"
  | "carseat"
  | "cot"
  | "bedding"
  | "bottle"
  | "highchair"
  | "teddy"
  | "booties"
  | "bath"
  | "bag";

export type AgeGroup = "newborn" | "0-6m" | "6-12m" | "1-2y" | "2-4y" | "4-6y";

export type Department =
  "clothing" | "travel" | "nursery" | "feeding" | "play" | "bath";

export type Category = {
  slug: string;
  name: I18nText;
  department: Department;
  /** Undefined for a top-level category. */
  parent?: string;
  art: ArtKey;
  /** Short line used on category tiles. */
  blurb?: I18nText;
};

export type ColourOption = {
  /** Stable key used in filters and URLs. */
  key: string;
  name: I18nText;
  /** Swatch colour. */
  hex: string;
};

export type Variant = {
  id: string;
  /** Apparel sizes ("0-3m", "2-3y"), or a single "one-size" for hardware. */
  size: string;
  colour: string;
  stock: number;
};

export type Product = {
  id: string;
  handle: string;
  name: I18nText;
  /** One-line summary shown on cards. */
  summary: I18nText;
  description: I18nText;
  details: I18nText[];
  care?: I18nText;
  category: string;
  department: Department;
  price: Fils;
  /** Original price, when the item is discounted. */
  compareAtPrice?: Fils;
  art: ArtKey;
  colours: ColourOption[];
  variants: Variant[];
  ageGroups: AgeGroup[];
  rating: number;
  reviewCount: number;
  /** Sort key for "newest" — days since launch, lower is newer. */
  daysOld: number;
  featured?: boolean;
  bestseller?: boolean;
};

export const AGE_GROUP_LABELS: Record<AgeGroup, I18nText> = {
  newborn: { en: "Newborn", ar: "حديثي الولادة" },
  "0-6m": { en: "0–6 months", ar: "0–6 أشهر" },
  "6-12m": { en: "6–12 months", ar: "6–12 شهراً" },
  "1-2y": { en: "1–2 years", ar: "سنة–سنتان" },
  "2-4y": { en: "2–4 years", ar: "2–4 سنوات" },
  "4-6y": { en: "4–6 years", ar: "4–6 سنوات" },
};

export const DEPARTMENT_LABELS: Record<Department, I18nText> = {
  clothing: { en: "Clothing", ar: "الملابس" },
  travel: { en: "Prams & travel", ar: "العربات والتنقّل" },
  nursery: { en: "Nursery", ar: "غرفة الطفل" },
  feeding: { en: "Feeding", ar: "الرضاعة والتغذية" },
  play: { en: "Toys & play", ar: "الألعاب" },
  bath: { en: "Bath & changing", ar: "الاستحمام والتغيير" },
};

/**
 * `curated` is the arranged order of a manual collection — it means "leave the
 * list alone". It's the default on those pages and a real option in the
 * dropdown there, but it's meaningless anywhere else, so listings that have no
 * curated order don't offer it.
 */
export const SORT_KEYS = [
  "featured",
  "curated",
  "newest",
  "priceAsc",
  "priceDesc",
  "rating",
] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export function isSortKey(value: string): value is SortKey {
  return (SORT_KEYS as readonly string[]).includes(value);
}

export function inStock(product: Product) {
  return product.variants.some((v) => v.stock > 0);
}

export function stockFor(product: Product, size?: string, colour?: string) {
  return product.variants
    .filter((v) => (size ? v.size === size : true))
    .filter((v) => (colour ? v.colour === colour : true))
    .reduce((total, v) => total + v.stock, 0);
}

export function sizesOf(product: Product) {
  return [...new Set(product.variants.map((v) => v.size))];
}
