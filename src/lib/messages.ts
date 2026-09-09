import "server-only";

import { desc, eq, isNull, count } from "drizzle-orm";

import { getDb, schema } from "@/db";
import type { MessageRow } from "@/db/schema";
import type { Locale } from "@/i18n/config";

/** Contact-page messages: written by visitors, read in the admin inbox. */

export type NewMessage = {
  name: string;
  email: string;
  phone: string;
  body: string;
  locale: Locale;
};

const LIMITS = { name: 80, email: 120, phone: 40, body: 4000 };

export async function saveMessage(input: NewMessage): Promise<void> {
  const db = await getDb();
  await db.insert(schema.messages).values({
    id: crypto.randomUUID(),
    name: input.name.slice(0, LIMITS.name),
    email: input.email.slice(0, LIMITS.email),
    phone: input.phone.slice(0, LIMITS.phone),
    body: input.body.slice(0, LIMITS.body),
    locale: input.locale,
  });
}

export async function loadMessages(): Promise<MessageRow[]> {
  const db = await getDb();
  return db
    .select()
    .from(schema.messages)
    .orderBy(desc(schema.messages.createdAt));
}

export async function unreadMessages(): Promise<number> {
  const db = await getDb();
  const [row] = await db
    .select({ n: count() })
    .from(schema.messages)
    .where(isNull(schema.messages.readAt));
  return row?.n ?? 0;
}

export async function markMessageRead(
  id: string,
  read: boolean,
): Promise<void> {
  const db = await getDb();
  await db
    .update(schema.messages)
    .set({ readAt: read ? new Date() : null })
    .where(eq(schema.messages.id, id));
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(schema.messages).where(eq(schema.messages.id, id));
}
