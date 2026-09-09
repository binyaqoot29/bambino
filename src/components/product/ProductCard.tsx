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

/** Days after launch a product still counts as new on its card. */
const NEW_FOR_DAYS = 21;

/**
 * Image first, everything else quiet.
 *
 * The photograph sits in a tall cream frame with no border, and the card has
 * no box around it — the grid's white space does the separating. The name is
 * set plainly, the price in a regular weight, and a reduction is a small plum
 * pill on the image rather than a red flash. The hover is a slow 4% zoom on
 * the image alone.
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
  const isNew = product.daysOld <= NEW_FOR_DAYS;
  const nf = new Intl.NumberFormat(
    locale === "ar" ? "ar-KW-u-nu-latn" : "en-KW",
  );

  return (
    <article className="group relative flex flex-col">
      <div className="bg-canvas rounded-card relative overflow-hidden">
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
            src={product.images[0]}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
            className="aspect-[4/5] w-full transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.04]"
          />
        </Link>

        <div className="absolute start-3 top-3 flex flex-col items-start gap-1.5">
          {percent > 0 ? (
            <span className="bg-brand-900 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-white tabular-nums uppercase">
              <bdi dir="ltr">−{nf.format(percent)}%</bdi>
            </span>
          ) : isNew ? (
            <span className="text-ink-900 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] uppercase backdrop-blur-sm [html[lang=ar]_&]:tracking-normal">
              {dict.common.new}
            </span>
          ) : null}
        </div>

        {!available ? (
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3">
            <span className="text-ink-700 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm">
              {dict.product.outOfStock}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-3.5 pb-1">
        <h3 className="text-ink-900 line-clamp-2 text-[14px] leading-snug">
          <Link
            href={routes.product(locale, product.handle)}
            className="before:absolute before:inset-0 before:content-['']"
          >
            {product.name[locale]}
          </Link>
        </h3>

        <p className="text-ink-400 mt-1 text-[12px]">
          {plural(dict.product, "colourCount", product.colours.length)}
        </p>

        <div className="mt-2 flex items-baseline justify-between gap-3">
          <span className="flex items-baseline gap-2">
            <span
              className={`text-[14px] tabular-nums ${
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
          </span>
          {product.reviewCount > 0 ? (
            <span className="text-ink-400 inline-flex items-center gap-1 text-[11px] tabular-nums">
              <StarIcon
                id={`m-${product.id}`}
                fillPercent={100}
                className="text-gold-500 size-3"
              />
              {nf.format(product.rating)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
