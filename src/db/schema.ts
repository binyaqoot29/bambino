import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import type { AgeGroup, ArtKey, Department } from "@/lib/catalog/types";

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

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(variants),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
}));

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type VariantRow = typeof variants.$inferSelect;
export type NewVariantRow = typeof variants.$inferInsert;
