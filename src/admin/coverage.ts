import { getDb, schema } from "@/db";

/**
 * Translation coverage.
 *
 * Missing Arabic doesn't break the Arabic site — it falls back to English — so
 * nothing errors and nobody notices. That silence is exactly why it's worth a
 * report: an untranslated product is invisible until a shopper hits it.
 *
 * A field counts as missing when the English is filled in and the Arabic isn't.
 * A field blank in both languages is simply unused, not untranslated.
 */

export type CoverageGap = {
  kind: "product" | "category" | "collection";
  id: string;
  label: string;
  href: string;
  /** Dictionary keys of the fields lacking Arabic. */
  fields: ("name" | "summary" | "description" | "blurb")[];
};

type I18n = { en: string; ar: string } | null | undefined;

function lacksArabic(value: I18n): boolean {
  return Boolean(value?.en?.trim()) && !value?.ar?.trim();
}

export async function findTranslationGaps(): Promise<CoverageGap[]> {
  const db = await getDb();

  const [products, categories, collections] = await Promise.all([
    db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        summary: schema.products.summary,
        description: schema.products.description,
      })
      .from(schema.products),
    db
      .select({
        slug: schema.categories.slug,
        name: schema.categories.name,
        blurb: schema.categories.blurb,
      })
      .from(schema.categories),
    db
      .select({
        slug: schema.collections.slug,
        name: schema.collections.name,
        blurb: schema.collections.blurb,
      })
      .from(schema.collections),
  ]);

  const gaps: CoverageGap[] = [];

  for (const row of products) {
    const fields: CoverageGap["fields"] = [];
    if (lacksArabic(row.name)) fields.push("name");
    if (lacksArabic(row.summary)) fields.push("summary");
    if (lacksArabic(row.description)) fields.push("description");
    if (fields.length) {
      gaps.push({
        kind: "product",
        id: row.id,
        label: row.name.en,
        href: `/admin/products/${row.id}`,
        fields,
      });
    }
  }

  for (const row of categories) {
    const fields: CoverageGap["fields"] = [];
    if (lacksArabic(row.name)) fields.push("name");
    if (lacksArabic(row.blurb)) fields.push("blurb");
    if (fields.length) {
      gaps.push({
        kind: "category",
        id: row.slug,
        label: row.name.en,
        href: `/admin/categories/${row.slug}`,
        fields,
      });
    }
  }

  for (const row of collections) {
    const fields: CoverageGap["fields"] = [];
    if (lacksArabic(row.name)) fields.push("name");
    if (lacksArabic(row.blurb)) fields.push("blurb");
    if (fields.length) {
      gaps.push({
        kind: "collection",
        id: row.slug,
        label: row.name.en,
        href: `/admin/collections/${row.slug}`,
        fields,
      });
    }
  }

  return gaps;
}
