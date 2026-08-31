import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import type { AgeGroup, ArtKey, Department } from "@/lib/catalog/types";
import type { CollectionRule } from "@/lib/catalog/collection-rules";

/**
 * Catalogue schema.
 *
 * What lives here vs. in code:
 * - **Products and variants** are data the shop owner edits, so they're rows.
 * - **Categories, departments, colours and illustration keys** stay in
 *   `src/lib/catalog/taxonomy.ts`. They're structural — the code branches on
 *   them and the illustrations are drawn per key — so letting an admin invent
 *   a new one at runtime would render nothing. The admin picks from them.
 *
 * Bilingual text is stored as a `{ en, ar }` JSON object rather than two
 * columns, so the shape matches the `I18nText` the app already passes around
 * and adding a third language later is a data change, not a migration.
 */

type I18n = { en: string; ar: string };

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    /** URL segment. Unique — it's how the storefront looks a product up. */
    handle: text("handle").notNull(),

    name: jsonb("name").$type<I18n>().notNull(),
    summary: jsonb("summary").$type<I18n>().notNull(),
    description: jsonb("description").$type<I18n>().notNull(),
    /** Bullet list; each bullet is bilingual. */
    details: jsonb("details").$type<I18n[]>().notNull().default([]),
    care: jsonb("care").$type<I18n | null>(),

    category: text("category").notNull(),
    department: text("department").$type<Department>().notNull(),

    /** Integer fils — never a float. 12.500 KD is 12500. */
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),

    art: text("art").$type<ArtKey>().notNull(),
    ageGroups: jsonb("age_groups").$type<AgeGroup[]>().notNull().default([]),

    rating: real("rating").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),

    featured: boolean("featured").notNull().default(false),
    bestseller: boolean("bestseller").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("products_handle_idx").on(table.handle)],
);

export const variants = pgTable(
  "variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      // Deleting a product takes its variants with it — there's no meaning to
      // an orphaned size/colour row.
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull(),
    colour: text("colour").notNull(),
    stock: integer("stock").notNull().default(0),
  },
  (table) => [
    uniqueIndex("variants_product_size_colour_idx").on(
      table.productId,
      table.size,
      table.colour,
    ),
  ],
);

/**
 * Categories are rows so the shop owner can add and rename them.
 *
 * Their `department` and `art` still come from the fixed lists in taxonomy.ts:
 * departments define the nav's top level and the /d/[department] URL space, and
 * each `art` key is a hand-drawn SVG — an invented value for either would have
 * nothing to render.
 */
export const categories = pgTable(
  "categories",
  {
    slug: text("slug").primaryKey(),
    name: jsonb("name").$type<I18n>().notNull(),
    blurb: jsonb("blurb").$type<I18n | null>(),
    department: text("department").$type<Department>().notNull(),
    art: text("art").$type<ArtKey>().notNull(),
    /** Controls order within a department, in the nav and on the homepage. */
    position: integer("position").notNull().default(0),
  },
);

/**
 * Small key/value store for editable site-wide settings — social links today.
 * A table rather than a column-per-setting so adding one is an insert, not a
 * migration.
 */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
});

/**
 * Collections — the merchandising shelves (`/collections/[slug]`).
 *
 * Two kinds, following the distinction every commerce admin ends up needing:
 *
 * - **`auto`** membership comes from a rule evaluated at read time, so it stays
 *   correct as the catalogue changes. "Sale" is every reduced product; nobody
 *   should have to re-curate it after editing a price.
 * - **`manual`** membership is an explicit, ordered list — a curated edit like
 *   "Eid picks" that no rule could infer.
 *
 * The three original collections seed as `auto`, which is what they already
 * were when they were hardcoded in routes.ts. What's new is that their names,
 * blurbs, order and visibility are now editable, and the shop owner can add
 * curated ones alongside them.
 */
export const collections = pgTable("collections", {
  slug: text("slug").primaryKey(),
  name: jsonb("name").$type<I18n>().notNull(),
  blurb: jsonb("blurb").$type<I18n | null>(),

  /** `null` for manual collections; a rule key for automatic ones. */
  rule: text("rule").$type<CollectionRule | null>(),

  /** Order in the nav and on the homepage. */
  position: integer("position").notNull().default(0),
  /** Hidden collections keep their products but drop out of the storefront. */
  visible: boolean("visible").notNull().default(true),
});

/**
 * Membership for manual collections. Automatic ones never have rows here —
 * their membership is computed, so storing it would immediately go stale.
 */
export const collectionProducts = pgTable(
  "collection_products",
  {
    collectionSlug: text("collection_slug")
      .notNull()
      .references(() => collections.slug, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    /** Curated order within the collection. */
    position: integer("position").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.collectionSlug, table.productId] }),
  ],
);

/**
 * Newsletter subscribers.
 *
 * This is the shop's only real audience data until checkout exists — the
 * footer signup used to discard the address it collected.
 *
 * Unsubscribing sets a timestamp rather than deleting the row: an address that
 * opted out must stay known, or the next import silently re-subscribes it.
 * Deleting from the admin is still available for an erasure request.
 */
export const subscribers = pgTable(
  "subscribers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    /** Which storefront language they signed up in — worth knowing before a send. */
    locale: text("locale").$type<"en" | "ar">().notNull().default("en"),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // Case-insensitive: addresses are compared lowercased before insert, so the
  // same person signing up twice updates rather than duplicates.
  (table) => [uniqueIndex("subscribers_email_idx").on(table.email)],
);

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(variants),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  items: many(collectionProducts),
}));

export const collectionProductsRelations = relations(
  collectionProducts,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionProducts.collectionSlug],
      references: [collections.slug],
    }),
    product: one(products, {
      fields: [collectionProducts.productId],
      references: [products.id],
    }),
  }),
);

export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;
export type SettingRow = typeof settings.$inferSelect;

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type VariantRow = typeof variants.$inferSelect;
export type NewVariantRow = typeof variants.$inferInsert;

export type CollectionRow = typeof collections.$inferSelect;
export type NewCollectionRow = typeof collections.$inferInsert;
export type CollectionProductRow = typeof collectionProducts.$inferSelect;

export type SubscriberRow = typeof subscribers.$inferSelect;
export type NewSubscriberRow = typeof subscribers.$inferInsert;
