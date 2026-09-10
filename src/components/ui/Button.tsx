import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "plum" | "quiet" | "light";
type Size = "sm" | "md" | "lg";

/**
 * Plum is the buying colour. Orchid is the brand's voice, not its call to
 * action — on a button it reads soft, and softness is the wrong feeling at
 * the moment of commitment. `light` is for buttons that sit on plum.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-900 text-white hover:bg-brand-800 active:bg-brand-950 shadow-[0_8px_24px_-12px_rgb(102_31_71_/_0.6)]",
  plum: "bg-brand-900 text-white hover:bg-brand-800 active:bg-brand-950",
  secondary:
    "bg-transparent text-ink-900 ring-1 ring-inset ring-ink-900/80 hover:bg-ink-900 hover:text-white",
  ghost: "text-ink-800 hover:bg-ink-100 active:bg-ink-200",
  quiet:
    "bg-white/10 text-white ring-1 ring-inset ring-white/25 hover:bg-white/15",
  light: "bg-paper text-brand-900 hover:bg-white",
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-5 text-[12px] gap-1.5",
  md: "h-12 px-7 text-[13px] gap-2",
  lg: "h-14 px-9 text-sm gap-2.5",
};

const BASE =
  "inline-flex items-center justify-center rounded-full font-medium tracking-[0.06em] uppercase transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out-quint)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 whitespace-nowrap [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case";

function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
  block = false,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  block?: boolean;
} = {}) {
  return [
    BASE,
    VARIANTS[variant],
    SIZES[size],
    block ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
};

export function Button({
  variant,
  size,
  block,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={buttonClass({ variant, size, block, className })}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
};

export function ButtonLink({
  variant,
  size,
  block,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      {...rest}
      className={buttonClass({ variant, size, block, className })}
    >
      {children}
    </Link>
  );
}
