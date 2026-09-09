"use client";

import { useBag } from "@/components/cart/store";
import { HeartIcon } from "@/components/ui/Icons";

export function WishlistButton({
  productId,
  addLabel,
  removeLabel,
  variant = "floating",
}: {
  productId: string;
  addLabel: string;
  removeLabel: string;
  variant?: "floating" | "inline";
}) {
  const { isWishlisted, toggleWishlist, ready } = useBag();
  const saved = ready && isWishlisted(productId);

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => toggleWishlist(productId)}
        aria-pressed={saved}
        className="link-draw text-ink-700 hover:text-ink-900 inline-flex items-center gap-2 text-[13px] transition-colors"
      >
        <HeartIcon
          filled={saved}
          className={`size-5 ${saved ? "text-brand-500" : ""}`}
        />
        {saved ? removeLabel : addLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        toggleWishlist(productId);
      }}
      aria-label={saved ? removeLabel : addLabel}
      aria-pressed={saved}
      className="text-ink-700 hover:text-brand-600 absolute end-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-white/90 shadow-[var(--shadow-soft)] backdrop-blur-sm transition-[color,transform] duration-200 hover:scale-105"
    >
      <HeartIcon
        filled={saved}
        className={`size-5 ${saved ? "text-brand-500" : ""}`}
      />
    </button>
  );
}
