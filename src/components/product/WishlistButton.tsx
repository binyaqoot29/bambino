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
        className="text-ink-600 hover:text-brand-600 inline-flex items-center gap-2 text-sm font-medium transition-colors"
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
      className="bg-paper/85 text-ink-500 hover:text-brand-500 absolute end-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors"
    >
      <HeartIcon
        filled={saved}
        className={`size-5 ${saved ? "text-brand-500" : ""}`}
      />
    </button>
  );
}
