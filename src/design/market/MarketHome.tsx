import Link from "next/link";

import { DoodleField } from "@/components/brand/Doodles";
import { ProductArt } from "@/components/product/ProductArt";
import { ArrowIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import {
  getBestsellers,
  getNewIn,
  getOnSale,
  getAllProducts,
} from "@/lib/catalog/queries";
import { CATEGORIES } from "@/lib/catalog/taxonomy";
import { AGE_GROUP_LABELS, type AgeGroup } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/money";
import { routes } from "@/lib/routes";
import { MarketProductCard } from "./MarketProductCard";

const AGE_KEYS = Object.keys(AGE_GROUP_LABELS) as AgeGroup[];

/**
 * Market homepage.
 *
 * Studio opens with a single quiet hero and eases into the catalogue. This one
 * puts merchandise above the fold: a promo grid, then a category strip, then
 * rails that lead with price. The intent is a shopper who lands and clicks,
 * not a visitor who reads.
 */
export function MarketHome({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const onSale = getOnSale(6);
  const newIn = getNewIn(6);
  const bestsellers = getBestsellers(5);
  // Entry price for the promo tile — of the department it links to, not the
  // whole catalogue, or the number is a lie.
  const travelFrom = Math.min(
    ...getAllProducts()
      .filter((p) => p.department === "travel")
      .map((p) => p.price),
  );

  return (
    <div className="bg-canvas">
      <PromoGrid locale={locale} dict={dict} travelFrom={travelFrom} />
      <CategoryStrip locale={locale} dict={dict} />
      <AgeChips locale={locale} dict={dict} />

      <Rail
        title={dict.home.onSale}
        href={routes.collection(locale, "sale")}
        viewAll={dict.common.viewAll}
        products={onSale}
        locale={locale}
        dict={dict}
        accent
      />
      <Rail
        title={dict.home.newIn}
        href={routes.collection(locale, "new-in")}
        viewAll={dict.common.viewAll}
        products={newIn}
        locale={locale}
        dict={dict}
      />

      <BestsellerBlock
        locale={locale}
        dict={dict}
        products={bestsellers}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PromoGrid({
  locale,
  dict,
  travelFrom,
}: {
  locale: Locale;
  dict: Dictionary;
  travelFrom: number;
}) {
  return (
    <section className="container-bambino pt-5 pb-8">
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        {/* main promo */}
        <Link
          href={routes.collection(locale, "new-in")}
          className="from-brand-600 to-brand-900 group relative flex min-h-64 overflow-hidden rounded-xl bg-linear-to-br p-7 text-white lg:min-h-80 lg:p-10"
        >
          <div
            aria-hidden="true"
            className="text-mint-300/15 pointer-events-none absolute inset-0"
          >
            <DoodleField id="market-promo" />
          </div>
          <div className="relative flex flex-col justify-center">
            <span className="bg-mint-300 text-brand-900 inline-flex w-fit rounded px-2 py-1 text-[11px] font-bold tracking-wide uppercase">
              {dict.common.new}
            </span>
            <h1 className="mt-4 max-w-md text-3xl leading-tight font-bold lg:text-4xl">
              {dict.home.heroTitle}
            </h1>
            <p className="text-mint-200/90 mt-3 max-w-sm text-sm">
              {dict.home.heroBody}
            </p>
            <span className="text-brand-800 mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold transition-transform group-hover:translate-x-0.5">
              {dict.home.heroCta}
              <ArrowIcon className="flip-rtl size-4" />
            </span>
          </div>
        </Link>

        {/* stacked secondary promos */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href={routes.collection(locale, "sale")}
            className="ring-ink-200 group relative flex min-h-32 items-center gap-4 overflow-hidden rounded-xl bg-white p-5 ring-1"
          >
            <div>
              <p className="text-sale text-2xl font-extrabold">
                {dict.home.onSale}
              </p>
              <p className="text-ink-500 mt-1 text-xs">
                {dict.home.onSaleBody}
              </p>
              <p className="text-ink-900 mt-2 text-xs font-semibold">
                {dict.common.shopNow} →
              </p>
            </div>
            <ProductArt
              art="dress"
              seed="promo-sale"
              className="ms-auto size-24 shrink-0 rounded-lg transition-transform group-hover:scale-105"
            />
          </Link>

          <Link
            href={routes.department(locale, "travel")}
            className="ring-ink-200 group relative flex min-h-32 items-center gap-4 overflow-hidden rounded-xl bg-white p-5 ring-1"
          >
            <div>
              <p className="text-ink-900 text-lg font-bold">
                {dict.home.heroCtaAlt}
              </p>
              <p className="text-ink-500 mt-1 text-xs">
                {dict.home.usp.safety.body}
              </p>
              <p className="text-brand-600 mt-2 text-xs font-semibold tabular-nums">
                {dict.common.from} {formatPrice(travelFrom, locale)}
              </p>
            </div>
            <ProductArt
              art="stroller"
              seed="promo-travel"
              className="ms-auto size-24 shrink-0 rounded-lg transition-transform group-hover:scale-105"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryStrip({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <section className="container-bambino pb-8">
      <div className="ring-ink-200 rounded-xl bg-white p-4 ring-1">
        <h2 className="text-ink-900 mb-3 text-sm font-bold">
          {dict.home.shopByCategory}
        </h2>
        <ul className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 lg:grid lg:grid-cols-7 lg:overflow-visible">
          {CATEGORIES.slice(0, 7).map((category) => (
            <li key={category.slug} className="shrink-0">
              <Link
                href={routes.category(locale, category.slug)}
                className="group hover:bg-ink-50 flex w-24 flex-col items-center gap-2 rounded-lg p-2 transition-colors lg:w-auto"
              >
                <ProductArt
                  art={category.art}
                  seed={category.slug}
                  className="size-16 rounded-full transition-transform group-hover:scale-105"
                />
                <span className="text-ink-700 group-hover:text-brand-600 text-center text-[11px] leading-tight font-medium">
                  {category.name[locale]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AgeChips({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="container-bambino pb-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-ink-900 me-1 text-sm font-bold">
          {dict.home.shopByAge}:
        </span>
        {AGE_KEYS.map((age) => (
          <Link
            key={age}
            href={`${routes.collection(locale, "new-in")}?age=${age}`}
            className="ring-ink-300 text-ink-700 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 inline-flex rounded-lg bg-white px-3 py-1.5 text-xs font-medium ring-1 transition-colors"
          >
            {AGE_GROUP_LABELS[age][locale]}
          </Link>
        ))}
      </div>
    </section>
  );
}

function Rail({
  title,
  href,
  viewAll,
  products,
  locale,
  dict,
  accent = false,
}: {
  title: string;
  href: string;
  viewAll: string;
  products: ReturnType<typeof getOnSale>;
  locale: Locale;
  dict: Dictionary;
  accent?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section className="container-bambino pb-8">
      <div className="ring-ink-200 overflow-hidden rounded-xl bg-white ring-1">
        <div
          className={`flex items-center justify-between px-4 py-3 ${
            accent ? "bg-sale text-white" : "border-ink-200 border-b"
          }`}
        >
          <h2
            className={`text-sm font-bold ${accent ? "" : "text-ink-900"}`}
          >
            {title}
          </h2>
          <Link
            href={href}
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              accent ? "text-white" : "text-brand-600 hover:text-brand-700"
            }`}
          >
            {viewAll}
            <ArrowIcon className="flip-rtl size-3.5" />
          </Link>
        </div>

        <ul className="no-scrollbar flex gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-6 lg:overflow-visible">
          {products.map((product) => (
            <li
              key={product.id}
              className="w-40 shrink-0 sm:w-44 lg:w-auto"
            >
              <MarketProductCard
                product={product}
                locale={locale}
                dict={dict}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BestsellerBlock({
  locale,
  dict,
  products,
}: {
  locale: Locale;
  dict: Dictionary;
  products: ReturnType<typeof getBestsellers>;
}) {
  if (products.length === 0) return null;

  return (
    <section className="container-bambino pb-12">
      <div className="grid gap-3 lg:grid-cols-[16rem_1fr]">
        <div className="from-mint-100 to-canvas-mint ring-ink-200 flex flex-col justify-center rounded-xl bg-linear-to-b p-6 ring-1">
          <h2 className="text-ink-900 text-xl font-bold">
            {dict.home.bestsellers}
          </h2>
          <p className="text-ink-500 mt-2 text-xs leading-relaxed">
            {dict.home.bestsellersBody}
          </p>
          <Link
            href={routes.collection(locale, "bestsellers")}
            className="text-brand-600 hover:text-brand-700 mt-4 inline-flex items-center gap-1 text-xs font-semibold"
          >
            {dict.common.viewAll}
            <ArrowIcon className="flip-rtl size-3.5" />
          </Link>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <li key={product.id}>
              <MarketProductCard
                product={product}
                locale={locale}
                dict={dict}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
