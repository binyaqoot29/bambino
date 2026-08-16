import { notFound } from "next/navigation";

import { Home } from "@/design";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  return <Home locale={locale} dict={getDictionary(locale)} />;
}
