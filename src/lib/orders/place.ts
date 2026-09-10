import { eq, inArray, sql } from "drizzle-orm";

import { getDb, schema } from "@/db";
import { rowsOf } from "@/db/rows";
import type { Locale } from "@/i18n/config";
import { invalidateSnapshots } from "@/lib/cache/snapshot";
import { loadShipping } from "@/lib/site-settings";
import type { DeliveryAddress, OrderLine, PaymentMethod } from "./types";

/** What the browser asks for. Quantities and identity only — never prices. */
export type RequestedLine = {
  productId: string;
  size: string;
  colour: string;
  quantity: number;
};

export type PlaceOrderInput = {
  lines: RequestedLine[];
  customerName: string;
  phone: string;
  email: string;
  address: DeliveryAddress;
  paymentMethod: PaymentMethod;
  note: string;
  locale: Locale;
};

export type PlaceOrderResult =
  | { ok: true; reference: string }
  | {
      ok: false;
      reason: "empty" | "unavailable" | "out-of-stock";
      detail?: string[];
    };

/**
 * Reference codes.
 *
 * No 0/O or 1/I/L: this gets read out over the phone, and a driver mishearing
 * a digit is a real delivery that goes to the wrong door.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

function reference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const body = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
  return `BM-${body}`;
}

/**
 * Places an order.
 *
 * Two rules drive the shape of this:
 *
 * 1. **Prices come from the database, never from the request.** A Server Action
 *    is a public POST endpoint, so the browser is only trusted to say *what*
 *    and *how many*. Everything charged is looked up here.
 *
 * 2. **Stock and the order commit together, or not at all.** The decrement is
 *    still a single all-or-nothing UPDATE — that is what makes two people
 *    buying the last item safe, and no transaction isolation level gives it to
 *    you for free — but it now runs inside a transaction with the insert, so a
 *    failure after the stock moves rolls it back instead of needing a
 *    compensating write to put it right.
 */
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const wanted = input.lines.filter((l) => l.quantity > 0);
  if (!wanted.length) return { ok: false, reason: "empty" };

  const db = await getDb();

  const productIds = [...new Set(wanted.map((l) => l.productId))];
  const [products, variants, shipping] = await Promise.all([
    db
      .select()
      .from(schema.products)
      .where(inArray(schema.products.id, productIds)),
    db
      .select()
      .from(schema.variants)
      .where(inArray(schema.variants.productId, productIds)),
    loadShipping(),
  ]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const variantKey = (productId: string, size: string, colour: string) =>
    `${productId}::${size}::${colour}`;
  const variantByKey = new Map(
    variants.map((v) => [variantKey(v.productId, v.size, v.colour), v]),
  );

  const lines: OrderLine[] = [];
  const decrements: { variantId: string; quantity: number }[] = [];
  const missing: string[] = [];

  for (const line of wanted) {
    const product = productById.get(line.productId);
    const variant = variantByKey.get(
      variantKey(line.productId, line.size, line.colour),
    );

    // Gone from the catalogue since it went in the bag — a real case, because
    // bags live in localStorage and can be weeks old.
    if (!product || !variant) {
      missing.push(product ? product.name.en : line.productId);
      continue;
    }

    lines.push({
      productId: product.id,
      handle: product.handle,
      name: product.name,
      size: variant.size,
      colour: variant.colour,
      art: product.art,
      unitPrice: product.price,
      quantity: line.quantity,
    });
    decrements.push({ variantId: variant.id, quantity: line.quantity });
  }

  if (!lines.length)
    return { ok: false, reason: "unavailable", detail: missing };
  if (missing.length)
    return { ok: false, reason: "unavailable", detail: missing };

  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  const deliveryFee =
    subtotal >= shipping.freeThreshold ? 0 : shipping.flatRate;
  const codFee =
    input.paymentMethod === "cod" && shipping.codEnabled ? shipping.codFee : 0;
  const total = subtotal + deliveryFee + codFee;

  const row = {
    id: crypto.randomUUID(),
    reference: reference(),
    customerName: input.customerName,
    phone: input.phone,
    email: input.email || null,
    address: input.address,
    locale: input.locale,
    lines,
    paymentMethod: input.paymentMethod,
    // Cash on delivery is unpaid until the driver hands it over. A card
    // payment would be marked paid by its gateway callback, not here.
    paymentStatus: "unpaid" as const,
    subtotal,
    deliveryFee,
    codFee,
    total,
    note: input.note || null,
  };

  try {
    await db.transaction(async (tx) => {
      // Stock first: if it can't all be taken, nothing else should happen.
      const taken = await takeStock(tx as unknown as Db, decrements);
      if (!taken) throw new OutOfStock();
      await tx.insert(schema.orders).values(row);
    });
  } catch (error) {
    if (error instanceof OutOfStock)
      return { ok: false, reason: "out-of-stock" };
    throw error;
  }

  // Stock moved; the storefront's snapshot of it is now wrong.
  await invalidateSnapshots();
  return { ok: true, reference: row.reference };
}

/** Rolls the transaction back without dressing a normal outcome up as a fault. */
class OutOfStock extends Error {}

type Db = Awaited<ReturnType<typeof getDb>>;
type StockMove = { variantId: string; quantity: number };

function requestedCte(moves: StockMove[]) {
  return sql.join(
    moves.map((m) => sql`(${m.variantId}::text, ${m.quantity}::int)`),
    sql`, `,
  );
}

/**
 * Decrements every variant, or none of them.
 *
 * The guard is inside the statement: the UPDATE only matches when the count of
 * variants with enough stock equals the number requested. Two people buying the
 * last item at the same moment therefore can't both succeed — the second sees
 * the first's decrement, fails the count, and changes nothing.
 */
async function takeStock(db: Db, moves: StockMove[]): Promise<boolean> {
  const result = await db.execute(sql`
    WITH requested(variant_id, qty) AS (VALUES ${requestedCte(moves)}),
    sufficient AS (
      SELECT count(*)::int AS n
      FROM variants v
      JOIN requested r ON v.id = r.variant_id
      WHERE v.stock >= r.qty
    )
    UPDATE variants v
       SET stock = v.stock - r.qty
      FROM requested r, sufficient s
     WHERE v.id = r.variant_id
       AND s.n = (SELECT count(*)::int FROM requested)
    RETURNING v.id
  `);

  return rowsOf(result).length === moves.length;
}

/** Puts stock back — compensation, and cancelling an order. */
async function restoreStock(db: Db, moves: StockMove[]): Promise<void> {
  if (!moves.length) return;
  await db.execute(sql`
    WITH requested(variant_id, qty) AS (VALUES ${requestedCte(moves)})
    UPDATE variants v
       SET stock = v.stock + r.qty
      FROM requested r
     WHERE v.id = r.variant_id
  `);
}

/**
 * Returns an order's stock to the shelf.
 *
 * Used when an order is cancelled. Lines carry product/size/colour rather than
 * variant ids — the snapshot deliberately doesn't reference rows that can be
 * deleted — so the variants are resolved back by that triple, and any that no
 * longer exist are simply skipped.
 */
export async function restoreOrderStock(orderId: string): Promise<void> {
  const db = await getDb();
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .limit(1);
  if (!order) return;

  const productIds = [...new Set(order.lines.map((l) => l.productId))];
  if (!productIds.length) return;

  const variants = await db
    .select()
    .from(schema.variants)
    .where(inArray(schema.variants.productId, productIds));

  const byKey = new Map(
    variants.map((v) => [`${v.productId}::${v.size}::${v.colour}`, v.id]),
  );

  const moves: StockMove[] = [];
  for (const line of order.lines) {
    const id = byKey.get(`${line.productId}::${line.size}::${line.colour}`);
    if (id) moves.push({ variantId: id, quantity: line.quantity });
  }

  await restoreStock(db, moves);
}
