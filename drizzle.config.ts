import type { Config } from "drizzle-kit";

/**
 * Only used to *generate* SQL from src/db/schema.ts:
 *   npm run db:generate
 *
 * Applying migrations goes through scripts/migrate.ts instead, because that has
 * to work against both PGlite (local) and Neon (production) and drizzle-kit
 * wants one driver.
 */
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
} satisfies Config;
