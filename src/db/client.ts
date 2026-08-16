import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "./schema";

/**
 * One Drizzle instance, two drivers.
 *
 * - **Production / any real DATABASE_URL** → Neon over HTTP. Serverless-safe:
 *   no connection pool to exhaust across lambda invocations.
 * - **Local, no DATABASE_URL** → PGlite, Postgres compiled to WASM, persisted
 *   under .pglite/. Same SQL dialect as Neon, so local behaviour matches
 *   production without Docker or a Postgres install.
 *
 * PGlite is imported lazily and only on the local path, so it never ends up in
 * a serverless bundle.
 *
 * Two things to know about the local PGlite database:
 * - It is **single-writer**. Running a script while `next dev` holds it will
 *   fail; stop the dev server first.
 * - Killing the dev server mid-write can leave the data directory unopenable
 *   ("RuntimeError: Aborted()"). It's disposable — `npm run db:reset` rebuilds
 *   it from the seed in a couple of seconds.
 */

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

const globalForDb = globalThis as unknown as {
  __bambinoDb?: Promise<unknown>;
};

async function create(): Promise<Database> {
  const url = process.env.DATABASE_URL;

  if (url) {
    return drizzleNeon(neon(url), { schema }) as unknown as Database;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not set. Production needs a Postgres connection string — see README, 'Database'.",
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
 * over the same files.
 */
export function getDb() {
  globalForDb.__bambinoDb ??= create();
  return globalForDb.__bambinoDb as Promise<Database>;
}

export { schema };
