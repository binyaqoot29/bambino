"use client";

import Link from "next/link";

import { useMemo, useState } from "react";

import { useBag } from "@/components/cart/store";
import { Button } from "@/components/ui/Button";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import { SIZE_LABELS } from "@/lib/catalog/taxonomy";
import type { Product } from "@/lib/catalog/types";
import { routes } from "@/lib/routes";
import { WishlistButton } from "./WishlistButton";

/**
 * Selection in ink, not orchid: a chosen size is a filled black pill, a chosen
 * colour a swatch with a hairline ring at a distance. The add button is the
 * one plum object in the column.
 */
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
  const [size, setSize] = useState<string | null>(singleSize ? sizes[0] : null);
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

  const legend =
    "text-ink-900 mb-3 flex w-full items-baseline justify-between text-[12px] font-medium tracking-[0.12em] uppercase [html[lang=ar]_&]:text-sm [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case";

  return (
    <div className="space-y-7">
      {/* colour */}
      {product.colours.length > 1 ? (
        <fieldset>
          <legend className={legend}>
            <span>
              {dict.common.colour}
              <span className="text-ink-500 ms-2 font-normal tracking-normal normal-case">
                {product.colours.find((c) => c.key === colour)?.name[locale]}
              </span>
            </span>
          </legend>
          <div className="flex flex-wrap gap-3">
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
                  className={`relative inline-flex size-9 items-center justify-center rounded-full ring-1 ring-offset-2 transition-[box-shadow] duration-200 ${
                    selected
                      ? "ring-ink-900"
                      : "ring-ink-200 hover:ring-ink-400"
                  } ${available ? "" : "opacity-35"}`}
                  style={{ backgroundColor: option.hex }}
                >
                  {selected ? (
                    <CheckIcon className="size-4 text-white mix-blend-difference" />
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
          <legend className={legend}>
            <span>{dict.common.size}</span>
            <Link
              href={routes.help(locale, "size-guide")}
              className="link-draw text-ink-600 cursor-pointer font-normal tracking-normal normal-case"
            >
              {dict.product.sizeGuide}
            </Link>
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
                  className={`h-11 min-w-14 rounded-full px-4 text-[13px] ring-1 transition-colors duration-200 ${
                    selected
                      ? "bg-ink-900 ring-ink-900 text-white"
                      : stock === 0
                        ? "text-ink-300 ring-ink-200 line-through"
                        : "text-ink-800 ring-ink-300 hover:ring-ink-900"
                  }`}
                >
                  {SIZE_LABELS[option]?.[locale] ?? option}
                </button>
              );
            })}
          </div>
          {error ? (
            <p role="alert" className="text-sale mt-3 text-xs">
              {dict.product.selectSizeError}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      {/* stock note */}
      {size ? (
        <p className="text-[13px]">
          {selectedStock === 0 ? (
            <span className="text-ink-500">{dict.product.outOfStock}</span>
          ) : selectedStock <= 3 ? (
            <span className="text-sale">
              {plural(dict.product, "lowStock", selectedStock)}
            </span>
          ) : (
            <span className="text-success inline-flex items-center gap-2">
              <CheckIcon className="size-4" />
              {dict.product.inStock}
            </span>
          )}
        </p>
      ) : null}

      {/* quantity + add */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="ring-ink-300 inline-flex h-14 items-center rounded-full ring-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label={dict.a11y.decreaseQty}
            className="text-ink-700 hover:text-ink-900 inline-flex size-13 items-center justify-center rounded-full disabled:opacity-30"
          >
            <MinusIcon className="size-4" />
          </button>
          <span className="w-8 text-center text-sm tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.min(Math.max(selectedStock, 1), q + 1))
            }
            disabled={size !== null && quantity >= selectedStock}
            aria-label={dict.a11y.increaseQty}
            className="text-ink-700 hover:text-ink-900 inline-flex size-13 items-center justify-center rounded-full disabled:opacity-30"
          >
            <PlusIcon className="size-4" />
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
