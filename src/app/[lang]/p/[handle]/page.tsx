import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductPage } from "@/components/product/ProductPage";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getProductByHandle, getRelated } from "@/lib/catalog/queries";
import { languageAlternates } from "@/lib/alternates";
import { routes } from "@/lib/routes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; handle: string }>;
}): Promise<Metadata> {
  const { lang, handle } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const product = await getProductByHandle(handle);
  if (!product) return {};

  return {
    title: product.name[locale],
    description: product.summary[locale],
    alternates: {
      canonical: routes.product(locale, handle),
      languages: await languageAlternates((l) => routes.product(l, handle)),
    },
  };
}

export default async function ProductRoute({
  params,
}: PageProps<"/[lang]/p/[handle]">) {
  const { lang, handle } = await params;
  if (!isLocale(lang)) notFound();

  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const locale: Locale = lang;

  return (
    <ProductPage
      product={product}
      related={await getRelated(product, 4)}
      locale={locale}
      dict={getDictionary(locale)}
    />
  );
}
