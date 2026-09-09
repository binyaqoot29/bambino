/**
 * Normalises what `db.execute()` hands back.
 *
 * The two drivers disagree on shape and neither is wrong:
 *
 * - **postgres-js** (Supabase) returns the rows themselves, as an array with
 *   `count` and `command` hung off it.
 * - **PGlite** (local) returns `{ rows: [...] }`, like node-postgres.
 *
 * That difference is quiet and dangerous. Reading `.rows` works locally and is
 * `undefined` in production — which is how a build broke, and would have been
 * far worse in `takeStock`, where the row count is what decides whether an
 * order just oversold the shop.
 */
export function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  const rows = (result as { rows?: unknown })?.rows;
  return Array.isArray(rows) ? (rows as T[]) : [];
}
