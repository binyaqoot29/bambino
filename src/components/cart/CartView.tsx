"use client";

import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { ProductArt } from "@/components/product/ProductArt";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  CloseIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
} from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { ShippingRates } from "@/lib/money";
import { createTranslator } from "@/i18n/t";
import { formatPrice, shippingFor } from "@/lib/money";
import { routes } from "@/lib/routes";
import { useBag } from "./store";

export function CartView({
  locale,
  dict,
  rates,
}: {
  locale: Locale;
  dict: Dictionary;
  /** Editable in the admin, so the page that renders this passes them down. */
  rates: ShippingRates;
}) {
  const { lines, setQuantity, removeItem, ready, count } = useBag();
  const { products, sizeLabels } = useCatalog();
  const { t, plural } = createTranslator(locale);

  if (!ready) {
    return <div className="min-h-[40vh]" aria-busy="true" />;
  }

  if (lines.length === 0) {
    return (
      <div className="container-bambino py-16">
        <div className="bg-canvas-mint mx-auto flex max-w-xl flex-col items-center rounded-[2rem] px-6 py-20 text-center">
          <BambinoMark className="text-mint-400 h-20 w-auto" />
          <h1 className="text-brand-900 mt-6 text-2xl font-medium">
            {dict.cart.empty}
          </h1>
          <p className="text-ink-500 mt-2 text-sm">{dict.cart.emptyBody}</p>
          <ButtonLink href={routes.home(locale)} className="mt-7">
            {dict.cart.continueShopping}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const subtotal = lines.reduce((total, line) => {
    const product = products[line.productId];
    return total + (product ? product.price * line.quantity : 0);
  }, 0);
  const shipping = shippingFor(subtotal, rates);
  const total = subtotal + shipping;
  const remaining = Math.max(0, rates.freeThreshold - subtotal);
  const progress = Math.min(100, (subtotal / rates.freeThreshold) * 100);

  return (
    <div className="container-bambino py-8 lg:py-12">
      <h1 className="text-brand-900 text-3xl font-semibold tracking-tight sm:text-4xl">
        {dict.cart.title}
      </h1>
      <p className="text-ink-500 mt-1.5 text-sm">
        {plural(dict.cart, "itemCount", count)}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <ul className="border-ink-100 divide-ink-100 divide-y border-t">
          {lines.map((line) => {
            const product = products[line.productId];
            if (!product) return null;
            const colour = product.colours[line.colour];

            return (
              <li key={line.key} className="flex gap-4 py-5">
                <Link
                  href={routes.product(locale, product.handle)}
                  className="shrink-0"
                >
                  <ProductArt
                    art={product.art}
                    seed={product.id}
                    className="size-24 rounded-2xl sm:size-28"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={routes.product(locale, product.handle)}
                        className="text-ink-900 hover:text-brand-600 text-sm font-medium"
                      >
                        {product.name}
                      </Link>
                      <p className="text-ink-500 mt-1 text-xs">
                        {colour ? (
                          <>
                            {dict.common.colour}: {colour.name}
                          </>
                        ) : null}
                        {line.size !== "one-size" ? (
                          <>
                            {colour ? " · " : null}
                            {dict.common.size}:{" "}
                            {sizeLabels[line.size] ?? line.size}
                          </>
                        ) : null}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.key)}
                      aria-label={t(dict.a11y.removeItem, {
                        name: product.name,
                      })}
                      className="text-ink-400 hover:bg-ink-100 hover:text-ink-700 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full"
                    >
                      <CloseIcon className="size-4.5" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                    <div className="ring-ink-200 inline-flex h-10 items-center rounded-full ring-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.key, line.quantity - 1)}
                        aria-label={dict.a11y.decreaseQty}
                        className="text-ink-600 hover:text-brand-600 inline-flex size-9 items-center justify-center rounded-full"
                      >
                        <MinusIcon className="size-4" />
                      </button>
                      <span className="w-7 text-center text-sm font-medium tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.key, line.quantity + 1)}
                        aria-label={dict.a11y.increaseQty}
                        className="text-ink-600 hover:text-brand-600 inline-flex size-9 items-center justify-center rounded-full"
                      >
                        <PlusIcon className="size-4" />
                      </button>
                    </div>

                    <div className="text-end">
                      <p className="text-ink-900 text-sm font-medium tabular-nums">
                        {formatPrice(product.price * line.quantity, locale)}
                      </p>
                      {line.quantity > 1 ? (
                        <p className="text-ink-400 text-xs tabular-nums">
                          {formatPrice(product.price, locale)}{" "}
                          {dict.common.each}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="bg-canvas ring-ink-100 rounded-3xl p-6 ring-1">
            <h2 className="text-ink-900 text-sm font-semibold">
              {dict.cart.orderSummary}
            </h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-600">{dict.cart.subtotal}</dt>
                <dd className="text-ink-900 font-medium tabular-nums">
                  {formatPrice(subtotal, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-600">{dict.cart.shipping}</dt>
                <dd
                  className={`font-medium tabular-nums ${
                    shipping === 0 ? "text-success" : "text-ink-900"
                  }`}
                >
                  {shipping === 0
                    ? dict.cart.shippingFree
                    : formatPrice(shipping, locale)}
                </dd>
              </div>
              <div className="border-ink-200 flex justify-between border-t pt-3">
                <dt className="text-ink-900 font-medium">{dict.cart.total}</dt>
                <dd className="text-brand-700 text-lg font-semibold tabular-nums">
                  {formatPrice(total, locale)}
                </dd>
              </div>
            </dl>

            <div className="bg-mint-50 mt-5 rounded-2xl p-4">
              <p className="text-mint-800 flex items-start gap-2 text-xs leading-relaxed">
                <TruckIcon className="text-mint-600 mt-px size-4 shrink-0" />
                {remaining > 0
                  ? t(dict.cart.freeShippingProgress, {
                      amount: formatPrice(remaining, locale),
                    })
                  : dict.cart.freeShippingReached}
              </p>
              <div className="bg-mint-200 mt-2.5 h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-mint-500 h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <Button block size="lg" className="mt-5">
              {dict.cart.checkout}
            </Button>

            <div className="mt-4">
              <label
                htmlFor="promo"
                className="text-ink-600 text-xs font-medium"
              >
                {dict.cart.promoCode}
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="promo"
                  type="text"
                  placeholder={dict.cart.promoPlaceholder}
                  className="ring-ink-200 focus:ring-brand-400 h-10 min-w-0 flex-1 rounded-full bg-white px-4 text-sm ring-1 focus:outline-none"
                />
                <Button variant="secondary" size="sm">
                  {dict.plp.apply}
                </Button>
              </div>
            </div>
          </div>

          <Link
            href={routes.home(locale)}
            className="text-brand-600 hover:text-brand-700 mt-4 block text-center text-sm font-medium"
          >
            {dict.cart.continueShopping}
          </Link>
        </aside>
      </div>
    </div>
  );
}
