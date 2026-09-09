import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SignUpForm } from "@/components/account/Forms";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { currentCustomer } from "@/lib/customers";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: getDictionary(locale).account.signUp,
    robots: { index: false },
  };
}

export default async function SignUpPage({
  params,
  searchParams,
}: PageProps<"/[lang]/account/sign-up">) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const next = typeof query.next === "string" ? query.next : undefined;

  if (await currentCustomer()) redirect(next ?? routes.account(locale));

  const s = getDictionary(locale).account;

  return (
    <div className="bg-canvas">
      <div className="container-bambino py-14 lg:py-24">
        <div className="rounded-card mx-auto max-w-md bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10">
          <p className="eyebrow">{s.title}</p>
          <h1 className="font-display text-ink-900 mt-3 text-4xl">
            {s.signUp}
          </h1>
          <p className="text-ink-500 mt-2 text-[15px] leading-relaxed">
            {s.signUpLede}
          </p>
          <div className="mt-8">
            <SignUpForm locale={locale} s={s} next={next} />
          </div>
          <p className="border-ink-200/70 text-ink-600 mt-8 border-t pt-6 text-[14px]">
            {s.haveAccount}{" "}
            <Link
              href={routes.signIn(locale, next)}
              className="link-draw text-ink-900 font-medium"
            >
              {s.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
