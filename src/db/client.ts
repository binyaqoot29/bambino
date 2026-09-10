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

type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

const globalForDb = globalThis as unknown as {
  __bambinoDb?: Promise<unknown>;
};

/**
 * On Workers, a Hyperdrive binding named HYPERDRIVE wins over DATABASE_URL if
 * one is bound. None is bound today: measured from Kuwait, Hyperdrive's pool
 * added ~150 ms to every query against Supabase in Mumbai, so the Worker
 * connects directly and Smart Placement (wrangler.jsonc) moves it near the
 * database instead. The hook stays so a future binding needs no code change.
 * The import is lazy so nothing about OpenNext is loaded on Node.
 */
async function connectionString(): Promise<string | undefined> {
  if (onWorkers) {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const hyperdrive = (env as { HYPERDRIVE?: { connectionString: string } })
      .HYPERDRIVE;
    if (hyperdrive?.connectionString) return hyperdrive.connectionString;
  }
  return process.env.DATABASE_URL;
}

async function create(): Promise<Database> {
  const url = await connectionString();

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
      // No pipelining, and a small pool instead. postgres-js stacks
      // simultaneous queries onto one busy connection by default, and
      // Supabase's shared transaction pooler (Supavisor) does not support
      // that: a page running three queries in Promise.all hung forever on a
      // single connection (measured 2026-09-09). max_pipeline: 0 makes a busy
      // connection refuse further queries, so concurrent queries either take
      // another connection from the pool or wait for one — never pipeline.
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      // postgres-js queries pg_type on every new connection to learn custom
      // types. This schema uses none, and on Workers every request is a new
      // connection, so that is a pure round trip to Mumbai on every page.
      fetch_types: false,
      // Parsed by postgres-js (see its src/index.js) but absent from its
      // type definitions, hence the cast.
      ...({ max_pipeline: 0 } as object),
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
 * Opening a connection per request is the cost of that, and the reason for
 * Smart Placement: with the Worker next to the database, the handshake and
 * every query after it are a few milliseconds instead of a Gulf–India hop.
 */
const perRequest = cache(() => create());

export function getDb(): Promise<Database> {
  if (onWorkers) return perRequest();
  globalForDb.__bambinoDb ??= create();
  return globalForDb.__bambinoDb as Promise<Database>;
}

export { schema };
