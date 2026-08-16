/**
 * Prepares the database at build time.
 *
 * Neon's connection string is marked Sensitive by the Vercel integration, so it
 * can't be pulled to a laptop — migrations have to run where the env var lives,
 * which is inside the build. This runs on every deploy:
 *
 *   1. apply any pending migrations (idempotent — tracked in _migrations)
 *   2. seed the catalogue, but only if it's empty
 *
 * The emptiness check is what makes this safe to run repeatedly: a fresh
 * database gets the starter catalogue, and one the shop owner has since edited
 * is never overwritten.
 *
 * With no DATABASE_URL (a local build) it exits quietly — local uses PGlite and
 * npm run db:migrate.
 */

import { spawnSync } from "node:child_process";

function run(script: string) {
  const result = spawnSync(
    process.execPath,
    [require.resolve("tsx/cli"), script],
    { stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("setup-db: no DATABASE_URL, skipping (local build)");
    return;
  }

  run("scripts/migrate.ts");

  const { getDb, schema } = await import("../src/db/client");
  const { count } = await import("drizzle-orm");
  const db = await getDb();
  const [{ n }] = await db.select({ n: count() }).from(schema.products);

  if (n > 0) {
    console.log(`setup-db: catalogue already has ${n} products, not seeding`);
    return;
  }

  console.log("setup-db: empty catalogue, seeding");
  run("scripts/seed.ts");
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
