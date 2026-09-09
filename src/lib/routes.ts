import type { Locale } from "@/i18n/config";

export const HELP_TOPICS = [
  "contact",
  "delivery",
  "returns",
  "size-guide",
  "faq",
] as const;
export type HelpTopic = (typeof HELP_TOPICS)[number];
export function isHelpTopic(value: string): value is HelpTopic {
  return (HELP_TOPICS as readonly string[]).includes(value);
}

export const routes = {
  home: (l: Locale) => `/${l}`,
  category: (l: Locale, slug: string) => `/${l}/c/${slug}`,
  department: (l: Locale, department: string) => `/${l}/d/${department}`,
  collection: (l: Locale, collection: string) =>
    `/${l}/collections/${collection}`,
  product: (l: Locale, handle: string) => `/${l}/p/${handle}`,
  cart: (l: Locale) => `/${l}/cart`,
  checkout: (l: Locale) => `/${l}/checkout`,
  orderConfirmation: (l: Locale, reference: string) =>
    `/${l}/order/${reference}`,
  wishlist: (l: Locale) => `/${l}/wishlist`,
  search: (l: Locale, query?: string) =>
    query ? `/${l}/search?q=${encodeURIComponent(query)}` : `/${l}/search`,
  about: (l: Locale) => `/${l}/about`,
  help: (l: Locale, topic?: HelpTopic) =>
    topic ? `/${l}/help/${topic}` : `/${l}/help`,
} as const;

/**
 * Collection slugs, labels and blurbs used to live here as fixed constants.
 * They're rows now — see `src/lib/catalog/collections.ts` — because the shop
 * owner adds, renames, reorders and hides them from the admin panel.
 */
