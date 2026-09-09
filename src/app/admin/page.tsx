import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { AreaChart, BarList, StatTile } from "@/admin/ui/charts";
import { buildOverview, isRange, type Range } from "@/lib/analytics";
import { formatPrice } from "@/lib/money";
import type { OrderStatus } from "@/lib/orders/types";

/**
 * The admin's front page: a KPI row, revenue by day, and the lists the shop
 * owner actually acts on — what sells, what is running out, what is waiting
 * to be shipped. One range switch drives everything.
 */
export default async function AdminOverviewPage({
  searchParams,
}: PageProps<"/admin">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [params, locale] = await Promise.all([searchParams, getAdminLocale()]);
  const t = adminDictionary(locale);
  const o = t.overview;
  const requested = Number(params.range ?? 30);
  const range: Range = isRange(requested) ? requested : 30;
  const data = await buildOverview(range);

  const nf = new Intl.NumberFormat(
    locale === "ar" ? "ar-KW-u-nu-latn" : "en-KW",
  );
  const money = (fils: number) => formatPrice(fils, locale);
  const dayLabel = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-KW" : "en-GB",
    {
      day: "numeric",
      month: "short",
      numberingSystem: "latn",
      timeZone: "Asia/Kuwait",
    },
  );
  const statusLabel: Record<OrderStatus, string> = {
    placed: t.orders.statusPlaced,
    confirmed: t.orders.statusConfirmed,
    shipped: t.orders.statusShipped,
    delivered: t.orders.statusDelivered,
    cancelled: t.orders.statusCancelled,
  };
  const fill = (template: string, values: Record<string, number>) =>
    template.replace(/\{(\w+)\}/g, (_, k) => nf.format(values[k] ?? 0));

  const ranges: { value: Range; label: string }[] = [
    { value: 7, label: o.last7 },
    { value: 30, label: o.last30 },
    { value: 90, label: o.last90 },
  ];

  const series = data.days.map((d) => {
    const date = new Date(`${d.day}T12:00:00+03:00`);
    const label = dayLabel.format(date);
    return {
      label,
      value: d.revenue,
      tooltip: `${label}: ${money(d.revenue)} · ${nf.format(d.orders)} ${o.orders.toLowerCase()}`,
    };
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-ink-900 text-3xl">{o.title}</h1>
          <p className="text-ink-500 mt-1 text-sm">{o.blurb}</p>
        </div>
        {/* Range filter: one row, current one filled. */}
        <div className="bg-ink-100 flex rounded-full p-1">
          {ranges.map((r) => (
            <Link
              key={r.value}
              href={r.value === 30 ? "/admin" : `/admin?range=${r.value}`}
              aria-current={r.value === range ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors duration-200 ${
                r.value === range
                  ? "bg-ink-900 text-white"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={o.revenue}
          value={money(data.revenue.value)}
          delta={data.revenue.delta}
          deltaLabel={o.vsPrevious}
        />
        <StatTile
          label={o.orders}
          value={nf.format(data.orders.value)}
          delta={data.orders.delta}
          deltaLabel={o.vsPrevious}
        />
        <StatTile
          label={o.averageOrder}
          value={money(data.averageOrder.value)}
          delta={data.averageOrder.delta}
          deltaLabel={o.vsPrevious}
        />
        <StatTile
          label={o.itemsSold}
          value={nf.format(data.itemsSold.value)}
          delta={data.itemsSold.delta}
          deltaLabel={o.vsPrevious}
        />
      </div>

      <section className="rounded-card mt-6 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-ink-900 text-xl">
            {o.revenueByDay}
          </h2>
          <p className="text-ink-400 text-[12px]">{o.cancelledNote}</p>
        </div>
        <div className="mt-4">
          <AreaChart
            points={series}
            title={o.revenueByDay}
            formatTick={(v) =>
              v === 0 ? "0" : `${nf.format(Math.round(v / 1000))}`
            }
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-ink-900 text-xl">{o.topProducts}</h2>
          <div className="mt-5">
            <BarList
              rows={data.topProducts.map((p) => ({
                label: p.name[locale],
                value: p.value,
              }))}
              format={(v) => `${nf.format(v)} ${o.units}`}
              empty={o.noOrders}
            />
          </div>
        </section>

        <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-ink-900 text-xl">{o.byCategory}</h2>
          <div className="mt-5">
            <BarList
              rows={data.byCategory.map((c) => ({
                label: c.name[locale],
                value: c.value,
              }))}
              format={money}
              empty={o.noOrders}
            />
          </div>
        </section>

        <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-ink-900 text-xl">
            {o.ordersByStatus}
          </h2>
          <div className="mt-5">
            <BarList
              rows={data.byStatus.map((s) => ({
                label: statusLabel[s.status],
                value: s.count,
              }))}
              format={(v) => nf.format(v)}
              empty={o.noOrders}
            />
          </div>
          <div className="border-ink-200/70 mt-6 border-t pt-5">
            <h3 className="eyebrow text-ink-400">{o.payment}</h3>
            <ul className="mt-3 space-y-2 text-[13px]">
              {data.byPayment.map((p) => (
                <li
                  key={p.method}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="text-ink-800">
                    {p.method === "cod" ? o.cod : o.knet}
                  </span>
                  <span className="text-ink-600 tabular-nums">
                    {nf.format(p.count)} · {money(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-ink-900 text-xl">{o.stockTitle}</h2>
          <p className="text-ink-500 mt-1 text-[13px]">
            {fill(o.stockBody, {
              low: data.stock.low,
              out: data.stock.out,
              variants: data.stock.variants,
            })}
          </p>
          {data.stock.watch.length === 0 ? (
            <p className="text-success mt-5 text-[13px]">{o.stockNone}</p>
          ) : (
            <ul className="divide-ink-200/70 mt-4 divide-y text-[13px]">
              {data.stock.watch.map((v) => (
                <li
                  key={`${v.product.id}-${v.colour}-${v.size}`}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <Link
                    href={`/admin/products/${v.product.id}`}
                    className="link-draw text-ink-800 hover:text-ink-900 min-w-0 truncate"
                  >
                    {v.product.name[locale]}
                    <span className="text-ink-400">
                      {" "}
                      · {v.colour} · {v.size}
                    </span>
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums ${v.stock === 0 ? "bg-sale/10 text-sale" : "bg-amber-100 text-amber-800"}`}
                  >
                    {v.stock === 0
                      ? o.outOfStock
                      : `${nf.format(v.stock)} ${o.leftLabel}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/inventory"
            className="link-draw text-ink-800 hover:text-ink-900 mt-5 inline-block text-[13px] font-medium"
          >
            {o.viewAll}
          </Link>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-ink-900 text-xl">{o.recent}</h2>
            <Link
              href="/admin/orders"
              className="link-draw text-ink-800 hover:text-ink-900 text-[13px] font-medium"
            >
              {o.viewAll}
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="text-ink-400 py-6 text-center text-[13px]">
              {o.noOrders}
            </p>
          ) : (
            <ul className="divide-ink-200/70 mt-3 divide-y text-[13px]">
              {data.recent.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3"
                >
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-ink-900 font-medium tabular-nums"
                  >
                    {order.reference}
                  </Link>
                  <span className="text-ink-600 min-w-0 flex-1 truncate">
                    {order.customerName}
                  </span>
                  <span className="text-ink-400">
                    {dayLabel.format(order.createdAt)}
                  </span>
                  <span className="text-ink-600 w-24 text-end tabular-nums">
                    {money(order.total)}
                  </span>
                  <span className="text-ink-500 w-24 text-end text-[12px]">
                    {statusLabel[order.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
            <p className="text-ink-500 text-[12px]">{o.subscribers}</p>
            <p className="text-ink-900 mt-2 text-3xl font-semibold tracking-tight tabular-nums">
              {nf.format(data.subscribers.total)}
            </p>
            <p className="text-ink-400 mt-1.5 text-[12px] tabular-nums">
              +{nf.format(data.subscribers.added.value)} {o.subscribersNew}
            </p>
          </section>
          <section className="rounded-card bg-brand-900 p-6 text-white shadow-[var(--shadow-soft)]">
            <p className="text-4xl font-semibold tracking-tight tabular-nums">
              {nf.format(data.open)}
            </p>
            <p className="mt-1.5 text-[13px] text-white/75">{o.openOrders}</p>
            <Link
              href="/admin/orders"
              className="mt-4 inline-block text-[12px] font-medium tracking-[0.08em] text-white uppercase underline-offset-4 hover:underline [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case"
            >
              {o.viewAll}
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
