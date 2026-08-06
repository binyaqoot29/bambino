import type { MetadataRoute } from "next";

/**
 * Blocks search engines while this is a client-review build.
 *
 * The catalogue is placeholder data and there's no checkout, so an indexed
 * "Bambino" storefront with fake products and dead buttons would be worse than
 * no listing at all — and a wrongly-indexed staging site is slow to undo.
 *
 * DELETE THIS FILE when the real shop launches.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
