import { asc, eq, inArray } from "drizzle-orm";

import { getDb, schema } from "@/db";
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
    colours: colourKeys
      .map((key) => COLOURS[key])
      // A colour could be removed from taxonomy while variants still cite it;
      // drop rather than render an undefined swatch.
      .filter(Boolean),
    variants: variants.map(
      (v): Variant => ({
        id: v.id,
        size: v.size,
        colour: v.colour,
        stock: v.stock,
      }),
    ),
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
 * Every product with its variants.
 *
 * The catalogue is small enough (tens of products) that loading it whole and
 * filtering in memory is simpler and faster than round-tripping per facet. If
 * it grows past a few thousand, the filtering in queries.ts is what should move
 * into SQL — not this function.
 */
export async function loadCatalogue(): Promise<Product[]> {
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

export async function loadProductByHandle(
  handle: string,
): Promise<Product | undefined> {
  const db = await getDb();

  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.handle, handle))
    .limit(1);
  if (!product) return undefined;

  const variants = await db
    .select()
    .from(schema.variants)
    .where(eq(schema.variants.productId, product.id));

  return toDomain({ product, variants });
}

export async function loadProductById(
  id: string,
): Promise<Product | undefined> {
  const db = await getDb();

  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, id))
    .limit(1);
  if (!product) return undefined;

  const variants = await db
    .select()
    .from(schema.variants)
    .where(eq(schema.variants.productId, product.id));

  return toDomain({ product, variants });
}

export async function loadProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const db = await getDb();

  const productRows = await db
    .select()
    .from(schema.products)
    .where(inArray(schema.products.id, ids));
  if (productRows.length === 0) return [];

  const variantRows = await db
    .select()
    .from(schema.variants)
    .where(
      inArray(
        schema.variants.productId,
        productRows.map((p) => p.id),
      ),
    );

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
