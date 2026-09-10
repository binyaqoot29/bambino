import { eq } from "drizzle-orm";

import { getDb, schema } from "@/db";

type Db = Awaited<ReturnType<typeof getDb>>;

/**
 * The id for a product being created.
 *
 * A product's id is its handle at creation and never changes, while the
 * handle can be renamed later. A new product given a handle that a renamed
 * product once used would otherwise collide with that old row's primary key
 * and the save would fail, so the id gets a short suffix in that one case.
 */
export async function freeProductId(db: Db, handle: string): Promise<string> {
  const [taken] = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.id, handle))
    .limit(1);
  return taken ? `${handle}-${crypto.randomUUID().slice(0, 8)}` : handle;
}
