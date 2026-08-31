import { desc, sql } from "drizzle-orm";

import { getDb, schema } from "@/db";
import type { SubscriberRow } from "@/db/schema";
import type { Locale } from "@/i18n/config";

/**
 * Newsletter subscribers.
 *
 * The footer form used to discard what it collected — it flipped to a
 * thank-you and threw the address away. This is where it goes now.
 */

/**
 * Deliberately permissive. Strict email regexes reject valid addresses far more
 * often than they catch typos, and the real proof an address works is a
 * delivered email — which is a sending concern, not a validation one.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL.test(value.trim()) && value.trim().length <= 254;
}

export type SubscribeResult = "added" | "already" | "invalid";

export async function subscribe(
  rawEmail: string,
  locale: Locale,
): Promise<SubscribeResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email)) return "invalid";

  const db = await getDb();

  // Signing up again re-subscribes rather than erroring or duplicating: from
  // the visitor's side it's the same action, and someone who previously opted
  // out is opting back in.
  const existing = await db
    .select({ id: schema.subscribers.id })
    .from(schema.subscribers)
    .where(sql`lower(${schema.subscribers.email}) = ${email}`)
    .limit(1);

  if (existing.length) {
    await db
      .update(schema.subscribers)
      .set({ unsubscribedAt: null, locale })
      .where(sql`lower(${schema.subscribers.email}) = ${email}`);
    return "already";
  }

  // The conflict clause matters even though the check above usually catches it:
  // two submissions of the same address at once would both pass the check, and
  // the second insert would violate the unique index and 500 a public form.
  await db
    .insert(schema.subscribers)
    .values({ id: crypto.randomUUID(), email, locale })
    .onConflictDoUpdate({
      target: schema.subscribers.email,
      set: { unsubscribedAt: null, locale },
    });

  return "added";
}

export async function loadSubscribers(): Promise<SubscriberRow[]> {
  const db = await getDb();
  return db
    .select()
    .from(schema.subscribers)
    .orderBy(desc(schema.subscribers.createdAt));
}

export type SubscriberStats = {
  total: number;
  active: number;
  thisWeek: number;
};

export function summarise(rows: SubscriberRow[]): SubscriberStats {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    total: rows.length,
    active: rows.filter((r) => !r.unsubscribedAt).length,
    thisWeek: rows.filter((r) => r.createdAt.getTime() >= weekAgo).length,
  };
}

/**
 * CSV for the mailing tool the shop actually sends from.
 *
 * Fields are quoted and embedded quotes doubled — an address can't contain a
 * comma, but the locale and dates sit beside it and the file shouldn't be
 * fragile. Only active subscribers are exported: someone who opted out must not
 * end up back on a list.
 */
export function toCsv(rows: SubscriberRow[]): string {
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [["email", "language", "subscribed"].map(cell).join(",")];

  for (const row of rows) {
    if (row.unsubscribedAt) continue;
    lines.push(
      [
        cell(row.email),
        cell(row.locale),
        cell(row.createdAt.toISOString().slice(0, 10)),
      ].join(","),
    );
  }

  return lines.join("\n");
}
