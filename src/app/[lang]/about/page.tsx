import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { DoodleField } from "@/components/brand/Doodles";
import { ButtonLink } from "@/components/ui/Button";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

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
  const dict = getDictionary(locale);
  return { title: dict.home.storyCta, description: dict.brand.intro };
}

export default async function AboutPage({
  params,
}: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const pillars = [
    dict.home.pillars.quality,
    dict.home.pillars.dress,
    dict.home.pillars.grow,
    dict.home.pillars.happy,
  ];

  return (
    <>
      <section className="from-brand-50 to-mint-50 relative overflow-hidden bg-linear-to-br">
        <div
          aria-hidden="true"
          className="text-mint-400/18 pointer-events-none absolute inset-0"
        >
          <DoodleField id="about-doodles" />
        </div>
        <div className="container-bambino relative flex flex-col items-center py-20 text-center lg:py-28">
          <BambinoMark className="text-brand-500 h-24 w-auto" leafColor="#B7D2DD" />
          <h1 className="text-brand-900 mt-8 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {dict.home.storyTitle}
          </h1>
          <p className="text-ink-600 mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
            {dict.brand.intro}
          </p>
        </div>
      </section>

      <section className="container-bambino py-16 lg:py-20">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <li
              key={pillar.title}
              className="bg-canvas-mint ring-mint-200/60 rounded-3xl p-7 ring-1"
            >
              <h2 className="text-brand-700 text-xl font-medium">
                {pillar.title}
              </h2>
              <p className="text-ink-600 mt-2.5 text-sm leading-relaxed">
                {pillar.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="border-ink-100 mt-16 border-t pt-16 text-center">
          <p className="text-brand-600 text-sm font-medium tracking-[0.18em] uppercase">
            {dict.brand.tagline}
          </p>
          <p className="text-ink-600 mx-auto mt-5 max-w-2xl leading-relaxed">
            {dict.home.storyBody}
          </p>
          <ButtonLink
            href={routes.collection(locale, "new-in")}
            size="lg"
            className="mt-8"
          >
            {dict.home.heroCta}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
