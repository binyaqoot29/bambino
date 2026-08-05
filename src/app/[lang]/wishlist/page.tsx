import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WishlistView } from "@/components/product/WishlistView";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: getDictionary(locale).wishlist.title,
    robots: { index: false },
  };
}

export default async function WishlistPage({
  params,
}: PageProps<"/[lang]/wishlist">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <WishlistView locale={lang} dict={getDictionary(lang)} />;
}
