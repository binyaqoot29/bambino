import { BambinoMark } from "./BambinoMark";

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

export function Logo({
  layout = "inline",
  tone = "brand",
  className = "",
  markClassName = "",
  wordClassName = "",
}: LogoProps) {
  const t = TONE[tone];

  return (
    <span
      className={[
        "inline-flex select-none",
        layout === "stacked"
          ? "flex-col items-center gap-1"
          : "flex-row items-center gap-2",
        className,
      ].join(" ")}
    >
      <BambinoMark
        className={[
          t.mark,
          layout === "stacked" ? "h-12 w-auto" : "h-8 w-auto",
          markClassName,
        ].join(" ")}
      />
      <span
        className={[
          t.word,
          "font-medium tracking-tight",
          layout === "stacked" ? "text-2xl" : "text-xl",
          wordClassName,
        ].join(" ")}
        // The wordmark is always Latin "Bambino", even on the Arabic site —
        // it's the brand name, not a translatable string.
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        dir="ltr"
      >
        Bambino
      </span>
    </span>
  );
}
