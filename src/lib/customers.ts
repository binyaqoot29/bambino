import "server-only";

import { and, desc, eq, gt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";

import { getDb, schema } from "@/db";
import type { CustomerRow, OrderRow } from "@/db/schema";
import type { Locale } from "@/i18n/config";
import type { DeliveryAddress } from "@/lib/orders/types";

/**
 * Customer accounts, in the shop's own database.
 *
 * No third-party identity service: the stack is GitHub, Cloudflare, Supabase
 * and GoDaddy, and an account here is an email, a password hash and the
 * checkout fields. Passwords are PBKDF2-SHA256 with a per-account salt via
 * Web Crypto, which runs the same on Workers and Node. Sessions are random
 * tokens in an httpOnly cookie; the table stores only their SHA-256.
 */

const COOKIE = "bambino_customer";
const SESSION_DAYS = 30;
const ITERATIONS = 100_000;

const enc = new TextEncoder();
const b64 = (bytes: ArrayBuffer | Uint8Array) =>
  Buffer.from(
    bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes),
  ).toString("base64url");
// A fresh Uint8Array over its own ArrayBuffer: Web Crypto's types reject a
// view over a possibly-shared buffer, which is what Buffer hands back.
const fromB64 = (text: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(Buffer.from(text, "base64url"));

async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(bits)}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterations || !salt || !hash) return false;
  const bits = new Uint8Array(
    await derive(password, fromB64(salt), Number(iterations)),
  );
  const expected = fromB64(hash);
  if (bits.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ expected[i];
  return diff === 0;
}

async function sha256(text: string): Promise<string> {
  return b64(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

/* --------------------------------------------------------------------------
 * Accounts
 * ----------------------------------------------------------------------- */

export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function findCustomerByEmail(
  email: string,
): Promise<CustomerRow | undefined> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(schema.customers)
    .where(eq(schema.customers.email, normaliseEmail(email)))
    .limit(1);
  return row;
}

export async function createCustomer(input: {
  email: string;
  password: string;
  name: string;
  locale: Locale;
}): Promise<CustomerRow> {
  const db = await getDb();
  const row = {
    id: crypto.randomUUID(),
    email: normaliseEmail(input.email),
    passwordHash: await hashPassword(input.password),
    name: input.name.trim().slice(0, 80),
    phone: "",
    address: null,
    locale: input.locale,
  };
  await db.insert(schema.customers).values(row);
  return (await findCustomerByEmail(row.email))!;
}

export async function updateCustomer(
  id: string,
  patch: Partial<Pick<CustomerRow, "name" | "phone" | "address" | "locale">>,
): Promise<void> {
  const db = await getDb();
  await db
    .update(schema.customers)
    .set(patch)
    .where(eq(schema.customers.id, id));
}

export async function setCustomerPassword(
  id: string,
  password: string,
): Promise<void> {
  const db = await getDb();
  await db
    .update(schema.customers)
    .set({ passwordHash: await hashPassword(password) })
    .where(eq(schema.customers.id, id));
  // Every other device is signed out: a changed password should mean that.
  await db
    .delete(schema.customerSessions)
    .where(eq(schema.customerSessions.customerId, id));
}

/* --------------------------------------------------------------------------
 * Sessions
 * ----------------------------------------------------------------------- */

export async function startSession(customerId: string): Promise<void> {
  const token = b64(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const db = await getDb();
  await db.insert(schema.customerSessions).values({
    id: await sha256(token),
    customerId,
    expiresAt,
  });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db
      .delete(schema.customerSessions)
      .where(eq(schema.customerSessions.id, await sha256(token)));
  }
  jar.delete(COOKIE);
}

/** The signed-in customer for this request, or null. Read once per request. */
export const currentCustomer = cache(async (): Promise<CustomerRow | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const [row] = await db
    .select({ customer: schema.customers })
    .from(schema.customerSessions)
    .innerJoin(
      schema.customers,
      eq(schema.customers.id, schema.customerSessions.customerId),
    )
    .where(
      and(
        eq(schema.customerSessions.id, await sha256(token)),
        gt(schema.customerSessions.expiresAt, sql`now()`),
      ),
    )
    .limit(1);
  return row?.customer ?? null;
});

/* --------------------------------------------------------------------------
 * Orders
 * ----------------------------------------------------------------------- */

/** Orders placed with the customer's email, newest first. */
export async function loadCustomerOrders(email: string): Promise<OrderRow[]> {
  const db = await getDb();
  return db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.email, normaliseEmail(email)))
    .orderBy(desc(schema.orders.createdAt));
}

/** What checkout should start with for a signed-in customer. */
export function checkoutPrefill(
  customer: CustomerRow | null,
): Record<string, string> {
  if (!customer) return {};
  const a = customer.address;
  return {
    customerName: customer.name,
    phone: customer.phone,
    email: customer.email,
    governorate: a?.governorate ?? "",
    area: a?.area ?? "",
    block: a?.block ?? "",
    street: a?.street ?? "",
    building: a?.building ?? "",
    extra: a?.extra ?? "",
  };
}

/**
 * After a successful order, remember what a signed-in customer typed, so
 * the next checkout starts filled in. Only fills what the account lacks.
 */
export async function rememberFromOrder(
  customer: CustomerRow,
  input: { name: string; phone: string; address: DeliveryAddress },
): Promise<void> {
  const patch: Partial<CustomerRow> = {};
  if (!customer.name) patch.name = input.name;
  if (!customer.phone) patch.phone = input.phone;
  if (!customer.address) patch.address = input.address;
  if (Object.keys(patch).length) await updateCustomer(customer.id, patch);
}
