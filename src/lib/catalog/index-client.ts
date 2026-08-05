import type { Locale } from "@/i18n/config";
import { PRODUCTS } from "./products";
import { SIZE_LABELS } from "./taxonomy";
import type { ArtKey } from "./types";

/**
 * A small, already-localised slice of the catalogue that client components
 * (bag drawer, cart lines, wishlist) can read without another round trip.
 * Roughly 6KB for the whole seed catalogue.
 */
export type MiniProduct = {
  id: string;
  handle: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  art: ArtKey;
  colours: Record<string, { name: string; hex: string }>;
};

export type ProductIndex = {
  products: Record<string, MiniProduct>;
  sizeLabels: Record<string, string>;
};

export function buildProductIndex(locale: Locale): ProductIndex {
  const products: Record<string, MiniProduct> = {};

  for (const p of PRODUCTS) {
    products[p.id] = {
      id: p.id,
      handle: p.handle,
      name: p.name[locale],
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      art: p.art,
      colours: Object.fromEntries(
        p.colours.map((c) => [c.key, { name: c.name[locale], hex: c.hex }]),
      ),
    };
  }

  const sizeLabels = Object.fromEntries(
    Object.entries(SIZE_LABELS).map(([key, value]) => [key, value[locale]]),
  );

  return { products, sizeLabels };
}
