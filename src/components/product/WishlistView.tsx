"use client";

import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { useBag } from "@/components/cart/store";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { ProductArt } from "@/components/product/ProductArt";
import { ButtonLink } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";
import { Price } from "@/components/ui/Price";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export function WishlistView({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const { wishlist, toggleWishlist, ready } = useBag();
  const { products } = useCatalog();

  if (!ready) return <div className="min-h-[40vh]" aria-busy="true" />;

  const saved = wishlist.map((id) => products[id]).filter(Boolean);

  return (
    <div className="container-bambino py-8 lg:py-12">
      <h1 className="text-brand-900 text-3xl font-semibold tracking-tight sm:text-4xl">
        {dict.wishlist.title}
      </h1>

      {saved.length === 0 ? (
        <div className="bg-canvas-mint mt-8 flex flex-col items-center rounded-[2rem] px-6 py-20 text-center">
          <BambinoMark className="text-mint-400 h-20 w-auto" />
          <h2 className="text-brand-900 mt-6 text-xl font-medium">
            {dict.wishlist.empty}
          </h2>
          <p className="text-ink-500 mt-2 max-w-sm text-sm">
            {dict.wishlist.emptyBody}
          </p>
          <ButtonLink href={routes.home(locale)} className="mt-7">
            {dict.cart.continueShopping}
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {saved.map((product) => (
            <li key={product.id} className="group relative">
              <div className="bg-canvas relative aspect-4/5 overflow-hidden rounded-3xl">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={dict.product.removeFromWishlist}
                  className="bg-paper/85 text-ink-500 hover:text-sale absolute end-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full backdrop-blur-sm"
                >
                  <CloseIcon className="size-4.5" />
                </button>
                <Link href={routes.product(locale, product.handle)}>
                  <ProductArt
                    art={product.art}
                    seed={product.id}
                    className="size-full transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </Link>
              </div>
              <h2 className="text-ink-900 pt-3 text-sm font-medium">
                <Link href={routes.product(locale, product.handle)}>
                  {product.name}
                </Link>
              </h2>
              <Price
                amount={product.price}
                compareAt={product.compareAtPrice}
                locale={locale}
                size="sm"
                className="mt-1"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
