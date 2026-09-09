"use server";

import { redirect } from "next/navigation";

import { isLocale, type Locale } from "@/i18n/config";
import { placeOrder, type RequestedLine } from "@/lib/orders/place";
import {
  isGovernorate,
  isPaymentMethod,
  type DeliveryAddress,
} from "@/lib/orders/types";
import { routes } from "@/lib/routes";

export type CheckoutState = {
  fieldErrors?: Record<string, string>;
  /** Named products that vanished from the catalogue since going in the bag. */
  unavailable?: string[];
  error?: "empty" | "out-of-stock" | "failed";
  /**
   * What was typed, echoed back.
   *
   * React resets a form once its action resolves, which for an uncontrolled
   * form means a rejected phone number also wipes the address, the name and
   * the note. Losing all that at the final step of a purchase is how a checkout
   * gets abandoned, so the values come back and the fields re-render with them.
   */
  values?: Record<string, string>;
  /** Increments per attempt, so the fields remount and pick up `values`. */
  attempt?: number;
};

/**
 * Kuwaiti phone numbers are eight digits; mobiles start 5, 6 or 9.
 *
 * Accepts the country code and any spacing people actually type, because a
 * rejected phone number at the last step of a checkout is an abandoned order.
 */
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "").replace(/^(?:00)?965/, "");
  return /^[2569]\d{7}$/.test(digits) ? digits : null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Places an order from the checkout form.
 *
 * The browser sends contact details and a list of what's in the bag. It does
 * not send prices, and none are read from it — a Server Action is a public POST
 * endpoint, so the only safe assumption is that everything here is attacker
 * controlled. Quantities are clamped, identity is re-looked-up, and every
 * amount charged is computed server-side in `placeOrder`.
 */
export async function submitOrder(
  prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const raw = String(formData.get("lang") ?? "en");
  const locale: Locale = isLocale(raw) ? raw : "en";

  const kept = [
    "customerName",
    "phone",
    "email",
    "governorate",
    "area",
    "block",
    "street",
    "building",
    "extra",
    "note",
  ] as const;
  const values = Object.fromEntries(
    kept.map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const attempt = (prev.attempt ?? 0) + 1;

  const fieldErrors: Record<string, string> = {};

  const customerName = String(formData.get("customerName") ?? "").trim();
  if (!customerName) fieldErrors.customerName = "required";

  const phone = normalisePhone(String(formData.get("phone") ?? ""));
  if (!phone) fieldErrors.phone = "phone";

  const emailRaw = String(formData.get("email") ?? "").trim();
  if (emailRaw && !EMAIL.test(emailRaw)) fieldErrors.email = "email";

  const governorate = String(formData.get("governorate") ?? "");
  if (!isGovernorate(governorate)) fieldErrors.governorate = "required";

  const area = String(formData.get("area") ?? "").trim();
  const block = String(formData.get("block") ?? "").trim();
  const street = String(formData.get("street") ?? "").trim();
  const building = String(formData.get("building") ?? "").trim();
  if (!area) fieldErrors.area = "required";
  if (!block) fieldErrors.block = "required";
  if (!street) fieldErrors.street = "required";
  if (!building) fieldErrors.building = "required";

  const method = String(formData.get("paymentMethod") ?? "cod");
  if (!isPaymentMethod(method)) fieldErrors.paymentMethod = "required";
  // Only cash on delivery can actually complete today. Accepting a card order
  // the shop can't charge would be worse than not offering it.
  if (method !== "cod") fieldErrors.paymentMethod = "unavailable";

  if (Object.keys(fieldErrors).length) return { fieldErrors, values, attempt };

  const lines = parseLines(String(formData.get("lines") ?? ""));
  if (!lines.length) return { error: "empty", values, attempt };

  const address: DeliveryAddress = {
    governorate: governorate as DeliveryAddress["governorate"],
    area,
    block,
    street,
    building,
    extra: String(formData.get("extra") ?? "").trim(),
  };

  const result = await placeOrder({
    lines,
    customerName,
    phone: phone!,
    email: emailRaw,
    address,
    paymentMethod: "cod",
    note: String(formData.get("note") ?? "").trim(),
    locale,
  });

  if (!result.ok) {
    if (result.reason === "unavailable") {
      return { unavailable: result.detail ?? [], values, attempt };
    }
    return {
      error: result.reason === "empty" ? "empty" : "out-of-stock",
      values,
      attempt,
    };
  }

  redirect(routes.orderConfirmation(locale, result.reference));
}

/**
 * Reads the bag out of the posted field.
 *
 * Everything is re-validated: quantities are clamped to a sane ceiling so a
 * crafted request can't order two billion of something and wrap an integer, and
 * anything malformed is dropped rather than defaulting.
 */
function parseLines(payload: string): RequestedLine[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const lines: RequestedLine[] = [];
  for (const item of parsed.slice(0, 100)) {
    if (typeof item !== "object" || item === null) continue;
    const line = item as Record<string, unknown>;
    const productId = typeof line.productId === "string" ? line.productId : "";
    const size = typeof line.size === "string" ? line.size : "";
    const colour = typeof line.colour === "string" ? line.colour : "";
    const quantity = Math.min(99, Math.max(1, Math.trunc(Number(line.quantity))));

    if (!productId || !size || !colour || !Number.isFinite(quantity)) continue;
    lines.push({ productId, size, colour, quantity });
  }
  return lines;
}
