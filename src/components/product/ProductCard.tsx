import Link from "next/link";

import { Rating } from "@/components/ui/Rating";
import { DiscountBadge, Price } from "@/components/ui/Price";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import { inStock, type Product } from "@/lib/catalog/types";
import { routes } from "@/lib/routes";
import { ProductArt } from "./ProductArt";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({
  product,
  locale,
  dict,
  priority = false,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
  /** Nudges the "New" badge on for the freshest items in a rail. */
  priority?: boolean;
}) {
  const { t, plural } = createTranslator(locale);
  const available = inStock(product);
  const isNew = product.daysOld <= 21;

  return (
    <article className="group relative">
      <div className="bg-canvas relative aspect-4/5 overflow-hidden rounded-3xl">
        <WishlistButton
          productId={product.id}
          addLabel={dict.product.addToWishlist}
          removeLabel={dict.product.removeFromWishlist}
        />

        <Link
          href={routes.product(locale, product.handle)}
          className="block size-full"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ProductArt
            art={product.art}
            seed={product.id}
            className="size-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0.3,1)] group-hover:scale-[1.04]"
          />
        </Link>

        <div className="absolute start-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {product.compareAtPrice ? (
            <DiscountBadge
              amount={product.price}
              compareAt={product.compareAtPrice}
              label={dict.common.off}
              locale={locale}
            />
          ) : null}
          {isNew || priority ? (
            <span className="bg-mint-300 text-mint-900 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium">
              {dict.common.new}
            </span>
          ) : null}
        </div>

        {!available ? (
          <div className="bg-paper/70 absolute inset-0 flex items-end justify-center pb-5 backdrop-blur-[1px]">
            <span className="bg-ink-800 rounded-full px-3.5 py-1.5 text-xs font-medium text-white">
              {dict.product.outOfStock}
            </span>
          </div>
        ) : null}
      </div>

      <div className="pt-3">
        <h3 className="text-ink-900 text-sm leading-snug font-medium">
          <Link
            href={routes.product(locale, product.handle)}
            className="before:absolute before:inset-0 before:content-['']"
          >
            {product.name[locale]}
          </Link>
        </h3>
        <p className="text-ink-500 mt-0.5 line-clamp-1 text-xs">
          {product.summary[locale]}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Price
            amount={product.price}
            compareAt={product.compareAtPrice}
            locale={locale}
            size="sm"
          />
          <Rating
            value={product.rating}
            count={product.reviewCount}
            locale={locale}
            label={t(dict.a11y.rating, { rating: product.rating })}
            countLabel={plural(dict.product, "reviews", product.reviewCount)}
          />
        </div>

        {product.colours.length > 1 ? (
          <div className="mt-2.5 flex items-center gap-1.5">
            {product.colours.slice(0, 5).map((colour) => (
              <span
                key={colour.key}
                title={colour.name[locale]}
                style={{ backgroundColor: colour.hex }}
                className="ring-ink-200 size-3.5 rounded-full ring-1 ring-inset"
              />
            ))}
            <span className="text-ink-400 ms-0.5 text-[11px]">
              {plural(dict.product, "colourCount", product.colours.length)}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
