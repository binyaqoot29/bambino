import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "plum" | "quiet";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm shadow-brand-500/20",
  plum: "bg-brand-900 text-white hover:bg-brand-800 active:bg-brand-950",
  secondary:
    "bg-white text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-50 hover:ring-brand-300",
  ghost: "text-ink-700 hover:bg-ink-100 active:bg-ink-200",
  quiet:
    "bg-mint-100 text-mint-800 hover:bg-mint-200 ring-1 ring-inset ring-mint-200",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-13 px-8 text-base gap-2.5",
};

const BASE =
  "inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-45 whitespace-nowrap";

export function buttonClass({
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
  return [BASE, VARIANTS[variant], SIZES[size], block ? "w-full" : "", className]
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
