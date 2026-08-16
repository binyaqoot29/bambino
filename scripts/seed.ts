/**
 * Loads the hand-written catalogue into the database.
 *
 *   npm run db:seed          # insert only what's missing
 *   npm run db:seed -- --reset   # wipe products/variants first
 *
 * src/lib/catalog/products.ts stays in the repo as the seed source. It is no
 * longer what the storefront reads — that's the database now — but it's a
 * useful fixture for a fresh environment.
 */

import { sql } from "drizzle-orm";

import { getDb, schema } from "../src/db/client";
import { PRODUCTS } from "../src/lib/catalog/products";

async function main() {
  const reset = process.argv.includes("--reset");
  const db = await getDb();

  if (reset) {
    // Variants cascade, but being explicit reads better than relying on it.
    await db.delete(schema.variants);
    await db.delete(schema.products);
    console.log("cleared existing catalogue");
  }

  const existing = new Set(
    (
      (await db.execute(sql`SELECT id FROM products`)) as { rows: { id: string }[] }
    ).rows.map((r) => r.id),
  );

  let inserted = 0;
  for (const product of PRODUCTS) {
    if (existing.has(product.id)) continue;

    await db.insert(schema.products).values({
      id: product.id,
      handle: product.handle,
      name: product.name,
      summary: product.summary,
      description: product.description,
      details: product.details,
      care: product.care ?? null,
      category: product.category,
      department: product.department,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? null,
      art: product.art,
      ageGroups: product.ageGroups,
      rating: product.rating,
      reviewCount: product.reviewCount,
      featured: product.featured ?? false,
      bestseller: product.bestseller ?? false,
    });

    if (product.variants.length) {
      await db.insert(schema.variants).values(
        product.variants.map((v) => ({
          id: v.id,
          productId: product.id,
          size: v.size,
          colour: v.colour,
          stock: v.stock,
        })),
      );
    }
    inserted++;
  }

  const [{ products: p, variants: v }] = (
    (await db.execute(
      sql`SELECT
            (SELECT count(*)::int FROM products) AS products,
            (SELECT count(*)::int FROM variants) AS variants`,
    )) as { rows: { products: number; variants: number }[] }
  ).rows;

  console.log(
    `seeded ${inserted} new product(s) — database now holds ${p} products, ${v} variants`,
  );
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
