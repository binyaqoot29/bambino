import { cache } from "react";

/**
 * Storefront reads from a snapshot in Cloudflare KV; everything else reads
 * the database.
 *
 * Why: on Workers every request opens a fresh connection to Supabase in
 * Mumbai, and from Kuwait that handshake alone is most of a second before the
 * first row arrives. The catalogue changes a few times a day at most, so the
 * storefront serves it from KV — a few milliseconds at the edge — and the
 * database is consulted only when the snapshot is missing.
 *
 * Correctness rules, in order of importance:
 *
 * 1. **Off by default.** A loader only reads KV after `serveFromSnapshot()`
 *    has been called in the current request. The `[lang]` layout calls it,
 *    and so do the admin's catalogue and settings *pages* — but never a
 *    Server Action, which runs in its own request. Every write path sees
 *    the database as it is. An action that read a stale product to decide
 *    which photos to release would delete the wrong files — that is the
 *    failure this rule exists to prevent. Admin pages are safe because the
 *    admin's own saves bump the generation before redirecting, and a KV
 *    write is visible immediately in the location that made it.
 *
 * 2. **One generation number, not per-key deletes.** Every write calls
 *    `invalidateSnapshots()`, which bumps a single `gen` key. Data keys are
 *    namespaced by generation, so a bump orphans every old entry at once and
 *    there is no list of keys to keep in sync. Orphans expire on their own.
 *
 * 3. **Staleness is bounded, not zero.** KV is eventually consistent and edge
 *    reads are cached for the minimum 60 s, so the storefront can show the
 *    previous state for up to a minute after a save or an order. Stock is
 *    never decided from the snapshot: `placeOrder` runs against the database
 *    inside a transaction, so the worst case is a product page that says
 *    "in stock" a moment longer than it should, and checkout says otherwise.
 *
 * Without the binding — local dev, tests — every call is a pass-through.
 */

const GEN_KEY = "v1:gen";
/** Edge cache for KV reads. 60 s is the minimum Cloudflare allows. */
const EDGE_TTL_SECONDS = 60;
/** Data entries expire on their own; a generation bump orphans them sooner. */
const ENTRY_TTL_SECONDS = 6 * 60 * 60;

/** The slice of Cloudflare's KV binding this module uses. */
interface KVStore {
  get(
    key: string,
    options: { type: "text"; cacheTtl?: number },
  ): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
}

const onWorkers =
  typeof navigator !== "undefined" &&
  navigator.userAgent?.includes("Cloudflare-Workers");

/** Per-request switch. React's cache() scopes it to the current render. */
const requestMode = cache((): { snapshot: boolean } => ({ snapshot: false }));

/** Opt the current request into snapshot reads. Call it in a storefront layout. */
export function serveFromSnapshot(): void {
  requestMode().snapshot = true;
}

async function binding(): Promise<
  { store: KVStore; waitUntil: (p: Promise<unknown>) => void } | undefined
> {
  if (!onWorkers) return undefined;
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env, ctx } = await getCloudflareContext({ async: true });
  const store = (env as { CACHE_KV?: KVStore }).CACHE_KV;
  if (!store) return undefined;
  return { store, waitUntil: (p) => ctx.waitUntil(p) };
}

/** Current generation, read once per request. */
const generation = cache(async (store: KVStore): Promise<string> => {
  return (
    (await store.get(GEN_KEY, { type: "text", cacheTtl: EDGE_TTL_SECONDS })) ??
    "0"
  );
});

/**
 * Returns `load()`'s result, from the snapshot when this request opted in and
 * the entry exists, otherwise from `load()` (and stores it for next time).
 *
 * `name` must be stable for a given dataset and safe as a key segment.
 */
export async function snapshot<T>(
  name: string,
  load: () => Promise<T>,
): Promise<T> {
  if (!requestMode().snapshot) return load();
  const kv = await binding();
  if (!kv) return load();

  let key: string | undefined;
  try {
    const gen = await generation(kv.store);
    key = `v1:${gen}:${name}`;
    const hit = await kv.store.get(key, {
      type: "text",
      cacheTtl: EDGE_TTL_SECONDS,
    });
    if (hit !== null) return JSON.parse(hit) as T;
  } catch (error) {
    // A cache that fails must degrade to the database, never to an error page.
    console.error("snapshot read failed", name, error);
  }

  const value = await load();
  if (key) {
    const put = kv.store
      .put(key, JSON.stringify(value), { expirationTtl: ENTRY_TTL_SECONDS })
      .catch((error) => console.error("snapshot write failed", name, error));
    kv.waitUntil(put);
  }
  return value;
}

/**
 * Marks every snapshot stale. Call after any write the storefront can see:
 * products, variants, categories, collections, settings, and stock changes
 * from orders. Cheap enough to call unconditionally.
 */
export async function invalidateSnapshots(): Promise<void> {
  const kv = await binding();
  if (!kv) return;
  try {
    await kv.store.put(GEN_KEY, String(Date.now()));
  } catch (error) {
    console.error("snapshot invalidation failed", error);
  }
}
