/**
 * Applies the SQL in drizzle/ to whichever database is configured.
 *
 * Written by hand rather than using drizzle-kit's migrator because this has to
 * run against PGlite locally and Neon in production, and drizzle-kit binds to
 * one driver. Statements are tracked in a `_migrations` table so re-running is
 * a no-op.
 *
 *   npm run db:migrate
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { getDb } from "../src/db/client";
import { sql } from "drizzle-orm";

const DIR = join(process.cwd(), "drizzle");

async function main() {
  const db = await getDb();

  await db.execute(
    sql`CREATE TABLE IF NOT EXISTS _migrations (
          name text PRIMARY KEY,
          applied_at timestamptz NOT NULL DEFAULT now()
        )`,
  );

  const applied = new Set(
    (
      (await db.execute(sql`SELECT name FROM _migrations`)) as { rows: { name: string }[] }
    ).rows.map((r) => r.name),
  );

  const files = (await readdir(DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) continue;

    const body = await readFile(join(DIR, file), "utf8");
    // drizzle-kit separates statements with this marker.
    const statements = body
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await db.execute(sql.raw(statement));
    }

    await db.execute(
      sql`INSERT INTO _migrations (name) VALUES (${file})`,
    );
    console.log(`applied ${file} (${statements.length} statements)`);
    ran++;
  }

  console.log(
    ran === 0 ? "already up to date" : `done — ${ran} migration(s) applied`,
  );
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
