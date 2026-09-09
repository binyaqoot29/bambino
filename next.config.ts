import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * PGlite ships a WASM build and resolves its own asset paths at runtime.
   * Bundling it breaks that resolution ("path argument must be of type
   * string... Received an instance of URL"), so it has to load as a plain
   * Node module. Only used for local development — production talks to Neon.
   */
  serverExternalPackages: ["@electric-sql/pglite"],

  /**
   * …and keep it out of the deploy entirely.
   *
   * serverExternalPackages stops Turbopack bundling PGlite for local dev, but
   * the deploy trace then copies the whole package — 22MB of WASM — into a
   * Workers bundle that never runs the local-database branch. A third of the
   * upload, for code that is unreachable there. The global "/*" key applies to
   * every route.
   */
  outputFileTracingExcludes: {
    "/*": ["./node_modules/@electric-sql/pglite/**/*"],
  },

  images: {
    /**
     * No image optimizer.
     *
     * Photos are resized in the browser before upload — longest edge 1600px,
     * ~27KB — so there is little left for an optimizer to do. Workers has no
     * built-in one; the alternative is Cloudflare Images, which is billed per
     * transformation. Skipping it also removes the /_next/image endpoint
     * entirely, which is where Next's 16.3.3 RCE lived. remotePatterns below
     * still documents the only host photos may come from, and is enforced by
     * the upload allowlist rather than here.
     */
    unoptimized: true,

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
