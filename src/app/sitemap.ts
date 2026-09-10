import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";
import { serveFromSnapshot } from "@/lib/cache/snapshot";
import { loadCategories } from "@/lib/catalog/categories";
import { visibleCollections } from "@/lib/catalog/collections";
import { getAllProducts } from "@/lib/catalog/queries";
import { DEPARTMENT_ORDER } from "@/lib/catalog/taxonomy";
import { HELP_TOPICS, routes } from "@/lib/routes";
import { loadSettings } from "@/lib/site-settings";

const ORIGIN = "https://bambino.ltd";

export const dynamic = "force-dynamic";

/**
 * Every public page in every language the shop serves. Read from the same
 * snapshot as the storefront, so it costs nothing on a cache hit.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  serveFromSnapshot();
  const [products, categories, collections, settings] = await Promise.all([
    getAllProducts(),
    loadCategories(),
    visibleCollections(),
    loadSettings(),
  ]);
  const langs = settings.languages.arabicEnabled
    ? locales
    : locales.filter((l) => l === "en");

  const paths: string[] = [];
  for (const l of langs) {
    paths.push(routes.home(l), routes.about(l));
    for (const topic of HELP_TOPICS) paths.push(routes.help(l, topic));
    for (const d of DEPARTMENT_ORDER) paths.push(routes.department(l, d));
    for (const c of categories) paths.push(routes.category(l, c.slug));
    for (const c of collections) paths.push(routes.collection(l, c.slug));
    for (const p of products) paths.push(routes.product(l, p.handle));
  }
  return paths.map((path) => ({ url: `${ORIGIN}${path}` }));
}
