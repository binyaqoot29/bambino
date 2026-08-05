import type { Locale } from "@/i18n/config";
import { StarIcon } from "./Icons";

export function Rating({
  value,
  count,
  locale,
  label,
  countLabel,
  className = "",
}: {
  value: number;
  count?: number;
  locale: Locale;
  /** Screen-reader sentence, already interpolated. */
  label: string;
  /** Visible "(214 reviews)" text, already interpolated. */
  countLabel?: string;
  className?: string;
}) {
  const nf = new Intl.NumberFormat(
    locale === "ar" ? "ar-KW-u-nu-latn" : "en-KW",
  );

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-brand-400 inline-flex" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i)) * 100;
          return (
            <StarIcon
              key={i}
              id={`star-${i}-${Math.round(fill)}`}
              fillPercent={fill}
              className="size-3.5"
            />
          );
        })}
      </span>
      <span className="sr-only">{label}</span>
      {count !== undefined ? (
        <span className="text-ink-500 text-xs tabular-nums" aria-hidden="true">
          {nf.format(value)}
          {countLabel ? ` · ${countLabel}` : null}
        </span>
      ) : null}
    </span>
  );
}
