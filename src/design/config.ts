/**
 * Two design directions live in this build so the client can compare them.
 *
 * - `studio` — the original: soft, brand-led, generous spacing.
 * - `market` — dense and commercial: white-led, orchid as the action colour,
 *   tighter radii, promo-driven layouts.
 *
 * The active design is a cookie, read once in the locale layout. It sets
 * `data-design` on <html> (which swaps the token block in globals.css) and
 * selects between per-design page components where the layout genuinely
 * differs — see src/design/registry.ts.
 *
 * This is review scaffolding. Before a real launch, pick one, delete the other
 * and drop the switcher; see README "Two designs".
 */

export const DESIGNS = ["studio", "market"] as const;
export type Design = (typeof DESIGNS)[number];

export const DEFAULT_DESIGN: Design = "studio";

export const DESIGN_COOKIE = "bambino_design";

export const DESIGN_META: Record<
  Design,
  { label: string; blurb: string }
> = {
  studio: {
    label: "Studio",
    blurb: "Soft, brand-led, spacious",
  },
  market: {
    label: "Market",
    blurb: "Dense, commercial, promo-led",
  },
};

export function isDesign(value: string | undefined): value is Design {
  return Boolean(value && (DESIGNS as readonly string[]).includes(value));
}

/**
 * Persist the chosen direction. Lives here rather than inline in the switcher
 * so the component body stays free of writes to globals.
 */
export function persistDesign(design: Design) {
  document.cookie = `${DESIGN_COOKIE}=${design}; path=/; max-age=31536000; samesite=lax`;
}
