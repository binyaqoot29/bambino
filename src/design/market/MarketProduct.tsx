import Link from "next/link";

import { BuyBox } from "@/components/product/BuyBox";
import { ProductArt } from "@/components/product/ProductArt";
import { Accordion } from "@/components/ui/Accordion";
import {
  CardIcon,
  CheckIcon,
  ReturnIcon,
  ShieldIcon,
  StarIcon,
  TruckIcon,
} from "@/components/ui/Icons";
import { createTranslator } from "@/i18n/t";
import { findCategory } from "@/lib/catalog/categories";
import { DEPARTMENT_LABELS, inStock } from "@/lib/catalog/types";
import {
  FREE_SHIPPING_THRESHOLD,
  discountPercent,
  formatPrice,
} from "@/lib/money";
import { routes } from "@/lib/routes";
import type { ProductViewProps } from "../types";
import { MarketProductCard } from "./MarketProductCard";

/**
 * Market product page.
 *
 * Studio puts the object first — big gallery, price as a quiet line, details in
 * accordions below. Here the buy box is a bordered card pinned beside the
 * gallery, price and saving lead it, and the delivery promise sits inside the
 * card rather than in a strip further down. The decision should be makeable
 * without scrolling.
 */
export async function MarketProduct({
  product,
  related,
  locale,
  dict,
}: ProductViewProps) {
  const { t, plural } = createTranslator(locale);
  const category = await findCategory(product.category);
  const available = inStock(product);
  const percent = product.compareAtPrice
    ? discountPercent(product.price, product.compareAtPrice)
    : 0;
  const nf = new Intl.NumberFormat(
    locale === "ar" ? "ar-KW-u-nu-latn" : "en-KW",
  );
  const qualifiesFree = product.price >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="bg-canvas">
      <div className="container-bambino py-5">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="text-ink-400 flex flex-wrap items-center gap-1.5 text-[11px]">
            <li>
              <Link href={routes.home(locale)} className="hover:text-brand-600">
                {dict.nav.home}
              </Link>
            </li>
            <li aria-hidden="true" className="opacity-40">›</li>
            <li>
              <Link
                href={routes.department(locale, product.department)}
                className="hover:text-brand-600"
              >
                {DEPARTMENT_LABELS[product.department][locale]}
              </Link>
            </li>
            {category ? (
              <>
                <li aria-hidden="true" className="opacity-40">›</li>
                <li>
                  <Link
                    href={routes.category(locale, category.slug)}
                    className="hover:text-brand-600"
                  >
                    {category.name[locale]}
                  </Link>
                </li>
              </>
            ) : null}
          </ol>
        </nav>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
          {/* gallery + copy */}
          <div className="space-y-4">
            <div className="ring-ink-200 rounded-xl bg-white p-4 ring-1">
              <div className="grid gap-3 sm:grid-cols-[5rem_1fr]">
                <ul className="order-2 flex gap-2 sm:order-1 sm:flex-col">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="flex-1 sm:flex-none">
                      <span
                        className={`block overflow-hidden rounded-md ring-1 ${
                          i === 0 ? "ring-brand-500 ring-2" : "ring-ink-200"
                        }`}
                      >
                        <ProductArt
                          art={product.art}
                          seed={`${product.id}-${i}`}
                          className="aspect-square w-full"
                        />
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="relative order-1 sm:order-2">
                  <ProductArt
                    art={product.art}
                    seed={product.id}
                    label={t(dict.a11y.productImage, {
                      name: product.name[locale],
                    })}
                    className="aspect-square w-full rounded-lg"
                  />
                  {percent > 0 ? (
                    <span className="bg-sale absolute start-3 top-3 rounded px-2.5 py-1 text-xs font-bold text-white tabular-nums">
                      <bdi dir="ltr">−{nf.format(percent)}%</bdi>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
              <Accordion title={dict.product.description} defaultOpen>
                <p>{product.description[locale]}</p>
              </Accordion>
              <Accordion title={dict.product.details} defaultOpen>
                <ul className="space-y-1.5">
                  {product.details.map((detail) => (
                    <li key={detail.en} className="flex gap-2">
                      <CheckIcon className="text-success mt-0.5 size-4 shrink-0" />
                      {detail[locale]}
                    </li>
                  ))}
                </ul>
              </Accordion>
              {product.care ? (
                <Accordion title={dict.product.care}>
                  <p>{product.care[locale]}</p>
                </Accordion>
              ) : null}
              <Accordion title={dict.product.delivery}>
                <p>{dict.product.deliveryBody}</p>
              </Accordion>
            </div>
          </div>

          {/* buy box */}
          <aside className="lg:sticky lg:top-40 lg:self-start">
            <div className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
              {category ? (
                <Link
                  href={routes.category(locale, category.slug)}
                  className="text-brand-600 text-[11px] font-semibold tracking-wide uppercase"
                >
                  {category.name[locale]}
                </Link>
              ) : null}
              <h1 className="text-ink-900 mt-1.5 text-lg leading-snug font-bold">
                {product.name[locale]}
              </h1>

              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-brand-400 inline-flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarIcon
                      key={i}
                      id={`mp-${i}`}
                      fillPercent={
                        Math.max(0, Math.min(1, product.rating - i)) * 100
                      }
                      className="size-3.5"
                    />
                  ))}
                </span>
                <span className="text-ink-500 text-[11px] tabular-nums">
                  {nf.format(product.rating)} ·{" "}
                  {plural(dict.product, "reviews", product.reviewCount)}
                </span>
              </div>

              {/* price block leads */}
              <div className="border-ink-200 mt-4 border-y py-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span
                    className={`text-2xl font-extrabold tabular-nums ${
                      percent > 0 ? "text-sale" : "text-ink-900"
                    }`}
                  >
                    {formatPrice(product.price, locale)}
                  </span>
                  {product.compareAtPrice ? (
                    <>
                      <span className="text-ink-400 text-sm line-through tabular-nums">
                        {formatPrice(product.compareAtPrice, locale)}
                      </span>
                      <span className="bg-sale/10 text-sale rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums">
                        <bdi dir="ltr">−{nf.format(percent)}%</bdi>
                      </span>
                    </>
                  ) : null}
                </div>
                {product.compareAtPrice ? (
                  <p className="text-success mt-1 text-xs font-semibold tabular-nums">
                    {dict.common.save}{" "}
                    {formatPrice(
                      product.compareAtPrice - product.price,
                      locale,
                    )}
                  </p>
                ) : null}
                <p className="text-ink-500 mt-1.5 flex items-center gap-1.5 text-[11px]">
                  <TruckIcon className="text-mint-600 size-3.5" />
                  {qualifiesFree
                    ? dict.cart.freeShippingReached
                    : t(dict.cart.freeShippingProgress, {
                        amount: formatPrice(
                          FREE_SHIPPING_THRESHOLD - product.price,
                          locale,
                        ),
                      })}
                </p>
              </div>

              <div className="mt-4">
                <BuyBox product={product} locale={locale} dict={dict} />
              </div>

              <ul className="border-ink-200 text-ink-600 mt-5 space-y-2 border-t pt-4 text-[11px]">
                {[
                  { Icon: TruckIcon, text: dict.home.usp.delivery.title },
                  { Icon: ReturnIcon, text: dict.home.usp.returns.title },
                  { Icon: CardIcon, text: dict.home.usp.payment.title },
                  { Icon: ShieldIcon, text: dict.home.usp.safety.title },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex items-center gap-2">
                    <Icon className="text-ink-400 size-4 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>

              <p className="text-ink-400 mt-4 text-[10px]">
                {dict.product.sku}: {product.handle.toUpperCase().slice(0, 18)}
                {available ? null : ` · ${dict.product.outOfStock}`}
              </p>
            </div>
          </aside>
        </div>

        {/* related */}
        {related.length > 0 ? (
          <section className="mt-8">
            <div className="ring-ink-200 overflow-hidden rounded-xl bg-white ring-1">
              <div className="border-ink-200 border-b px-4 py-3">
                <h2 className="text-ink-900 text-sm font-bold">
                  {dict.product.relatedTitle}
                </h2>
              </div>
              <ul className="no-scrollbar flex gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-5 lg:overflow-visible">
                {related.map((item) => (
                  <li key={item.id} className="w-40 shrink-0 lg:w-auto">
                    <MarketProductCard
                      product={item}
                      locale={locale}
                      dict={dict}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
