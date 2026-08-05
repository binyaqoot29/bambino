"use client";

import { useMemo, useState } from "react";

import { useBag } from "@/components/cart/store";
import { Button } from "@/components/ui/Button";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import { SIZE_LABELS } from "@/lib/catalog/taxonomy";
import type { Product } from "@/lib/catalog/types";
import { WishlistButton } from "./WishlistButton";

export function BuyBox({
  product,
  locale,
  dict,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
}) {
  const { addItem } = useBag();
  const { t, plural } = createTranslator(locale);

  const sizes = useMemo(
    () => [...new Set(product.variants.map((v) => v.size))],
    [product],
  );
  const singleSize = sizes.length === 1;

  const [colour, setColour] = useState(product.colours[0]?.key ?? "");
  const [size, setSize] = useState<string | null>(
    singleSize ? sizes[0] : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const stockFor = (s: string) =>
    product.variants.find((v) => v.size === s && v.colour === colour)?.stock ??
    0;

  const selectedStock = size ? stockFor(size) : 0;
  const colourAvailable = (key: string) =>
    product.variants.some((v) => v.colour === key && v.stock > 0);

  function handleAdd() {
    if (!size) {
      setError(true);
      return;
    }
    addItem(product.id, size, colour, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* colour */}
      {product.colours.length > 1 ? (
        <fieldset>
          <legend className="text-ink-900 mb-2.5 text-sm font-medium">
            {dict.common.colour}
            <span className="text-ink-500 ms-2 font-normal">
              {product.colours.find((c) => c.key === colour)?.name[locale]}
            </span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {product.colours.map((option) => {
              const selected = option.key === colour;
              const available = colourAvailable(option.key);
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setColour(option.key);
                    setError(false);
                  }}
                  aria-pressed={selected}
                  aria-label={option.name[locale]}
                  title={option.name[locale]}
                  className={`relative inline-flex size-10 items-center justify-center rounded-full ring-1 transition-all ${
                    selected
                      ? "ring-brand-500 ring-2 ring-offset-2"
                      : "ring-ink-200 hover:ring-ink-400"
                  } ${available ? "" : "opacity-40"}`}
                  style={{ backgroundColor: option.hex }}
                >
                  {selected ? (
                    <CheckIcon className="size-4.5 text-white mix-blend-difference" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* size */}
      {!singleSize ? (
        <fieldset>
          <legend className="text-ink-900 mb-2.5 flex w-full items-center justify-between text-sm font-medium">
            {dict.common.size}
            <span className="text-brand-600 cursor-pointer text-xs font-normal underline underline-offset-4">
              {dict.product.sizeGuide}
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((option) => {
              const stock = stockFor(option);
              const selected = option === size;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={stock === 0}
                  onClick={() => {
                    setSize(option);
                    setError(false);
                    setQuantity(1);
                  }}
                  aria-pressed={selected}
                  className={`h-10 rounded-full px-4 text-sm font-medium ring-1 transition-colors ${
                    selected
                      ? "bg-brand-500 ring-brand-500 text-white"
                      : stock === 0
                        ? "text-ink-300 ring-ink-150 ring-ink-200 line-through"
                        : "text-ink-700 ring-ink-200 hover:ring-brand-400"
                  }`}
                >
                  {SIZE_LABELS[option]?.[locale] ?? option}
                </button>
              );
            })}
          </div>
          {error ? (
            <p role="alert" className="text-sale mt-2.5 text-xs">
              {dict.product.selectSizeError}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      {/* stock note */}
      {size ? (
        <p className="text-sm">
          {selectedStock === 0 ? (
            <span className="text-ink-500">{dict.product.outOfStock}</span>
          ) : selectedStock <= 3 ? (
            <span className="text-sale font-medium">
              {plural(dict.product, "lowStock", selectedStock)}
            </span>
          ) : (
            <span className="text-success inline-flex items-center gap-1.5 font-medium">
              <CheckIcon className="size-4" />
              {dict.product.inStock}
            </span>
          )}
        </p>
      ) : null}

      {/* quantity + add */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="ring-ink-200 inline-flex h-13 items-center rounded-full ring-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label={dict.a11y.decreaseQty}
            className="text-ink-600 hover:text-brand-600 inline-flex size-12 items-center justify-center rounded-full disabled:opacity-35"
          >
            <MinusIcon className="size-4.5" />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.min(Math.max(selectedStock, 1), q + 1))
            }
            disabled={size !== null && quantity >= selectedStock}
            aria-label={dict.a11y.increaseQty}
            className="text-ink-600 hover:text-brand-600 inline-flex size-12 items-center justify-center rounded-full disabled:opacity-35"
          >
            <PlusIcon className="size-4.5" />
          </button>
        </div>

        <Button
          size="lg"
          onClick={handleAdd}
          disabled={size !== null && selectedStock === 0}
          className="min-w-52 flex-1"
        >
          {justAdded ? (
            <>
              <CheckIcon className="size-5" />
              {dict.product.added}
            </>
          ) : size !== null && selectedStock === 0 ? (
            dict.product.notifyMe
          ) : (
            dict.product.addToCart
          )}
        </Button>
      </div>

      <WishlistButton
        productId={product.id}
        variant="inline"
        addLabel={dict.product.addToWishlist}
        removeLabel={dict.product.removeFromWishlist}
      />

      <p className="sr-only" aria-live="polite">
        {justAdded ? t(dict.product.added) : ""}
      </p>
    </div>
  );
}
