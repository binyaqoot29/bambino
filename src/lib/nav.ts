import type { Locale } from "@/i18n/config";
import { CATEGORIES, DEPARTMENT_ORDER } from "@/lib/catalog/taxonomy";
import { AGE_GROUP_LABELS, DEPARTMENT_LABELS, type ArtKey } from "@/lib/catalog/types";
import { countsByCategory } from "@/lib/catalog/queries";
import { routes } from "@/lib/routes";

export type NavCategory = {
  slug: string;
  label: string;
  blurb?: string;
  href: string;
  art: ArtKey;
  count: number;
};

export type NavDepartment = {
  key: string;
  label: string;
  href: string;
  categories: NavCategory[];
};

/** Everything the header needs, flattened and localised for the client. */
export async function buildNav(locale: Locale): Promise<NavDepartment[]> {
  // One pass for every category count, rather than a query per category.
  const counts = await countsByCategory();

  return DEPARTMENT_ORDER.map((department) => ({
    key: department,
    label: DEPARTMENT_LABELS[department][locale],
    href: routes.department(locale, department),
    categories: CATEGORIES.filter((c) => c.department === department).map(
      (c) => ({
        slug: c.slug,
        label: c.name[locale],
        blurb: c.blurb?.[locale],
        href: routes.category(locale, c.slug),
        art: c.art,
        count: counts[c.slug] ?? 0,
      }),
    ),
  }));
}

export type AgeLink = { key: string; label: string; href: string };

export function buildAgeLinks(locale: Locale): AgeLink[] {
  return (Object.keys(AGE_GROUP_LABELS) as (keyof typeof AGE_GROUP_LABELS)[]).map(
    (key) => ({
      key,
      label: AGE_GROUP_LABELS[key][locale],
      href: `${routes.collection(locale, "new-in")}?age=${key}`,
    }),
  );
}
