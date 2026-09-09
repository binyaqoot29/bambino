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
     * Product photos are resized and re-encoded on the fly by Supabase
     * Storage's image transformations, through the loader below, so every
     * slot gets exactly the width it renders and browsers that accept WebP
     * get WebP. Workers has no built-in optimizer and Cloudflare Images is
     * billed per transformation, whereas this is part of the Supabase plan
     * the project already pays for (100 origin images a month included,
     * then $5 per thousand). The loader leaves non-Storage sources alone.
     *
     * Using a custom loader also means there is no /_next/image endpoint at
     * all, which is where Next 16.3.3's RCE lived.
     */
    loader: "custom",
    loaderFile: "./src/lib/images/supabase-loader.ts",

    /**
     * Widths the srcset may ask for. Capped at 2000 — stored photos are at
     * most 2000px on the long edge, so anything larger would only upscale —
     * and dense enough at the small end that a 2× phone screen showing a
     * 50vw card gets a 640 or 768, not a 1024.
     */
    deviceSizes: [320, 480, 640, 768, 1024, 1280, 1600, 2000],
    imageSizes: [64, 96, 128, 192, 256],
  },
};

export default nextConfig;
