import { cache } from "react";
import { asc } from "drizzle-orm";

import { getDb, schema } from "@/db";
import { DEPARTMENT_ORDER } from "./taxonomy";
import type { Category, Department } from "./types";

/**
 * Category reads.
 *
 * Wrapped in React's `cache` so the many places that need the category list in
 * one render — the nav, breadcrumbs, the homepage grid, a listing header —
 * share a single query per request instead of each issuing their own.
 */

export const loadCategories = cache(async (): Promise<Category[]> => {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.categories)
    .orderBy(asc(schema.categories.position), asc(schema.categories.slug));

  // Group by the fixed department order so the nav is stable regardless of
  // what order rows come back in.
  const byDepartment = new Map<Department, Category[]>();
  for (const row of rows) {
    const category: Category = {
      slug: row.slug,
      name: row.name,
      blurb: row.blurb ?? undefined,
      department: row.department,
      art: row.art,
    };
    const list = byDepartment.get(row.department);
    if (list) list.push(category);
    else byDepartment.set(row.department, [category]);
  }

  return DEPARTMENT_ORDER.flatMap((d) => byDepartment.get(d) ?? []);
});

export async function findCategory(slug: string): Promise<Category | undefined> {
  return (await loadCategories()).find((c) => c.slug === slug);
}

export async function categoriesInDepartment(department: Department) {
  return (await loadCategories()).filter((c) => c.department === department);
}
