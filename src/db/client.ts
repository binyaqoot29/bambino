import { cache } from "react";
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
 * Workers is detected by the runtime's own user agent. Used twice: to refuse
 * the PGlite fallback there, and to decide how the client is cached.
 */
const onWorkers =
  typeof navigator !== "undefined" &&
  navigator.userAgent?.includes("Cloudflare-Workers");

/**
 * Per request on Workers; per process everywhere else.
 *
 * Caching the client on globalThis is right on Node: a warm serverless
 * instance reuses its connection, and dev's module reloading doesn't open a
 * second PGlite on the same directory. On Cloudflare Workers it is exactly
 * wrong. A TCP socket opened during one request cannot be used by another —
 * the runtime binds I/O to the request that created it — so a cached client
 * works for the first request in an isolate and fails for every one after.
 * React's cache() scopes the instance to the current request instead, which
 * is what Cloudflare's own guidance amounts to: create the client inside the
 * handler, never in module scope.
 *
 * Opening a connection per request is the cost of that, and the reason to
 * put Hyperdrive in front of Supabase: it terminates TCP near the database,
 * so a fresh per-request connection from the edge is cheap.
 */
const perRequest = cache(() => create());

export function getDb(): Promise<Database> {
  if (onWorkers) return perRequest();
  globalForDb.__bambinoDb ??= create();
  return globalForDb.__bambinoDb as Promise<Database>;
}

export { schema };
