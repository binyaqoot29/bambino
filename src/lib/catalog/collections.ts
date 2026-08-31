import { cache } from "react";
import { asc, eq } from "drizzle-orm";

import { getDb, schema } from "@/db";
import { applyCollectionRule, type CollectionRule } from "./collection-rules";
import type { I18nText, Product } from "./types";

/**
 * Collection reads.
 *
 * Cached per request like categories — the header, footer and homepage all ask
 * for the visible list while rendering one page.
 */

export type Collection = {
  slug: string;
  name: I18nText;
  blurb?: I18nText;
  /** `null` means membership is curated rather than computed. */
  rule: CollectionRule | null;
  position: number;
  visible: boolean;
};

export const loadCollections = cache(async (): Promise<Collection[]> => {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.collections)
    .orderBy(asc(schema.collections.position), asc(schema.collections.slug));

  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    blurb: row.blurb ?? undefined,
    rule: row.rule,
    position: row.position,
    visible: row.visible,
  }));
});

/** What the storefront shows. Hidden collections keep their data but drop out. */
export async function visibleCollections(): Promise<Collection[]> {
  return (await loadCollections()).filter((c) => c.visible);
}

export async function findCollection(
  slug: string,
): Promise<Collection | undefined> {
  return (await loadCollections()).find((c) => c.slug === slug);
}

/** Product ids of a manual collection, in their curated order. */
export const loadCollectionMembers = cache(
  async (slug: string): Promise<string[]> => {
    const db = await getDb();
    const rows = await db
      .select({ productId: schema.collectionProducts.productId })
      .from(schema.collectionProducts)
      .where(eq(schema.collectionProducts.collectionSlug, slug))
      .orderBy(asc(schema.collectionProducts.position));

    return rows.map((r) => r.productId);
  },
);

/**
 * Resolves a collection to its products.
 *
 * Automatic collections run their rule over the catalogue; manual ones look up
 * their curated list and return it in the order it was arranged, which is the
 * whole point of curating one.
 */
export async function collectionProducts(
  collection: Collection,
  catalogue: Product[],
): Promise<Product[]> {
  if (collection.rule) {
    return applyCollectionRule(collection.rule, catalogue);
  }

  const ids = await loadCollectionMembers(collection.slug);
  const byId = new Map(catalogue.map((p) => [p.id, p]));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is Product => p !== undefined);
}
