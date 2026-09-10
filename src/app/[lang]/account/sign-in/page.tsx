import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SignInForm } from "@/components/account/Forms";
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
    title: getDictionary(locale).account.signIn,
    robots: { index: false },
  };
}

export default async function SignInPage({
  params,
  searchParams,
}: PageProps<"/[lang]/account/sign-in">) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  // A same-site path only: the value comes from the URL, and an already
  // signed-in visitor must not be bounced to another site by a crafted link.
  const raw = typeof query.next === "string" ? query.next : "";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : undefined;

  if (await currentCustomer()) redirect(next ?? routes.account(locale));

  const dict = getDictionary(locale);
  const s = dict.account;

  return (
    <div className="bg-canvas">
      <div className="container-bambino py-14 lg:py-24">
        <div className="rounded-card mx-auto max-w-md bg-white p-8 shadow-[var(--shadow-soft)] sm:p-10">
          <p className="eyebrow">{s.title}</p>
          <h1 className="font-display text-ink-900 mt-3 text-4xl">
            {s.signIn}
          </h1>
          <p className="text-ink-500 mt-2 text-[15px] leading-relaxed">
            {s.signInLede}
          </p>
          <div className="mt-8">
            <SignInForm
              locale={locale}
              s={s}
              next={next}
              contactLabel={dict.help.topics.contact.title}
            />
          </div>
          <p className="border-ink-200/70 text-ink-600 mt-8 border-t pt-6 text-[14px]">
            {s.noAccount}{" "}
            <Link
              href={routes.signUp(locale)}
              className="link-draw text-ink-900 font-medium"
            >
              {s.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
