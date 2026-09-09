import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { ClearBag } from "@/components/checkout/ClearBag";
import { ProductArt } from "@/components/product/ProductArt";
import { ButtonLink } from "@/components/ui/Button";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { text } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/money";
import { findOrderByReference } from "@/lib/orders/queries";
import { GOVERNORATE_LABELS, type OrderStatus } from "@/lib/orders/types";
import { routes } from "@/lib/routes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: getDictionary(locale).order.reference,
    // An order page is personal and reachable by link; keep it out of search.
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({
  params,
}: PageProps<"/[lang]/order/[reference]">) {
  const { lang, reference } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const t = dict.order;
  const order = await findOrderByReference(reference);

  if (!order) {
    return (
      <div className="container-bambino py-16">
        <div className="bg-canvas-mint mx-auto flex max-w-xl flex-col items-center rounded-[2rem] px-6 py-20 text-center">
          <BambinoMark className="text-mint-400 h-20 w-auto" />
          <h1 className="text-brand-900 mt-6 text-2xl font-medium">
            {t.notFound}
          </h1>
          <p className="text-ink-500 mt-2 text-sm">{t.notFoundBody}</p>
          <ButtonLink href={routes.home(locale)} className="mt-7">
            {t.continueShopping}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const statusLabel: Record<OrderStatus, string> = {
    placed: t.statusPlaced,
    confirmed: t.statusConfirmed,
    shipped: t.statusShipped,
    delivered: t.statusDelivered,
    cancelled: t.statusCancelled,
  };

  const address = order.address;
  const dateFormat = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-KW" : "en-GB",
    { day: "numeric", month: "long", year: "numeric", numberingSystem: "latn" },
  );

  return (
    <div className="container-bambino py-10 lg:py-14">
      <ClearBag reference={order.reference} />

      <div className="mx-auto max-w-2xl">
        <div className="bg-canvas-mint rounded-[2rem] px-6 py-10 text-center">
          <BambinoMark className="text-mint-500 mx-auto h-16 w-auto" />
          <h1 className="text-brand-900 mt-5 text-2xl font-semibold sm:text-3xl">
            {t.thanks}
          </h1>
          <p className="text-ink-600 mx-auto mt-2 max-w-sm text-sm leading-relaxed">
            {t.thanksBody}
          </p>

          <p className="text-ink-500 mt-6 text-xs font-semibold tracking-wide uppercase">
            {t.reference}
          </p>
          <p
            className="text-brand-900 mt-1 text-2xl font-bold tracking-wider"
            dir="ltr"
          >
            {order.reference}
          </p>
          <p className="text-ink-400 mx-auto mt-2 max-w-xs text-[11px]">
            {t.keepReference}
          </p>
        </div>

        <div className="ring-ink-200 mt-6 rounded-2xl bg-white p-5 ring-1 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-ink-900 text-sm font-bold">{t.items}</h2>
            <span className="bg-brand-50 text-brand-700 rounded-full px-2.5 py-1 text-[11px] font-semibold">
              {statusLabel[order.status]}
            </span>
          </div>

          <ul className="divide-ink-100 mt-4 divide-y">
            {order.lines.map((line, index) => (
              <li
                key={`${line.productId}-${line.size}-${line.colour}-${index}`}
                className="flex items-center gap-3 py-3"
              >
                <ProductArt
                  art={line.art}
                  seed={line.productId}
                  className="size-12 shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-ink-900 truncate text-sm font-medium">
                    {text(line.name, locale)}
                  </p>
                  <p className="text-ink-400 text-xs">
                    {line.colour} · {line.size} · {t.qty} {line.quantity}
                  </p>
                </div>
                <span className="text-ink-800 text-sm font-semibold tabular-nums">
                  {formatPrice(line.unitPrice * line.quantity, locale)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="border-ink-100 mt-4 space-y-1.5 border-t pt-4 text-sm">
            <Row label={t.subtotal} value={formatPrice(order.subtotal, locale)} />
            <Row
              label={t.deliveryFee}
              value={
                order.deliveryFee === 0
                  ? t.free
                  : formatPrice(order.deliveryFee, locale)
              }
            />
            {order.codFee > 0 ? (
              <Row label={t.codFee} value={formatPrice(order.codFee, locale)} />
            ) : null}
            <div className="border-ink-100 mt-2 flex items-baseline justify-between border-t pt-3">
              <dt className="text-ink-900 font-semibold">{t.total}</dt>
              <dd className="text-brand-900 text-lg font-bold tabular-nums">
                {formatPrice(order.total, locale)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <section className="ring-ink-200 rounded-2xl bg-white p-5 ring-1">
            <h2 className="text-ink-900 text-sm font-bold">{t.deliverTo}</h2>
            <p className="text-ink-600 mt-2 text-sm leading-relaxed">
              {order.customerName}
              <br />
              {GOVERNORATE_LABELS[address.governorate][locale]} · {address.area}
              <br />
              {address.block} · {address.street} · {address.building}
              {address.extra ? (
                <>
                  <br />
                  {address.extra}
                </>
              ) : null}
            </p>
          </section>

          <section className="ring-ink-200 rounded-2xl bg-white p-5 ring-1">
            <h2 className="text-ink-900 text-sm font-bold">{t.contact}</h2>
            <p className="text-ink-600 mt-2 text-sm" dir="ltr">
              {order.phone}
            </p>
            {order.email ? (
              <p className="text-ink-500 text-sm" dir="ltr">
                {order.email}
              </p>
            ) : null}

            <h2 className="text-ink-900 mt-4 text-sm font-bold">{t.payment}</h2>
            <p className="text-ink-600 mt-1 text-sm">{dict.checkout.cod}</p>

            <p className="text-ink-400 mt-4 text-[11px]">
              {t.placedOn} {dateFormat.format(order.createdAt)}
            </p>
          </section>
        </div>

        {order.note ? (
          <section className="ring-ink-200 mt-4 rounded-2xl bg-white p-5 ring-1">
            <h2 className="text-ink-900 text-sm font-bold">{t.note}</h2>
            <p className="text-ink-600 mt-2 text-sm">{order.note}</p>
          </section>
        ) : null}

        <div className="mt-8 text-center">
          <ButtonLink href={routes.home(locale)}>
            {t.continueShopping}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-ink-800 tabular-nums">{value}</dd>
    </div>
  );
}
