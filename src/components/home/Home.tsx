import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { DoodleField } from "@/components/brand/Doodles";
import { ProductArt } from "@/components/product/ProductArt";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import {
  getBestsellers,
  getNewIn,
  getOnSale,
  getAllProducts,
} from "@/lib/catalog/queries";
import { loadCategories } from "@/lib/catalog/categories";
import type { Category } from "@/lib/catalog/types";
import {
  AGE_GROUP_LABELS,
  type AgeGroup,
  type Product,
} from "@/lib/catalog/types";
import { formatPrice } from "@/lib/money";
import { routes } from "@/lib/routes";

const AGE_KEYS = Object.keys(AGE_GROUP_LABELS) as AgeGroup[];

/**
 * An editorial front page: one hero that states the brand in a serif and
 * offers two doors in, then the catalogue in generous rails with no boxes
 * around them. The shop's own words appear once, mid-page, on cream.
 */
export async function Home({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [onSale, newIn, bestsellers, all, categories] = await Promise.all([
    getOnSale(8),
    getNewIn(8),
    getBestsellers(5),
    getAllProducts(),
    loadCategories(),
  ]);
  // Entry price for the hero's second door — of the department it opens, not
  // the whole catalogue, or the number is a lie.
  const nurseryPrices = all
    .filter((p) => p.department === "nursery")
    .map((p) => p.price);
  const nurseryFrom = nurseryPrices.length ? Math.min(...nurseryPrices) : null;

  return (
    <div className="bg-paper">
      <Hero locale={locale} dict={dict} nurseryFrom={nurseryFrom} />
      <CategoryStrip locale={locale} dict={dict} categories={categories} />

      <Rail
        eyebrow={dict.home.newInBody}
        title={dict.home.newIn}
        href={routes.collection(locale, "new-in")}
        viewAll={dict.common.viewAll}
        products={newIn}
        locale={locale}
        dict={dict}
      />

      <Story locale={locale} dict={dict} />

      <Rail
        eyebrow={dict.home.bestsellersBody}
        title={dict.home.bestsellers}
        href={routes.collection(locale, "bestsellers")}
        viewAll={dict.common.viewAll}
        products={bestsellers}
        locale={locale}
        dict={dict}
        columns={5}
      />

      <AgeBand locale={locale} dict={dict} />

      <Rail
        eyebrow={dict.home.onSaleBody}
        title={dict.home.onSale}
        href={routes.collection(locale, "sale")}
        viewAll={dict.common.viewAll}
        products={onSale}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Hero({
  locale,
  dict,
  nurseryFrom,
}: {
  locale: Locale;
  dict: Dictionary;
  nurseryFrom: number | null;
}) {
  return (
    <section className="bg-canvas">
      <div className="container-bambino grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
        <div className="animate-fade-up max-w-xl">
          <p className="eyebrow">{dict.home.heroEyebrow}</p>
          <h1 className="font-display text-ink-900 mt-5 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            {dict.home.heroTitle}
          </h1>
          <p className="text-ink-600 mt-6 max-w-md text-[17px] leading-relaxed">
            {dict.home.heroBody}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href={routes.collection(locale, "new-in")} size="lg">
              {dict.home.heroCta}
            </ButtonLink>
            <ButtonLink
              href={routes.department(locale, "nursery")}
              variant="secondary"
              size="lg"
            >
              {dict.home.heroCtaAlt}
              {nurseryFrom !== null ? (
                <span className="text-ink-500 ms-1 text-[12px] normal-case tracking-normal tabular-nums">
                  · {dict.common.from} {formatPrice(nurseryFrom, locale)}
                </span>
              ) : null}
            </ButtonLink>
          </div>
        </div>

        {/* The visual: plum, the mark, and the packaging's doodles. */}
        <Link
          href={routes.collection(locale, "new-in")}
          aria-label={dict.home.heroCta}
          className="group bg-brand-900 relative block aspect-[5/4] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)] lg:aspect-[4/5] lg:max-h-[38rem]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 text-white/12 transition-transform duration-[1200ms] ease-[var(--ease-out-quint)] group-hover:scale-105"
          >
            <DoodleField id="hero-doodles" />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgb(189_114_162_/_0.55),transparent_60%)]"
          />
          <BambinoMark
            className="animate-float absolute start-1/2 top-1/2 h-40 w-auto -translate-x-1/2 -translate-y-1/2 text-white/95 drop-shadow-[0_20px_40px_rgb(0_0_0_/_0.25)] sm:h-52 lg:h-64 rtl:translate-x-1/2"
            leafColor="#B7D2DD"
          />
          <p className="font-display absolute inset-x-8 bottom-8 text-2xl leading-tight text-white/90 sm:text-3xl">
            {dict.brand.tagline}
          </p>
        </Link>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  href,
  viewAll,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  viewAll?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="font-display text-ink-900 mt-2 text-3xl leading-tight sm:text-4xl">
          {title}
        </h2>
      </div>
      {href && viewAll ? (
        <Link
          href={href}
          className="link-draw text-ink-900 mb-1.5 inline-flex shrink-0 items-center gap-2 text-[12px] font-medium tracking-[0.14em] uppercase [html[lang=ar]_&]:text-sm [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case"
        >
          {viewAll}
          <ArrowIcon className="flip-rtl size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function CategoryStrip({
  locale,
  dict,
  categories,
}: {
  locale: Locale;
  dict: Dictionary;
  categories: Category[];
}) {
  return (
    <section className="container-bambino pt-16 lg:pt-20">
      <SectionHead title={dict.home.shopByCategory} />
      <ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-7 lg:gap-6 lg:overflow-visible">
        {categories.slice(0, 7).map((category) => (
          <li key={category.slug} className="w-28 shrink-0 lg:w-auto">
            <Link
              href={routes.category(locale, category.slug)}
              className="group flex flex-col items-center gap-3 text-center"
            >
              <span className="ring-ink-200 group-hover:ring-brand-400 block overflow-hidden rounded-full ring-1 transition-[box-shadow] duration-300">
                <ProductArt
                  art={category.art}
                  seed={category.slug}
                  className="size-24 transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-105 lg:size-28"
                />
              </span>
              <span className="text-ink-800 group-hover:text-ink-900 text-[13px] leading-tight">
                {category.name[locale]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Rail({
  eyebrow,
  title,
  href,
  viewAll,
  products,
  locale,
  dict,
  columns = 4,
}: {
  eyebrow?: string;
  title: string;
  href: string;
  viewAll: string;
  products: Product[];
  locale: Locale;
  dict: Dictionary;
  columns?: 4 | 5;
}) {
  if (products.length === 0) return null;
  const cols = columns === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4";

  return (
    <section className="container-bambino pt-16 lg:pt-20">
      <SectionHead
        eyebrow={eyebrow}
        title={title}
        href={href}
        viewAll={viewAll}
      />
      <ul
        className={`no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 sm:overflow-visible sm:px-0 ${cols}`}
      >
        {products.map((product) => (
          <li key={product.id} className="w-44 shrink-0 sm:w-auto">
            <ProductCard product={product} locale={locale} dict={dict} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Story({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="container-bambino pt-16 lg:pt-24">
      <div className="bg-canvas relative overflow-hidden rounded-[2rem] px-8 py-14 text-center sm:px-16 lg:py-20">
        <div
          aria-hidden="true"
          className="text-mint-500/14 pointer-events-none absolute inset-0"
        >
          <DoodleField id="story-doodles" />
        </div>
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow">{dict.home.storyCta}</p>
          <h2 className="font-display text-ink-900 mt-4 text-3xl leading-tight sm:text-4xl">
            {dict.home.storyTitle}
          </h2>
          <p className="text-ink-600 mt-5 text-[15px] leading-relaxed sm:text-base">
            {dict.home.storyBody}
          </p>
          <ButtonLink
            href={routes.about(locale)}
            variant="secondary"
            size="md"
            className="mt-8"
          >
            {dict.home.storyCta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function AgeBand({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="container-bambino pt-16 lg:pt-20">
      <div className="border-ink-200/70 flex flex-col gap-5 border-y py-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-ink-900 text-2xl">
            {dict.home.shopByAge}
          </h2>
          <p className="text-ink-500 mt-1 text-sm">{dict.home.shopByAgeBody}</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {AGE_KEYS.map((age) => (
            <li key={age}>
              <Link
                href={`${routes.collection(locale, "new-in")}?age=${age}`}
                className="ring-ink-300 text-ink-800 hover:bg-brand-900 hover:text-white hover:ring-brand-900 inline-flex rounded-full px-4 py-2.5 text-[13px] ring-1 transition-colors duration-200"
              >
                {AGE_GROUP_LABELS[age][locale]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
