import type { CollectionRule } from "./collection-rules";
import type { I18nText } from "./types";

/**
 * The collections the storefront launched with.
 *
 * These were constants in `src/lib/routes.ts` until collections became editable.
 * All three are rule-driven, which is what they already were — the rule is just
 * named now instead of being an `if` in the page.
 */
export const SEED_COLLECTIONS: {
  slug: string;
  name: I18nText;
  blurb?: I18nText;
  rule: CollectionRule;
}[] = [
  {
    slug: "new-in",
    name: { en: "New in", ar: "وصل حديثاً" },
    blurb: {
      en: "Everything that landed in the last few weeks.",
      ar: "كل ما وصل خلال الأسابيع الماضية.",
    },
    rule: "new-in",
  },
  {
    slug: "bestsellers",
    name: { en: "Bestsellers", ar: "الأكثر مبيعاً" },
    blurb: {
      en: "The pieces Kuwait parents keep coming back for.",
      ar: "القطع التي يعود إليها أهالي الكويت دائماً.",
    },
    rule: "bestsellers",
  },
  {
    slug: "sale",
    name: { en: "Sale", ar: "التخفيضات" },
    blurb: {
      en: "Reduced while stock lasts.",
      ar: "بأسعار مخفّضة حتى نفاد الكمية.",
    },
    rule: "sale",
  },
];
