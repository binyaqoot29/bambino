import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { loadShipping } from "@/lib/site-settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: getDictionary(locale).checkout.title,
    robots: { index: false },
  };
}

export default async function CheckoutPage({
  params,
}: PageProps<"/[lang]/checkout">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const shipping = await loadShipping();

  return (
    <CheckoutForm
      locale={lang}
      dict={getDictionary(lang)}
      rates={{
        freeThreshold: shipping.freeThreshold,
        flatRate: shipping.flatRate,
      }}
      codEnabled={shipping.codEnabled}
      codFee={shipping.codFee}
    />
  );
}
