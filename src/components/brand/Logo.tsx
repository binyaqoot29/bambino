import { BambinoMark } from "./BambinoMark";
import { Wordmark } from "./Wordmark";

type LogoProps = {
  /** `stacked` = mark above wordmark (hero, footer). `inline` = side by side (header). */
  layout?: "inline" | "stacked";
  /** `brand` for the orchid lockup, `light` for use on plum/photography. */
  tone?: "brand" | "light" | "plum";
  className?: string;
  markClassName?: string;
  wordClassName?: string;
};

const TONE = {
  brand: { mark: "text-brand-500", word: "text-brand-500" },
  light: { mark: "text-mint-200", word: "text-white" },
  plum: { mark: "text-brand-900", word: "text-brand-900" },
} as const;

/**
 * The lockup. Both parts are outlines from the supplied logo artwork, sized so
 * the wordmark sits at ~0.52× the mark's height — the ratio in the original
 * stacked lockup.
 */
export function Logo({
  layout = "inline",
  tone = "brand",
  className = "",
  markClassName = "",
  wordClassName = "",
}: LogoProps) {
  const t = TONE[tone];
  const stacked = layout === "stacked";

  return (
    <span
      className={[
        "inline-flex select-none",
        stacked ? "flex-col items-center gap-2" : "flex-row items-center gap-2.5",
        className,
      ].join(" ")}
      // The brand name is Latin on both locales; keep the lockup LTR.
      dir="ltr"
    >
      <BambinoMark
        title="Bambino"
        className={[
          t.mark,
          stacked ? "h-14 w-auto" : "h-9 w-auto",
          markClassName,
        ].join(" ")}
      />
      <Wordmark
        className={[
          t.word,
          stacked ? "h-7 w-auto" : "h-5 w-auto",
          wordClassName,
        ].join(" ")}
      />
    </span>
  );
}
