import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * PGlite ships a WASM build and resolves its own asset paths at runtime.
   * Bundling it breaks that resolution ("path argument must be of type
   * string... Received an instance of URL"), so it has to load as a plain
   * Node module. Only used for local development — production talks to Neon.
   */
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
