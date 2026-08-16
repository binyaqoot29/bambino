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

/** Records that the one-time seed has run. */
const SEEDED_KEY = "_seeded";

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
  const { eq } = await import("drizzle-orm");
  const db = await getDb();

  // An explicit marker, not "are there any products?".
  //
  // The product count was the first guard and it was wrong: adding the
  // categories table later meant a database with products but no categories
  // skipped seeding and shipped a storefront with no categories at all. A
  // marker records that the initial seed has happened, whatever the schema
  // grows into, and equally means a product the shop owner deletes is never
  // resurrected by the next deploy.
  const [marker] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, SEEDED_KEY))
    .limit(1);

  if (marker) {
    console.log("setup-db: already seeded, leaving data alone");
    return;
  }

  console.log("setup-db: first run, seeding");
  run("scripts/seed.ts");

  await db
    .insert(schema.settings)
    .values({ key: SEEDED_KEY, value: { at: new Date().toISOString() } })
    .onConflictDoNothing();
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
