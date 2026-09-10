import { cache } from "react";
import { asc } from "drizzle-orm";

import { getDb, schema } from "@/db";
import { snapshot } from "@/lib/cache/snapshot";
import { COLOURS } from "./taxonomy";
import type { Product, Variant } from "./types";

/**
 * Database → domain mapping.
 *
 * The storefront's `Product` shape predates the database and is what every
 * component already expects, so rows are mapped back into it here rather than
 * changing the shape everywhere. `colours` in particular is derived: the DB
 * stores a colour key per variant, and the product's palette is the distinct
 * set of those keys resolved against the static COLOURS table.
 */

type Rows = {
  product: typeof schema.products.$inferSelect;
  variants: (typeof schema.variants.$inferSelect)[];
};

function toDomain({ product, variants }: Rows): Product {
  const colourKeys = [...new Set(variants.map((v) => v.colour))];

  return {
    id: product.id,
    handle: product.handle,
    name: product.name,
    summary: product.summary,
    description: product.description,
    details: product.details ?? [],
    care: product.care ?? undefined,
    category: product.category,
    department: product.department,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    art: product.art,
    images: product.images ?? [],
    colours: colourKeys
      // The shared palette first, then anything this product defined for
      // itself. A custom key is prefixed "c-", so the two never collide.
      .map(
        (key) =>
          COLOURS[key] ??
          (product.customColours ?? []).find((c) => c.key === key),
      )
      // A colour could be removed from taxonomy while variants still cite it;
      // drop rather than render an undefined swatch.
      .filter(Boolean),
    variants: variants.map((v): Variant => ({
      id: v.id,
      size: v.size,
      colour: v.colour,
      stock: v.stock,
    })),
    ageGroups: product.ageGroups ?? [],
    rating: product.rating,
    reviewCount: product.reviewCount,
    daysOld: Math.max(
      0,
      Math.round(
        (Date.now() - new Date(product.createdAt).getTime()) / 86_400_000,
      ),
    ),
    featured: product.featured,
    bestseller: product.bestseller,
  };
}

/**
 * Every product with its variants, loaded once per request.
 *
 * React's cache() memoises the promise for the lifetime of a server render,
 * so the layout (product index), the home page's four rails and the nav's
 * category counts share one pair of queries instead of each issuing their
 * own. Before this the home page loaded the whole catalogue five times.
 *
 * The catalogue is small enough (tens of products) that loading it whole and
 * filtering in memory is simpler and faster than round-tripping per facet. If
 * it grows past a few thousand, the filtering in queries.ts is what should move
 * into SQL — not this function.
 */
export const loadCatalogue = cache(() =>
  snapshot("catalogue", loadCatalogueFromDb),
);

async function loadCatalogueFromDb(): Promise<Product[]> {
  const db = await getDb();

  const [productRows, variantRows] = await Promise.all([
    db.select().from(schema.products).orderBy(asc(schema.products.handle)),
    db.select().from(schema.variants),
  ]);

  const byProduct = new Map<string, (typeof variantRows)[number][]>();
  for (const v of variantRows) {
    const list = byProduct.get(v.productId);
    if (list) list.push(v);
    else byProduct.set(v.productId, [v]);
  }

  return productRows.map((product) =>
    toDomain({ product, variants: byProduct.get(product.id) ?? [] }),
  );
}
