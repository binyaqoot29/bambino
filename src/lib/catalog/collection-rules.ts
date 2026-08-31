import { inStock, type Product } from "./types";

/**
 * Rules for automatic collections.
 *
 * A rule is a named way of selecting products, evaluated at read time. Keeping
 * them here — rather than as stored membership — is what makes them stay right:
 * reduce a price and the product joins Sale without anyone re-curating it.
 *
 * The keys are fixed rather than editable for the usual reason the rest of the
 * taxonomy is: the code branches on them. A shop owner who needs a selection no
 * rule expresses makes a manual collection instead.
 */

export const COLLECTION_RULES = ["new-in", "bestsellers", "sale"] as const;
export type CollectionRule = (typeof COLLECTION_RULES)[number];

export function isCollectionRule(value: string): value is CollectionRule {
  return (COLLECTION_RULES as readonly string[]).includes(value);
}

export const COLLECTION_RULE_LABELS: Record<
  CollectionRule,
  { en: string; ar: string }
> = {
  "new-in": { en: "Newest first", ar: "الأحدث أولاً" },
  bestsellers: {
    en: "Bestsellers and top rated",
    ar: "الأكثر مبيعاً والأعلى تقييماً",
  },
  sale: { en: "Anything reduced", ar: "كل ما هو مخفّض" },
};

/** Applies a rule to the catalogue. Order matters — it's the display order. */
export function applyCollectionRule(
  rule: CollectionRule,
  products: Product[],
): Product[] {
  switch (rule) {
    case "new-in":
      return [...products].sort((a, b) => a.daysOld - b.daysOld);
    case "bestsellers":
      // A flagged bestseller, or something rated highly that can actually be
      // bought — a five-star product that's out of stock is a bad shelf.
      return products.filter(
        (p) => p.bestseller || (p.rating >= 4.7 && inStock(p)),
      );
    case "sale":
      return products.filter((p) => p.compareAtPrice);
  }
}
