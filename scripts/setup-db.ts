/**
 * Prepares the database at build time.
 *
 * Neon's connection string is marked Sensitive by the Vercel integration, so it
 * can't be pulled to a laptop — migrations have to run where the env var lives,
 * which is inside the build. This runs on every deploy:
 *
 *   1. apply any pending migrations (idempotent — tracked in _migrations)
 *   2. run any seed steps that haven't run yet
 *
 * Step two used to be guarded here, by a single marker meaning "seeding has
 * happened". That was wrong twice: reference data added after the marker was
 * set — categories, then collections — never reached an existing database, and
 * production shipped with empty tables both times.
 *
 * The guard now lives in the seed script, per step, which is the only place
 * that knows what each step would actually do. This just runs it.
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
  run("scripts/seed.ts");
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
