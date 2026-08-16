import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { Cloud, DoodleField, Sprig, Sun } from "@/components/brand/Doodles";
import { ProductArt } from "@/components/product/ProductArt";
import { ProductRail } from "@/components/product/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import {
  ArrowIcon,
  CardIcon,
  ReturnIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { getDictionary } from "@/i18n/get-dictionary";
import { getBestsellers, getNewIn, getOnSale } from "@/lib/catalog/queries";
import { CATEGORIES } from "@/lib/catalog/taxonomy";
import { AGE_GROUP_LABELS, type AgeGroup } from "@/lib/catalog/types";
import { routes } from "@/lib/routes";

const USP_ICONS = [TruckIcon, ReturnIcon, CardIcon, ShieldIcon];
const AGE_KEYS = Object.keys(AGE_GROUP_LABELS) as AgeGroup[];

type Dict = ReturnType<typeof getDictionary>;

export async function StudioHome({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  const [newIn, bestsellers, onSale] = await Promise.all([
    getNewIn(4),
    getBestsellers(4),
    getOnSale(4),
  ]);
  const featuredCategories = CATEGORIES.slice(0, 8);

  return (
    <>
      <Hero locale={locale} dict={dict} />

      <ShopByAge locale={locale} dict={dict} />

      <ProductRail
        title={dict.home.newIn}
        body={dict.home.newInBody}
        href={routes.collection(locale, "new-in")}
        viewAllLabel={dict.common.viewAll}
        products={newIn}
        locale={locale}
        dict={dict}
      />

      <ShopByCategory
        locale={locale}
        dict={dict}
        categories={featuredCategories}
      />

      <ProductRail
        title={dict.home.bestsellers}
        body={dict.home.bestsellersBody}
        href={routes.collection(locale, "bestsellers")}
        viewAllLabel={dict.common.viewAll}
        products={bestsellers}
        locale={locale}
        dict={dict}
      />

      <BrandStory locale={locale} dict={dict} />

      <ProductRail
        title={dict.home.onSale}
        body={dict.home.onSaleBody}
        href={routes.collection(locale, "sale")}
        viewAllLabel={dict.common.viewAll}
        products={onSale}
        locale={locale}
        dict={dict}
      />

      <Usps dict={dict} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Hero({ locale, dict }: { locale: Locale; dict: Dict }) {
  return (
    <section className="from-brand-50 via-canvas to-mint-50 relative overflow-hidden bg-linear-to-br">
      <div
        aria-hidden="true"
        className="text-mint-400/18 pointer-events-none absolute inset-0"
      >
        <DoodleField id="hero-doodles" />
      </div>

      <div className="container-bambino relative grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        <div className="animate-fade-up">
          <p className="text-brand-600 text-xs font-medium tracking-[0.18em] uppercase">
            {dict.home.heroEyebrow}
          </p>
          <h1 className="text-brand-900 mt-4 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {dict.home.heroTitle}
          </h1>
          <p className="text-ink-600 mt-5 max-w-md text-base leading-relaxed sm:text-lg">
            {dict.home.heroBody}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href={routes.collection(locale, "new-in")}
              size="lg"
              variant="primary"
            >
              {dict.home.heroCta}
              <ArrowIcon className="flip-rtl size-4.5" />
            </ButtonLink>
            <ButtonLink
              href={routes.department(locale, "nursery")}
              size="lg"
              variant="secondary"
            >
              {dict.home.heroCtaAlt}
            </ButtonLink>
          </div>

          <ul className="text-ink-500 mt-10 flex flex-wrap gap-x-7 gap-y-2 text-xs">
            <li className="flex items-center gap-1.5">
              <TruckIcon className="text-mint-500 size-4" />
              {dict.home.usp.delivery.title}
            </li>
            <li className="flex items-center gap-1.5">
              <ReturnIcon className="text-mint-500 size-4" />
              {dict.home.usp.returns.title}
            </li>
            <li className="flex items-center gap-1.5">
              <CardIcon className="text-mint-500 size-4" />
              {dict.home.usp.payment.title}
            </li>
          </ul>
        </div>

        {/* Illustrated stage — a stand-in for the hero photography. */}
        <div className="relative">
          <div className="from-brand-100 to-mint-100 relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-[3rem] bg-linear-to-br">
            <Sun className="text-mint-400 absolute start-[12%] top-[14%] size-14 opacity-70" />
            <Cloud className="text-mint-300 absolute end-[14%] top-[22%] size-20 opacity-80" />
            <Sprig className="text-mint-500 absolute start-[18%] bottom-[14%] h-20 w-auto opacity-60" />
            <Cloud className="text-brand-200 absolute end-[20%] bottom-[18%] size-14 opacity-90" />
            <BambinoMark
              className="animate-float text-brand-500 absolute inset-0 m-auto h-[52%] w-auto"
              leafColor="#B7D2DD"
            />
          </div>

          <div className="bg-paper/90 ring-brand-100 absolute -bottom-4 start-2 rounded-2xl px-4 py-3 shadow-lg shadow-brand-900/5 ring-1 backdrop-blur-sm sm:start-6">
            <p className="text-brand-600 text-[11px] font-medium tracking-[0.14em] uppercase">
              {dict.brand.tagline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShopByAge({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  return (
    <section className="container-bambino pt-14 lg:pt-20">
      <h2 className="text-ink-900 text-2xl font-medium tracking-tight sm:text-3xl">
        {dict.home.shopByAge}
      </h2>
      <p className="text-ink-500 mt-1.5 text-sm">{dict.home.shopByAgeBody}</p>

      <ul className="no-scrollbar mt-6 -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
        {AGE_KEYS.map((age) => (
          <li key={age} className="shrink-0">
            <Link
              href={`${routes.collection(locale, "new-in")}?age=${age}`}
              className="bg-canvas-mint hover:bg-mint-100 ring-mint-200/70 flex h-full min-w-36 flex-col items-center justify-center gap-1 rounded-2xl px-4 py-5 text-center ring-1 transition-colors"
            >
              <span className="text-mint-800 text-sm font-medium">
                {AGE_GROUP_LABELS[age][locale]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ShopByCategory({
  locale,
  dict,
  categories,
}: {
  locale: Locale;
  dict: Dict;
  categories: typeof CATEGORIES;
}) {
  return (
    <section className="container-bambino py-14 lg:py-16">
      <h2 className="text-ink-900 text-2xl font-medium tracking-tight sm:text-3xl">
        {dict.home.shopByCategory}
      </h2>

      <ul className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={routes.category(locale, category.slug)}
              className="group ring-ink-200/70 hover:ring-brand-200 block overflow-hidden rounded-3xl ring-1 transition-all"
            >
              <ProductArt
                art={category.art}
                seed={category.slug}
                className="aspect-5/4 w-full transition-transform duration-500 group-hover:scale-[1.05]"
              />
              <div className="bg-paper px-4 py-3.5">
                <p className="text-ink-900 group-hover:text-brand-700 text-sm font-medium transition-colors">
                  {category.name[locale]}
                </p>
                <p className="text-ink-400 mt-0.5 text-xs">
                  {category.blurb?.[locale] ?? ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BrandStory({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dict;
}) {
  const pillars = [
    dict.home.pillars.quality,
    dict.home.pillars.dress,
    dict.home.pillars.grow,
    dict.home.pillars.happy,
  ];

  return (
    <section className="bg-brand-900 relative overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="text-mint-300/10 pointer-events-none absolute inset-0"
      >
        <DoodleField id="story-doodles" />
      </div>

      <div className="container-bambino relative grid gap-12 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:py-24">
        <div>
          <BambinoMark className="text-mint-300 h-20 w-auto" />
          <h2 className="mt-7 text-3xl font-medium tracking-tight sm:text-4xl">
            {dict.home.storyTitle}
          </h2>
          <p className="text-mint-200/85 mt-5 max-w-md leading-relaxed">
            {dict.home.storyBody}
          </p>
          <ButtonLink
            href={routes.about(locale)}
            variant="quiet"
            size="md"
            className="mt-8"
          >
            {dict.home.storyCta}
            <ArrowIcon className="flip-rtl size-4" />
          </ButtonLink>
        </div>

        <ul className="grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <li key={pillar.title} className="bg-brand-900 p-7">
              <h3 className="text-mint-300 text-lg font-medium">
                {pillar.title}
              </h3>
              <p className="text-mint-200/70 mt-2 text-sm leading-relaxed">
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Usps({ dict }: { dict: Dict }) {
  const items = [
    dict.home.usp.delivery,
    dict.home.usp.returns,
    dict.home.usp.payment,
    dict.home.usp.safety,
  ];

  return (
    <section className="container-bambino py-14 lg:py-16">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = USP_ICONS[i];
          return (
            <li
              key={item.title}
              className="bg-canvas-mint ring-mint-200/60 rounded-3xl p-6 ring-1"
            >
              <span className="bg-paper text-mint-600 inline-flex size-11 items-center justify-center rounded-full">
                <Icon className="size-5.5" />
              </span>
              <h3 className="text-ink-900 mt-4 text-sm font-medium">
                {item.title}
              </h3>
              <p className="text-ink-500 mt-1 text-xs leading-relaxed">
                {item.body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
