import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * PGlite ships a WASM build and resolves its own asset paths at runtime.
   * Bundling it breaks that resolution ("path argument must be of type
   * string... Received an instance of URL"), so it has to load as a plain
   * Node module. Only used for local development — production talks to Neon.
   */
  serverExternalPackages: ["@electric-sql/pglite"],

  images: {
    /**
     * Product photos, and nothing else.
     *
     * Scoped to this shop's own Blob store and the `products/` prefix inside
     * it rather than a wildcard: the image endpoint will fetch and serve
     * anything it's allowed to, so a loose pattern turns it into an open proxy
     * that runs on the shop's bill. The store id is public — it's in the URL of
     * every image the shop serves.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wamdmuvfiqmz8xuw.public.blob.vercel-storage.com",
        pathname: "/products/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
