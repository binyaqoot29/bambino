import type { ArtKey } from "../catalog/types";

/**
 * Orders.
 *
 * Kuwait-shaped throughout: addresses are governorate/area/block/street/building
 * rather than the street-address-plus-postcode the rest of the world assumes,
 * and a phone number is mandatory because that is how delivery actually
 * happens here — the driver calls.
 */

export const GOVERNORATES = [
  "capital",
  "hawalli",
  "farwaniya",
  "mubarak-al-kabeer",
  "ahmadi",
  "jahra",
] as const;

export type Governorate = (typeof GOVERNORATES)[number];

export const GOVERNORATE_LABELS: Record<
  Governorate,
  { en: string; ar: string }
> = {
  capital: { en: "Capital", ar: "العاصمة" },
  hawalli: { en: "Hawalli", ar: "حولي" },
  farwaniya: { en: "Farwaniya", ar: "الفروانية" },
  "mubarak-al-kabeer": { en: "Mubarak Al-Kabeer", ar: "مبارك الكبير" },
  ahmadi: { en: "Ahmadi", ar: "الأحمدي" },
  jahra: { en: "Jahra", ar: "الجهراء" },
};

export function isGovernorate(value: string): value is Governorate {
  return (GOVERNORATES as readonly string[]).includes(value);
}

/**
 * Order lifecycle.
 *
 * Deliberately short. Every extra status is one more thing the shop owner has
 * to keep truthful by hand, and these five are the ones that change what
 * somebody does next.
 */
export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

/** Statuses that no longer count as owing stock — used to restore it. */
export const CANCELLED_STATUSES: OrderStatus[] = ["cancelled"];

export const PAYMENT_METHODS = ["cod", "knet"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function isPaymentMethod(value: string): value is PaymentMethod {
  return (PAYMENT_METHODS as readonly string[]).includes(value);
}

export type PaymentStatus = "unpaid" | "paid" | "refunded";

/** A Kuwaiti delivery address. */
export type DeliveryAddress = {
  governorate: Governorate;
  area: string;
  block: string;
  street: string;
  building: string;
  /** Floor, flat number, landmark — whatever helps the driver find the door. */
  extra: string;
};

/**
 * A line as it was bought.
 *
 * Everything the customer saw is copied in rather than referenced. A product
 * can be renamed, repriced or deleted later, and an order from six months ago
 * still has to read the way it did on the day — both for the customer and for
 * the shop owner's own books.
 */
export type OrderLine = {
  productId: string;
  handle: string;
  name: { en: string; ar: string };
  size: string;
  colour: string;
  art: ArtKey;
  /** Fils, per unit, at the moment of ordering. */
  unitPrice: number;
  quantity: number;
};
