import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * One Drizzle instance, two drivers.
 *
 * - **Deployed / any real DATABASE_URL** → Supabase Postgres over postgres-js.
 * - **Local, no DATABASE_URL** → PGlite, Postgres compiled to WASM, persisted
 *   under .pglite/. Same SQL dialect, so local behaviour matches production
 *   without Docker or a Postgres install.
 *
 * PGlite is imported lazily and only on the local path, so it never ends up in
 * a serverless bundle.
 *
 * Two things to know about the local PGlite database:
 * - It is **single-writer**. Running a script while `next dev` holds it will
 *   fail; stop the dev server first.
 * - A killed dev server can leave a stale `postmaster.pid`, after which every
 *   open blocks. Delete it, or `npm run db:reset` — the database is disposable.
 */

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

const globalForDb = globalThis as unknown as {
  __bambinoDb?: Promise<unknown>;
};

async function create(): Promise<Database> {
  const url = process.env.DATABASE_URL;

  if (url) {
    /**
     * Point this at Supabase's **transaction pooler** (port 6543), not the
     * direct connection. Each serverless invocation is its own short-lived
     * process, and enough of them against port 5432 will exhaust Postgres's
     * connection limit.
     *
     * `prepare: false` is required by that pooler: in transaction mode a
     * connection is handed to a different client between statements, so a
     * prepared statement made on one may not exist on the next.
     */
    const client = postgres(url, {
      prepare: false,
      // One connection per instance. The pooler multiplexes; opening more here
      // just holds slots the next invocation needs.
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    return drizzlePostgres(client, { schema }) as unknown as Database;
  }

  // Guard on "is this a real deployment", not on NODE_ENV. A local
  // `npm run build` runs with NODE_ENV=production and should still use PGlite;
  // what must never happen is a deployed instance silently falling back to an
  // empty, ephemeral WASM database.
  //
  // Cloudflare Workers sets neither VERCEL nor CI, so it's detected by the
  // runtime's own user agent. Without this, a missing DATABASE_URL on Workers
  // fell through to the PGlite branch — a package deliberately excluded from
  // that bundle — and surfaced as a module-not-found 500 instead of a message
  // naming the actual problem.
  const onWorkers =
    typeof navigator !== "undefined" &&
    navigator.userAgent?.includes("Cloudflare-Workers");
  if (process.env.VERCEL || process.env.CI || onWorkers) {
    throw new Error(
      "DATABASE_URL is not set. A deployed instance needs a Postgres connection string — see README, 'Database'.",
    );
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");
  const client = new PGlite(process.env.PGLITE_PATH ?? ".pglite");
  return drizzlePglite(client, { schema }) as unknown as Database;
}

/**
 * Cached on globalThis so dev's module reloading doesn't open a new PGlite
 * instance on every hot update — two instances on one directory would fight
 * over the same files — and so a warm serverless instance reuses its pool.
 */
export function getDb() {
  globalForDb.__bambinoDb ??= create();
  return globalForDb.__bambinoDb as Promise<Database>;
}

export { schema };
