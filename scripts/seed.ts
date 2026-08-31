/**
 * Loads starter data into the database.
 *
 *   npm run db:seed              # run any steps that haven't run yet
 *   npm run db:seed -- --reset   # wipe the catalogue and run everything again
 *
 * ## Why this is a ledger of steps
 *
 * Seeding used to be one all-or-nothing operation behind a single `_seeded`
 * marker, and that shipped a broken production deploy: the categories table was
 * added after the marker had been set, so it stayed empty and every category
 * page 404'd. Guarding on "are there any products?" had failed the same way
 * before it.
 *
 * Both are the same mistake — one flag standing in for "is every piece of
 * reference data present?" It answers correctly exactly once, then goes stale
 * the next time the schema grows.
 *
 * So each step records itself by name. A step added later runs on the next
 * deploy and only that step runs, which means new reference data reaches an
 * existing database without touching anything the shop owner has edited.
 *
 * Products are still seeded once and never re-inserted: they're the shop
 * owner's data, and a product they delete must not come back.
 */

import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";

import { getDb, schema } from "../src/db/client";
import { PRODUCTS } from "../src/lib/catalog/products";
import { SEED_CATEGORIES } from "../src/lib/catalog/taxonomy";
import { SEED_COLLECTIONS } from "../src/lib/catalog/seed-collections";
import { DEFAULT_SETTINGS, SETTINGS_KEYS } from "../src/lib/settings";

type Db = Awaited<ReturnType<typeof getDb>>;

/** Settings row holding the names of the steps that have run. */
const LEDGER_KEY = "_seed_steps";

/**
 * The single flag this ledger replaced. Databases seeded before the ledger
 * existed carry it, and it has to be honoured — see `readLedger`.
 */
const LEGACY_MARKER = "_seeded";

type Step = { name: string; run: (db: Db) => Promise<string> };

const STEPS: Step[] = [
  {
    name: "categories",
    async run(db) {
      const existing = new Set(
        (
          await db
            .select({ slug: schema.categories.slug })
            .from(schema.categories)
        ).map((r) => r.slug),
      );

      let added = 0;
      for (const [index, category] of SEED_CATEGORIES.entries()) {
        if (existing.has(category.slug)) continue;
        await db.insert(schema.categories).values({
          slug: category.slug,
          name: category.name,
          blurb: category.blurb ?? null,
          department: category.department,
          art: category.art,
          position: index,
        });
        added++;
      }
      return `${added} categor${added === 1 ? "y" : "ies"}`;
    },
  },

  {
    name: "collections",
    async run(db) {
      const existing = new Set(
        (
          await db
            .select({ slug: schema.collections.slug })
            .from(schema.collections)
        ).map((r) => r.slug),
      );

      let added = 0;
      for (const [index, collection] of SEED_COLLECTIONS.entries()) {
        if (existing.has(collection.slug)) continue;
        await db.insert(schema.collections).values({
          slug: collection.slug,
          name: collection.name,
          blurb: collection.blurb ?? null,
          rule: collection.rule,
          position: index,
          visible: true,
        });
        added++;
      }
      return `${added} collection(s)`;
    },
  },

  {
    name: "settings",
    async run(db) {
      const existing = new Set(
        (
          await db.select({ key: schema.settings.key }).from(schema.settings)
        ).map((r) => r.key),
      );

      const defaults = [
        [SETTINGS_KEYS.social, DEFAULT_SETTINGS.social],
        [SETTINGS_KEYS.shipping, DEFAULT_SETTINGS.shipping],
        [SETTINGS_KEYS.languages, DEFAULT_SETTINGS.languages],
      ] as const;

      let added = 0;
      for (const [key, value] of defaults) {
        if (existing.has(key)) continue;
        await db.insert(schema.settings).values({ key, value });
        added++;
      }
      return `${added} setting group(s)`;
    },
  },

  {
    name: "products",
    async run(db) {
      const existing = new Set(
        (
          (await db.execute(sql`SELECT id FROM products`)) as {
            rows: { id: string }[];
          }
        ).rows.map((r) => r.id),
      );

      let added = 0;
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
        added++;
      }
      return `${added} product(s)`;
    },
  },
];

async function readLedger(db: Db): Promise<Set<string>> {
  const [row] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, LEDGER_KEY))
    .limit(1);

  if (row) {
    const value = row.value as { steps?: string[] } | undefined;
    return new Set(value?.steps ?? []);
  }

  // No ledger. If the old all-or-nothing marker is present this is a database
  // seeded before the ledger existed — production, on the next deploy.
  //
  // Only `products` is carried over as done. Every other step skips rows that
  // already exist, so re-running them is a no-op that backfills anything
  // missing, which is the entire point. Products are different: re-running
  // would resurrect a product the shop owner had deleted.
  const [legacy] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, LEGACY_MARKER))
    .limit(1);

  if (legacy) {
    console.log(
      "seed: found a pre-ledger database, carrying products over as seeded",
    );
    return new Set(["products"]);
  }

  return new Set();
}

async function writeLedger(db: Db, done: Set<string>) {
  const value = { steps: [...done] };
  await db
    .insert(schema.settings)
    .values({ key: LEDGER_KEY, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
}

async function main() {
  const reset = process.argv.includes("--reset");
  const db = await getDb();

  if (reset) {
    // Order matters: membership and variants reference the rows above them.
    await db.delete(schema.collectionProducts);
    await db.delete(schema.variants);
    await db.delete(schema.products);
    await db.delete(schema.collections);
    await db.delete(schema.categories);
    await db.delete(schema.settings).where(eq(schema.settings.key, LEDGER_KEY));
    console.log("cleared existing catalogue");
  }

  const done = await readLedger(db);
  const pending = STEPS.filter((step) => !done.has(step.name));

  if (!pending.length) {
    console.log("seed: nothing pending, every step has run");
    return;
  }

  for (const step of pending) {
    const summary = await step.run(db);
    done.add(step.name);
    console.log(`seed: ${step.name} — ${summary}`);
  }

  await writeLedger(db, done);

  const [{ products: p, variants: v }] = (
    (await db.execute(
      sql`SELECT
            (SELECT count(*)::int FROM products) AS products,
            (SELECT count(*)::int FROM variants) AS variants`,
    )) as { rows: { products: number; variants: number }[] }
  ).rows;

  console.log(`seed: database now holds ${p} products, ${v} variants`);
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
