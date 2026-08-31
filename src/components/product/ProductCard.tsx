import Link from "next/link";

import { ProductArt } from "@/components/product/ProductArt";
import { WishlistButton } from "@/components/product/WishlistButton";
import { StarIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import { inStock, type Product } from "@/lib/catalog/types";
import { discountPercent, formatPrice } from "@/lib/money";
import { routes } from "@/lib/routes";

/**
 * Compact and price-led: the price is the largest thing on the card, the saving
 * is stated in dinars as well as percent, and the rating collapses to a single
 * number so the card stays short and the grid stays dense.
 */
export function ProductCard({
  product,
  locale,
  dict,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
}) {
  const { plural } = createTranslator(locale);
  const available = inStock(product);
  const percent = product.compareAtPrice
    ? discountPercent(product.price, product.compareAtPrice)
    : 0;
  const nf = new Intl.NumberFormat(
    locale === "ar" ? "ar-KW-u-nu-latn" : "en-KW",
  );

  return (
    <article className="group ring-ink-200 hover:ring-brand-300 relative flex flex-col rounded-lg bg-white ring-1 transition-shadow hover:shadow-md">
      <div className="relative">
        <WishlistButton
          productId={product.id}
          addLabel={dict.product.addToWishlist}
          removeLabel={dict.product.removeFromWishlist}
        />
        <Link
          href={routes.product(locale, product.handle)}
          tabIndex={-1}
          aria-hidden="true"
          className="block"
        >
          <ProductArt
            art={product.art}
            seed={product.id}
            className="aspect-square w-full rounded-t-lg"
          />
        </Link>

        {percent > 0 ? (
          <span className="bg-sale absolute start-0 top-2.5 rounded-e px-2 py-1 text-[11px] font-bold text-white tabular-nums">
            <bdi dir="ltr">−{nf.format(percent)}%</bdi>
          </span>
        ) : null}

        {!available ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="bg-ink-800 rounded px-2.5 py-1 text-[11px] font-semibold text-white">
              {dict.product.outOfStock}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-ink-800 line-clamp-2 text-[13px] leading-snug">
          <Link
            href={routes.product(locale, product.handle)}
            className="before:absolute before:inset-0 before:content-['']"
          >
            {product.name[locale]}
          </Link>
        </h3>

        <div className="text-ink-400 mt-1.5 flex items-center gap-1 text-[11px]">
          <StarIcon
            id={`m-${product.id}`}
            fillPercent={100}
            className="text-brand-400 size-3"
          />
          <span className="text-ink-600 font-medium tabular-nums">
            {nf.format(product.rating)}
          </span>
          <span className="tabular-nums">
            ({nf.format(product.reviewCount)})
          </span>
        </div>

        <div className="mt-auto pt-2.5">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-[15px] font-bold tabular-nums ${
                percent > 0 ? "text-sale" : "text-ink-900"
              }`}
            >
              {formatPrice(product.price, locale)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-ink-400 text-[11px] line-through tabular-nums">
                {formatPrice(product.compareAtPrice, locale)}
              </span>
            ) : null}
          </div>
          {product.compareAtPrice ? (
            <p className="text-success mt-0.5 text-[11px] font-medium tabular-nums">
              {dict.common.save}{" "}
              {formatPrice(product.compareAtPrice - product.price, locale)}
            </p>
          ) : (
            <p className="text-ink-400 mt-0.5 text-[11px]">
              {plural(dict.product, "colourCount", product.colours.length)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
