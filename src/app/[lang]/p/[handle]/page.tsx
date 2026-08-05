import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyBox } from "@/components/product/BuyBox";
import { ProductArt } from "@/components/product/ProductArt";
import { ProductRail } from "@/components/product/ProductGrid";
import { Accordion } from "@/components/ui/Accordion";
import { DiscountBadge, Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { TruckIcon, ReturnIcon, ShieldIcon } from "@/components/ui/Icons";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import { PRODUCTS } from "@/lib/catalog/products";
import { getProductByHandle, getRelated } from "@/lib/catalog/queries";
import { categoryBySlug } from "@/lib/catalog/taxonomy";
import { DEPARTMENT_LABELS } from "@/lib/catalog/types";
import { routes } from "@/lib/routes";

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    PRODUCTS.map((product) => ({ lang, handle: product.handle })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; handle: string }>;
}): Promise<Metadata> {
  const { lang, handle } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const product = getProductByHandle(handle);
  if (!product) return {};

  return {
    title: product.name[locale],
    description: product.summary[locale],
    alternates: {
      canonical: routes.product(locale, handle),
      languages: {
        en: routes.product("en", handle),
        ar: routes.product("ar", handle),
      },
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/[lang]/p/[handle]">) {
  const { lang, handle } = await params;
  if (!isLocale(lang)) notFound();

  const product = getProductByHandle(handle);
  if (!product) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const { t, plural } = createTranslator(locale);
  const category = categoryBySlug(product.category);
  const related = getRelated(product, 4);

  return (
    <>
      <div className="container-bambino py-6 lg:py-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="text-ink-400 flex flex-wrap items-center gap-1.5 text-xs">
            <li>
              <Link href={routes.home(locale)} className="hover:text-brand-600">
                {dict.nav.home}
              </Link>
            </li>
            <li aria-hidden="true" className="opacity-50">/</li>
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
                <li aria-hidden="true" className="opacity-50">/</li>
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

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* gallery */}
          <div>
            <div className="bg-canvas relative overflow-hidden rounded-[2rem]">
              <ProductArt
                art={product.art}
                seed={product.id}
                label={t(dict.a11y.productImage, {
                  name: product.name[locale],
                })}
                className="aspect-square w-full"
              />
              <div className="absolute start-5 top-5 flex flex-col gap-2">
                <DiscountBadge
                  amount={product.price}
                  compareAt={product.compareAtPrice}
                  label={dict.common.off}
                  locale={locale}
                />
              </div>
            </div>

            {/* thumbnails — same illustration, different crops, until photography lands */}
            <ul className="mt-3 grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <li key={i}>
                  <span
                    className={`block overflow-hidden rounded-2xl ring-1 transition-colors ${
                      i === 0 ? "ring-brand-400" : "ring-ink-200"
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
          </div>

          {/* details */}
          <div>
            {category ? (
              <p className="text-brand-600 text-xs font-medium tracking-[0.16em] uppercase">
                {category.name[locale]}
              </p>
            ) : null}
            <h1 className="text-brand-900 mt-2.5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.name[locale]}
            </h1>
            <p className="text-ink-500 mt-2 text-base">
              {product.summary[locale]}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Price
                amount={product.price}
                compareAt={product.compareAtPrice}
                locale={locale}
                size="lg"
              />
              <Rating
                value={product.rating}
                count={product.reviewCount}
                locale={locale}
                label={t(dict.a11y.rating, { rating: product.rating })}
                countLabel={plural(dict.product, "reviews", product.reviewCount)}
              />
            </div>

            <div className="border-ink-100 mt-7 border-t pt-7">
              <BuyBox product={product} locale={locale} dict={dict} />
            </div>

            <ul className="text-ink-600 mt-8 grid gap-3 text-xs sm:grid-cols-3">
              {[
                { Icon: TruckIcon, label: dict.home.usp.delivery.title },
                { Icon: ReturnIcon, label: dict.home.usp.returns.title },
                { Icon: ShieldIcon, label: dict.home.usp.safety.title },
              ].map(({ Icon, label }) => (
                <li
                  key={label}
                  className="bg-canvas-mint flex items-center gap-2 rounded-xl px-3 py-2.5"
                >
                  <Icon className="text-mint-600 size-4.5 shrink-0" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Accordion title={dict.product.description} defaultOpen>
                <p>{product.description[locale]}</p>
              </Accordion>
              <Accordion title={dict.product.details}>
                <ul className="space-y-2">
                  {product.details.map((detail) => (
                    <li key={detail.en} className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="bg-brand-300 mt-2 size-1.5 shrink-0 rounded-full"
                      />
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

            <p className="text-ink-400 mt-6 text-xs">
              {dict.product.sku}: {product.handle.toUpperCase().slice(0, 18)}
            </p>
          </div>
        </div>
      </div>

      <ProductRail
        title={dict.product.relatedTitle}
        viewAllLabel={dict.common.viewAll}
        href={category ? routes.category(locale, category.slug) : undefined}
        products={related}
        locale={locale}
        dict={dict}
      />
    </>
  );
}
