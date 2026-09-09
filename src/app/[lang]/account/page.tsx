import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  PasswordForm,
  ProfileForm,
  SignOutButton,
} from "@/components/account/Forms";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import {
  checkoutPrefill,
  currentCustomer,
  loadCustomerOrders,
} from "@/lib/customers";
import { formatPrice } from "@/lib/money";
import type { OrderStatus } from "@/lib/orders/types";
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
    title: getDictionary(locale).account.title,
    robots: { index: false },
  };
}

/**
 * The account page: details and delivery address, password, and the orders
 * placed with this email. A visitor who isn't signed in is sent to sign in
 * and brought back here afterwards.
 */
export default async function AccountPage({
  params,
}: PageProps<"/[lang]/account">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;

  const customer = await currentCustomer();
  if (!customer) redirect(routes.signIn(locale, routes.account(locale)));

  const dict = getDictionary(locale);
  const s = dict.account;
  const { t } = createTranslator(locale);
  const orders = await loadCustomerOrders(customer.email);

  const dateFormat = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-KW" : "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      numberingSystem: "latn",
      timeZone: "Asia/Kuwait",
    },
  );
  const statusLabel: Record<OrderStatus, string> = {
    placed: dict.order.statusPlaced,
    confirmed: dict.order.statusConfirmed,
    shipped: dict.order.statusShipped,
    delivered: dict.order.statusDelivered,
    cancelled: dict.order.statusCancelled,
  };

  return (
    <>
      <section className="bg-canvas">
        <div className="container-bambino flex flex-wrap items-end justify-between gap-6 py-14 lg:py-20">
          <div>
            <p className="eyebrow">{s.title}</p>
            <h1 className="font-display text-ink-900 mt-4 text-5xl leading-[1.05] sm:text-6xl">
              {t(s.greeting, {
                name: customer.name.split(" ")[0] || customer.email,
              })}
            </h1>
            <p className="text-ink-500 mt-4 text-[15px]">
              <span dir="ltr">{customer.email}</span>
              {" · "}
              {t(s.memberSince, {
                date: dateFormat.format(customer.createdAt),
              })}
            </p>
          </div>
          <SignOutButton locale={locale} s={s} />
        </div>
      </section>

      <div className="container-bambino grid gap-16 py-12 lg:grid-cols-[1fr_22rem] lg:gap-20 lg:py-16">
        <div className="max-w-2xl space-y-14">
          <section>
            <h2 className="font-display text-ink-900 text-3xl">{s.details}</h2>
            <div className="mt-6">
              <ProfileForm
                locale={locale}
                s={s}
                dict={dict}
                initial={{ ...checkoutPrefill(customer), name: customer.name }}
              />
            </div>
          </section>

          <section className="border-ink-200/70 border-t pt-12">
            <h2 className="font-display text-ink-900 text-3xl">
              {s.passwordTitle}
            </h2>
            <div className="mt-6">
              <PasswordForm locale={locale} s={s} />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <h2 className="font-display text-ink-900 text-3xl">{s.orders}</h2>
          <p className="text-ink-500 mt-2 text-[13px]">{s.ordersLede}</p>
          {orders.length === 0 ? (
            <p className="text-ink-400 mt-6 text-[14px]">{s.noOrders}</p>
          ) : (
            <ul className="divide-ink-200/70 mt-6 divide-y">
              {orders.map((order) => (
                <li key={order.id} className="py-4">
                  <Link
                    href={routes.orderConfirmation(locale, order.reference)}
                    className="group block"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-ink-900 font-medium tabular-nums">
                        {order.reference}
                      </span>
                      <span className="text-ink-900 tabular-nums">
                        {formatPrice(order.total, locale)}
                      </span>
                    </div>
                    <div className="text-ink-500 mt-1 flex items-baseline justify-between gap-4 text-[13px]">
                      <span>{dateFormat.format(order.createdAt)}</span>
                      <span>{statusLabel[order.status]}</span>
                    </div>
                    <span className="link-draw text-ink-800 mt-2 inline-block text-[13px]">
                      {s.viewOrder}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}
