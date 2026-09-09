import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { formatPrice } from "@/lib/money";
import { loadOrders, summariseOrders } from "@/lib/orders/queries";
import type { OrderStatus } from "@/lib/orders/types";

const TONE: Record<OrderStatus, string> = {
  placed: "bg-brand-50 text-brand-700",
  confirmed: "bg-mint-100 text-mint-800",
  shipped: "bg-amber-100 text-amber-800",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-ink-100 text-ink-500",
};

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [params, locale, orders] = await Promise.all([
    searchParams,
    getAdminLocale(),
    loadOrders(),
  ]);
  const t = adminDictionary(locale);
  const stats = summariseOrders(orders);

  const query = String(params.q ?? "").trim().toLowerCase();
  const matches = query
    ? orders.filter((o) =>
        [o.reference, o.customerName, o.phone]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : orders;

  const label: Record<OrderStatus, string> = {
    placed: t.orders.statusPlaced,
    confirmed: t.orders.statusConfirmed,
    shipped: t.orders.statusShipped,
    delivered: t.orders.statusDelivered,
    cancelled: t.orders.statusCancelled,
  };

  const dateFormat = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-KW" : "en-GB",
    { day: "numeric", month: "short", numberingSystem: "latn" },
  );

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-ink-900 text-xl font-bold">{t.orders.title}</h1>
        {orders.length ? (
          <p className="text-ink-500 text-sm">
            {stats.total} {t.orders.ordersWord} · {stats.open} {t.orders.open} ·{" "}
            {formatPrice(stats.earned, locale)} {t.orders.revenue}
          </p>
        ) : null}
      </div>
      <p className="text-ink-500 mb-5 text-sm">{t.orders.blurb}</p>

      {orders.length === 0 ? (
        <div className="ring-ink-200 rounded-xl bg-white px-4 py-12 text-center ring-1">
          <p className="text-ink-700 text-sm font-medium">{t.orders.none}</p>
          <p className="text-ink-500 mx-auto mt-1.5 max-w-md text-xs leading-relaxed">
            {t.orders.noneHint}
          </p>
        </div>
      ) : (
        <>
          <form method="get" className="mb-4 flex items-center gap-2">
            <input
              name="q"
              defaultValue={query}
              placeholder={t.orders.search}
              className="ring-ink-300 focus:ring-brand-500 h-10 min-w-0 flex-1 rounded-lg bg-white px-3 text-sm ring-1 focus:ring-2 focus:outline-none sm:max-w-xs sm:flex-none"
            />
            <button
              type="submit"
              className="ring-ink-300 hover:bg-ink-100 h-10 shrink-0 rounded-lg bg-white px-4 text-sm font-semibold whitespace-nowrap ring-1"
            >
              {t.form.search}
            </button>
          </form>

          <div className="ring-ink-200 overflow-hidden rounded-xl bg-white ring-1">
            <table className="stack-table w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-[11px] font-bold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.orders.reference}
                  </th>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.orders.customer}
                  </th>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.orders.placed}
                  </th>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.orders.total}
                  </th>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.orders.status}
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-ink-100 divide-y">
                {matches.map((order) => (
                  <tr key={order.id} className="hover:bg-ink-50/60">
                    <td data-label="" className="px-4 py-2.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-ink-900 hover:text-brand-600 font-bold"
                        dir="ltr"
                      >
                        {order.reference}
                      </Link>
                      <span className="text-ink-400 ms-2 text-[11px]">
                        {order.lines.reduce((n, l) => n + l.quantity, 0)}{" "}
                        {t.orders.itemCount}
                      </span>
                    </td>
                    <td
                      data-label={t.orders.customer}
                      className="text-ink-700 px-4 py-2.5"
                    >
                      {order.customerName}
                      <span className="text-ink-400 ms-2 text-[11px]" dir="ltr">
                        {order.phone}
                      </span>
                    </td>
                    <td
                      data-label={t.orders.placed}
                      className="text-ink-600 px-4 py-2.5 text-xs"
                    >
                      {dateFormat.format(order.createdAt)}
                    </td>
                    <td
                      data-label={t.orders.total}
                      className="text-ink-900 px-4 py-2.5 font-semibold tabular-nums"
                    >
                      {formatPrice(order.total, locale)}
                    </td>
                    <td data-label={t.orders.status} className="px-4 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${TONE[order.status]}`}
                      >
                        {label[order.status]}
                      </span>
                    </td>
                    <td
                      data-label=""
                      data-actions=""
                      className="px-4 py-2.5 text-end whitespace-nowrap max-sm:text-start"
                    >
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-brand-600 hover:text-brand-700 text-xs font-semibold"
                      >
                        {t.orders.view}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
