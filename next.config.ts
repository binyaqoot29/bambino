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
     * Scoped to this project's Storage host and the one public bucket rather
     * than a wildcard: the image endpoint fetches and serves whatever it is
     * allowed to, so a loose pattern turns it into an open proxy running on the
     * shop's bill.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "seldftubunfrmgbnazxd.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
