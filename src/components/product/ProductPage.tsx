import Link from "next/link";

import { BuyBox } from "@/components/product/BuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
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
import { DEPARTMENT_LABELS, inStock, type Product } from "@/lib/catalog/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { discountPercent, formatPrice } from "@/lib/money";
import { deliveryCopy } from "@/lib/delivery-copy";
import { loadShipping } from "@/lib/site-settings";
import { routes } from "@/lib/routes";
import { ProductCard } from "@/components/product/ProductCard";

export type ProductViewProps = {
  product: Product;
  related: Product[];
  locale: Locale;
  dict: Dictionary;
};

/**
 * Gallery at the start, a sticky buying column at the end, hairlines between
 * the parts of the column. The name is set in the serif; the price in a
 * regular weight below it. Everything the shopper needs to decide is in the
 * first screen; the description and care notes follow underneath.
 */
export async function ProductPage({
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
  const shipping = await loadShipping();
  const delivery = deliveryCopy(shipping, dict, locale);
  const qualifiesFree = product.price >= shipping.freeThreshold;

  const crumb =
    "text-ink-400 hover:text-ink-900 transition-colors duration-200";

  return (
    <div className="bg-paper">
      <div className="container-bambino pt-6 lg:pt-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.1em] uppercase [html[lang=ar]_&]:text-[12px] [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case">
            <li>
              <Link href={routes.home(locale)} className={crumb}>
                {dict.nav.home}
              </Link>
            </li>
            <li aria-hidden="true" className="text-ink-300">
              /
            </li>
            <li>
              <Link
                href={routes.department(locale, product.department)}
                className={crumb}
              >
                {DEPARTMENT_LABELS[product.department][locale]}
              </Link>
            </li>
            {category ? (
              <>
                <li aria-hidden="true" className="text-ink-300">
                  /
                </li>
                <li>
                  <Link
                    href={routes.category(locale, category.slug)}
                    className={crumb}
                  >
                    {category.name[locale]}
                  </Link>
                </li>
              </>
            ) : null}
          </ol>
        </nav>

        {/* On a phone the order is gallery, name and price, then the copy;
            on a desktop the buying column sits beside both. Grid placement
            does that without duplicating any of the three. */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-x-16 lg:gap-y-12 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="lg:col-start-1 lg:row-start-1">
            <div className="relative">
              <ProductGallery
                images={product.images}
                art={product.art}
                productId={product.id}
                label={t(dict.a11y.productImage, {
                  name: product.name[locale],
                })}
                thumbLabel={t(dict.a11y.productImage, {
                  name: product.name[locale],
                })}
              />
              {percent > 0 ? (
                <span className="bg-brand-900 absolute start-4 top-4 z-10 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.08em] text-white tabular-nums uppercase">
                  <bdi dir="ltr">−{nf.format(percent)}%</bdi>
                </span>
              ) : null}
            </div>
          </div>

          {/* buy column */}
          <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-36 lg:self-start">
            {category ? (
              <Link
                href={routes.category(locale, category.slug)}
                className="eyebrow link-draw"
              >
                {category.name[locale]}
              </Link>
            ) : null}
            <h1 className="font-display text-ink-900 mt-3 text-3xl leading-tight sm:text-4xl">
              {product.name[locale]}
            </h1>

            {product.reviewCount > 0 ? (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-gold-500 inline-flex gap-px">
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
                <span className="text-ink-500 text-[12px] tabular-nums">
                  {nf.format(product.rating)} ·{" "}
                  {plural(dict.product, "reviews", product.reviewCount)}
                </span>
              </div>
            ) : null}

            <p className="text-ink-600 mt-4 text-[15px] leading-relaxed">
              {product.summary[locale]}
            </p>

            {/* price */}
            <div className="border-ink-200/70 mt-6 border-y py-5">
              <div className="flex flex-wrap items-baseline gap-3">
                <span
                  className={`text-2xl tabular-nums ${
                    percent > 0 ? "text-sale" : "text-ink-900"
                  }`}
                >
                  {formatPrice(product.price, locale)}
                </span>
                {product.compareAtPrice ? (
                  <span className="text-ink-400 text-sm line-through tabular-nums">
                    {formatPrice(product.compareAtPrice, locale)}
                  </span>
                ) : null}
              </div>
              <p className="text-ink-500 mt-2 flex items-center gap-2 text-[12px]">
                <TruckIcon className="text-brand-600 size-4" />
                {qualifiesFree
                  ? dict.cart.freeShippingReached
                  : t(dict.cart.freeShippingProgress, {
                      amount: formatPrice(
                        shipping.freeThreshold - product.price,
                        locale,
                      ),
                    })}
              </p>
            </div>

            <div className="mt-6">
              <BuyBox product={product} locale={locale} dict={dict} />
            </div>

            <ul className="border-ink-200/70 text-ink-600 mt-7 space-y-2.5 border-t pt-5 text-[12px]">
              {[
                { Icon: TruckIcon, text: dict.home.usp.delivery.title },
                { Icon: ReturnIcon, text: dict.home.usp.returns.title },
                { Icon: CardIcon, text: dict.home.usp.payment.title },
                { Icon: ShieldIcon, text: dict.home.usp.safety.title },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <Icon className="text-ink-400 size-4 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            <p className="text-ink-400 mt-5 text-[11px] tracking-[0.08em] uppercase [html[lang=ar]_&]:tracking-normal">
              {dict.product.sku}: {product.handle.toUpperCase().slice(0, 18)}
              {available ? null : ` · ${dict.product.outOfStock}`}
            </p>
          </aside>

          <div className="lg:col-start-1 lg:row-start-2">
            <div className="max-w-2xl">
              <Accordion title={dict.product.description} defaultOpen>
                <p>{product.description[locale]}</p>
              </Accordion>
              <Accordion title={dict.product.details} defaultOpen>
                <ul className="space-y-2">
                  {product.details.map((detail) => (
                    <li key={detail.en} className="flex gap-3">
                      <CheckIcon className="text-brand-600 mt-1 size-4 shrink-0" />
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
                <p>{delivery.productBody}</p>
              </Accordion>
            </div>
          </div>
        </div>

        {/* related */}
        {related.length > 0 ? (
          <section className="mt-20 lg:mt-28">
            <h2 className="font-display text-ink-900 mb-8 text-3xl leading-tight">
              {dict.product.relatedTitle}
            </h2>
            <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-5">
              {related.map((item) => (
                <li key={item.id} className="w-44 shrink-0 sm:w-auto">
                  <ProductCard product={item} locale={locale} dict={dict} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
