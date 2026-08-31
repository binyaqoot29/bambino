import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import { formatPrice } from "@/lib/money";
import type { ShippingSettings } from "@/lib/settings";

/**
 * Delivery copy, filled in from the editable settings.
 *
 * The threshold, the flat rate and the returns window used to be written into
 * the sentences themselves, in both languages, in three places. Changing the
 * threshold meant finding all six strings — and the shop owner couldn't change
 * it at all. The numbers now come from settings and the dictionaries hold the
 * sentence around them.
 */
export function deliveryCopy(
  shipping: ShippingSettings,
  dict: Dictionary,
  locale: Locale,
) {
  const { t } = createTranslator(locale);
  const free = formatPrice(shipping.freeThreshold, locale);

  return {
    announceShipping: t(dict.announce.shipping, { amount: free }),
    announceReturns: t(dict.announce.returns, { days: shipping.returnsDays }),
    deliveryWindow: shipping.deliveryWindow[locale],
    uspBody: t(dict.home.usp.delivery.body, {
      window: shipping.deliveryWindow[locale],
    }),
    productBody: t(dict.product.deliveryBody, {
      window: shipping.deliveryWindow[locale],
      free,
      rate: formatPrice(shipping.flatRate, locale),
      days: shipping.returnsDays,
    }),
  };
}

/**
 * The rotating strip at the top of the page.
 *
 * Cash on delivery drops out when it isn't offered — announcing a payment
 * method the shop won't accept is worse than saying nothing.
 */
export function announcements(
  shipping: ShippingSettings,
  dict: Dictionary,
  locale: Locale,
): string[] {
  const copy = deliveryCopy(shipping, dict, locale);
  const items = [copy.announceShipping, copy.announceReturns];
  if (shipping.codEnabled) items.push(dict.announce.cod);
  return items;
}
