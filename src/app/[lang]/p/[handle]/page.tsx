import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductView } from "@/design";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { PRODUCTS } from "@/lib/catalog/products";
import { getProductByHandle, getRelated } from "@/lib/catalog/queries";
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

  return (
    <ProductView
      product={product}
      related={getRelated(product, 4)}
      locale={locale}
      dict={getDictionary(locale)}
    />
  );
}
