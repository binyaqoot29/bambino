import type { Locale } from "@/i18n/config";
import { formatPrice, type Fils } from "@/lib/money";

/**
 * Prices are set in a regular weight, never bold: a boutique states a price,
 * it does not shout one. A reduction shows as the new price in claret with
 * the old price struck through beside it.
 */
export function Price({
  amount,
  compareAt,
  locale,
  size = "md",
  className = "",
}: {
  amount: Fils;
  compareAt?: Fils;
  locale: Locale;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const discounted = Boolean(compareAt && compareAt > amount);
  const scale = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  }[size];

  return (
    <span className={`inline-flex items-baseline gap-2.5 ${className}`}>
      <span
        className={`${scale} font-normal tabular-nums ${
          discounted ? "text-sale" : "text-ink-900"
        }`}
      >
        {formatPrice(amount, locale)}
      </span>
      {discounted ? (
        <span className="text-ink-400 text-xs line-through tabular-nums">
          {formatPrice(compareAt!, locale)}
        </span>
      ) : null}
    </span>
  );
}
