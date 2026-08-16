import type { ListingParams } from "@/components/plp/search-params";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Product } from "@/lib/catalog/types";

/**
 * The contract every design direction implements. Route files talk to the
 * dispatchers in this folder and never to a specific design, so adding or
 * removing a direction touches nothing under src/app.
 */

export type Crumb = { label: string; href?: string };

export type HomeProps = {
  locale: Locale;
  dict: Dictionary;
};

export type ListingProps = {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  /** The candidate set before facets — facet counts are derived from it. */
  products: Product[];
  params: ListingParams;
  basePath: string;
  locale: Locale;
  dict: Dictionary;
};

export type ProductViewProps = {
  product: Product;
  related: Product[];
  locale: Locale;
  dict: Dictionary;
};
