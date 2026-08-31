"use server";

import { isLocale, type Locale } from "@/i18n/config";
import { subscribe, type SubscribeResult } from "@/lib/subscribers";

export type NewsletterState = {
  status?: SubscribeResult;
};

/**
 * Footer newsletter signup.
 *
 * "Already subscribed" deliberately reports the same success to the visitor as
 * a new signup. Telling someone their address is already on the list discloses
 * who is subscribed to anyone who can type an email into a public form.
 */
export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "");
  const raw = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(raw) ? raw : "en";

  return { status: await subscribe(email, locale) };
}
