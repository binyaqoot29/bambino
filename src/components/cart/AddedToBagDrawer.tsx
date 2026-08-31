"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useCatalog } from "@/components/catalog/CatalogProvider";
import { ProductArt } from "@/components/product/ProductArt";
import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon, CloseIcon } from "@/components/ui/Icons";
import { Price } from "@/components/ui/Price";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import { formatPrice, shippingFor, type ShippingRates } from "@/lib/money";
import { routes } from "@/lib/routes";
import { useBag } from "./store";

/** Slides in after an add-to-bag, then gets out of the way. */
export function AddedToBagDrawer({
  locale,
  dict,
  rates,
}: {
  locale: Locale;
  dict: Dictionary;
  rates: ShippingRates;
}) {
  const { lastAdded, dismissLastAdded, lines, count } = useBag();
  const { products } = useCatalog();
  const { plural } = createTranslator(locale);

  useEffect(() => {
    if (!lastAdded) return;
    const id = window.setTimeout(dismissLastAdded, 7000);
    return () => window.clearTimeout(id);
  }, [lastAdded, dismissLastAdded]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") dismissLastAdded();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismissLastAdded]);

  if (!lastAdded) return null;

  const product = products[lastAdded];
  if (!product) return null;

  const subtotal = lines.reduce((total, line) => {
    const p = products[line.productId];
    return total + (p ? p.price * line.quantity : 0);
  }, 0);
  const shipping = shippingFor(subtotal, rates);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:end-5 sm:bottom-5 sm:w-96"
    >
      <div className="bg-paper ring-ink-200 animate-float-in overflow-hidden rounded-3xl shadow-[0_24px_48px_-20px_rgb(102_31_71_/_0.35)] ring-1">
        <div className="border-ink-100 flex items-center gap-2 border-b px-4 py-3">
          <span className="bg-success/12 text-success inline-flex size-6 items-center justify-center rounded-full">
            <CheckIcon className="size-4" />
          </span>
          <p className="text-ink-900 text-sm font-medium">
            {dict.cart.drawerTitle}
          </p>
          <button
            type="button"
            onClick={dismissLastAdded}
            aria-label={dict.common.close}
            className="text-ink-400 hover:bg-ink-100 hover:text-ink-700 ms-auto inline-flex size-8 items-center justify-center rounded-full"
          >
            <CloseIcon className="size-4.5" />
          </button>
        </div>

        <div className="flex gap-3 p-4">
          <Link
            href={routes.product(locale, product.handle)}
            className="shrink-0"
          >
            <ProductArt
              art={product.art}
              seed={product.id}
              className="size-20 rounded-2xl"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={routes.product(locale, product.handle)}
              className="text-ink-900 hover:text-brand-600 line-clamp-2 text-sm font-medium"
            >
              {product.name}
            </Link>
            <Price
              amount={product.price}
              compareAt={product.compareAtPrice}
              locale={locale}
              size="sm"
              className="mt-1"
            />
          </div>
        </div>

        <div className="bg-canvas border-ink-100 border-t px-4 py-3">
          <div className="text-ink-600 flex items-baseline justify-between text-sm">
            <span>{plural(dict.cart, "itemCount", count)}</span>
            <span className="text-ink-900 font-medium tabular-nums">
              {formatPrice(subtotal, locale)}
            </span>
          </div>
          <p className="text-ink-500 mt-1 text-xs">
            {dict.cart.shipping}:{" "}
            {shipping === 0
              ? dict.cart.shippingFree
              : formatPrice(shipping, locale)}
          </p>
          <div className="mt-3 flex gap-2">
            <ButtonLink
              href={routes.cart(locale)}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              {dict.cart.viewBag}
            </ButtonLink>
            <ButtonLink
              href={routes.cart(locale)}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              {dict.cart.checkout}
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
