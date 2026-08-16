import "server-only";

/**
 * Guarded entry point for application code.
 *
 * The connection itself lives in ./client so the migrate and seed scripts can
 * import it from plain Node — `server-only` throws outside Next's bundler.
 * App code should import from here, so a stray import into a Client Component
 * fails loudly at build time instead of leaking the database into the browser
 * bundle.
 */

export { getDb, schema, type Database } from "./client";
