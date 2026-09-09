import { desc, eq } from "drizzle-orm";

import { getDb, schema } from "@/db";
import type { OrderRow } from "@/db/schema";

export async function loadOrders(): Promise<OrderRow[]> {
  const db = await getDb();
  return db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
}

export async function findOrder(id: string): Promise<OrderRow | undefined> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .limit(1);
  return row;
}

/**
 * Looks an order up by its printed reference.
 *
 * This backs the customer's confirmation page, which is reachable by anyone
 * holding the link. The reference is the only thing guarding it, which is why
 * it's random rather than sequential — `BM-000042` would let anyone read every
 * order in the shop by counting.
 */
export async function findOrderByReference(
  reference: string,
): Promise<OrderRow | undefined> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.reference, reference.toUpperCase()))
    .limit(1);
  return row;
}

/** Totals for the admin's orders screen. */
export function summariseOrders(rows: OrderRow[]) {
  const open = rows.filter(
    (r) => r.status !== "delivered" && r.status !== "cancelled",
  );
  // Cancelled orders are excluded from revenue — the money was never taken.
  const earned = rows
    .filter((r) => r.status !== "cancelled")
    .reduce((n, r) => n + r.total, 0);

  return { total: rows.length, open: open.length, earned };
}
