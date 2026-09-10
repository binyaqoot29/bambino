import type { MetadataRoute } from "next";

/**
 * The shop is live, so search engines are welcome on the catalogue. What is
 * personal or operational stays out: the admin, a shopper's bag, checkout,
 * account and order pages, and the search results page (endless URLs for
 * one page of content).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/*/cart",
        "/*/checkout",
        "/*/order/",
        "/*/account",
        "/*/wishlist",
        "/*/search",
      ],
    },
    sitemap: "https://bambino.ltd/sitemap.xml",
  };
}
