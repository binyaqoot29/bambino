"use server";

import { isLocale, type Locale } from "@/i18n/config";
import { saveMessage } from "@/lib/messages";

export type ContactState = {
  status?: "sent" | "failed";
  fieldErrors?: Record<
    string,
    "required" | "invalidEmail" | "needContact" | "tooShort"
  >;
  /** What was typed, echoed back so a rejected field costs nothing else. */
  values?: Record<string, string>;
  attempt?: number;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The contact form. Validates, stores, and never reveals anything about
 * other messages. The `website` field is a honeypot: it is hidden from
 * people, so anything that fills it is a bot and is quietly ignored.
 */
export async function sendMessage(
  prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const values = {
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    message: text("message"),
  };
  const attempt = (prev.attempt ?? 0) + 1;
  const raw = text("locale");
  const locale: Locale = isLocale(raw) ? raw : "en";

  if (text("website")) return { status: "sent", attempt };

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (!values.name) fieldErrors.name = "required";
  if (values.email && !EMAIL.test(values.email))
    fieldErrors.email = "invalidEmail";
  if (!values.email && !values.phone) fieldErrors.email = "needContact";
  if (values.message.length < 10)
    fieldErrors.message = values.message ? "tooShort" : "required";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values, attempt };

  try {
    await saveMessage({
      name: values.name,
      email: values.email.toLowerCase(),
      phone: values.phone,
      body: values.message,
      locale,
    });
    return { status: "sent", attempt };
  } catch (error) {
    console.error("contact message failed", error);
    return { status: "failed", values, attempt };
  }
}
