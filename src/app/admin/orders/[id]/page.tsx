import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { saveOrderNote, setOrderPaid, setOrderStatus } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { ProductArt } from "@/components/product/ProductArt";
import { text } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/money";
import { findOrder } from "@/lib/orders/queries";
import {
  GOVERNORATE_LABELS,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/orders/types";

export default async function AdminOrderPage({
  params,
  searchParams,
}: PageProps<"/admin/orders/[id]">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [{ id }, query, locale] = await Promise.all([
    params,
    searchParams,
    getAdminLocale(),
  ]);
  const order = await findOrder(id);
  if (!order) notFound();

  const t = adminDictionary(locale);
  const label: Record<OrderStatus, string> = {
    placed: t.orders.statusPlaced,
    confirmed: t.orders.statusConfirmed,
    shipped: t.orders.statusShipped,
    delivered: t.orders.statusDelivered,
    cancelled: t.orders.statusCancelled,
  };

  const address = order.address;
  const paid = order.paymentStatus === "paid";
  // Cancelling returned the stock; reopening would need to take it again, and
  // it may be gone. So a cancelled order stays cancelled.
  const settled = order.status === "cancelled";
  const dateFormat = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-KW" : "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      numberingSystem: "latn",
    },
  );

  const notice = query.restocked
    ? t.orders.restocked
    : query.status
      ? t.orders.statusSaved
      : query.note
        ? t.orders.noteSaved
        : null;

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/orders"
        className="link-draw text-ink-500 hover:text-ink-900 text-xs"
      >
        ← {t.orders.back}
      </Link>

      {notice ? (
        <p className="bg-success/10 text-success mt-3 rounded-xl px-4 py-2.5 text-sm font-medium">
          {notice}
        </p>
      ) : null}

      <div className="mt-3 mb-1 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-ink-900 text-3xl" dir="ltr">
          {order.reference}
        </h1>
        <span className="bg-brand-50 text-brand-700 rounded px-2 py-0.5 text-[11px] font-medium">
          {label[order.status]}
        </span>
        <span
          className={`rounded px-2 py-0.5 text-[11px] font-medium ${
            paid ? "bg-success/10 text-success" : "bg-ink-100 text-ink-500"
          }`}
        >
          {paid ? t.orders.paid : t.orders.unpaid}
        </span>
      </div>
      <p className="text-ink-500 mb-5 text-xs">
        {t.orders.placedOn} {dateFormat.format(order.createdAt)}
      </p>

      <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-ink-900 text-xl">{t.orders.items}</h2>
        <ul className="divide-ink-100 mt-3 divide-y">
          {order.lines.map((line, index) => (
            <li
              key={`${line.productId}-${line.size}-${line.colour}-${index}`}
              className="flex items-center gap-3 py-2.5"
            >
              <ProductArt
                art={line.art}
                seed={line.productId}
                className="size-11 shrink-0 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/products/${line.productId}`}
                  className="text-ink-900 hover:text-brand-700 block truncate text-sm font-medium"
                >
                  {text(line.name, locale)}
                </Link>
                <p className="text-ink-400 text-[11px]">
                  {line.colour} · {line.size} · {t.orders.qty} {line.quantity}
                </p>
              </div>
              <span className="text-ink-800 text-sm font-medium tabular-nums">
                {formatPrice(line.unitPrice * line.quantity, locale)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="border-ink-100 mt-3 space-y-1.5 border-t pt-3 text-sm">
          <Row
            label={t.orders.subtotal}
            value={formatPrice(order.subtotal, locale)}
          />
          <Row
            label={t.orders.deliveryFee}
            value={
              order.deliveryFee === 0
                ? t.orders.free
                : formatPrice(order.deliveryFee, locale)
            }
          />
          {order.codFee > 0 ? (
            <Row
              label={t.orders.codFee}
              value={formatPrice(order.codFee, locale)}
            />
          ) : null}
          <div className="border-ink-100 mt-1 flex items-baseline justify-between border-t pt-2.5">
            <dt className="text-ink-900 font-medium">{t.orders.total}</dt>
            <dd className="text-ink-900 text-base font-medium tabular-nums">
              {formatPrice(order.total, locale)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-ink-900 text-xl">
            {t.orders.deliverTo}
          </h2>
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

        <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-ink-900 text-xl">
            {t.orders.contact}
          </h2>
          {/* A tel: link, because the first thing the shop does is call. */}
          <a
            href={`tel:+965${order.phone}`}
            className="text-brand-600 mt-2 block text-sm font-medium"
            dir="ltr"
          >
            {order.phone}
          </a>
          {order.email ? (
            <a
              href={`mailto:${order.email}`}
              className="text-ink-500 hover:text-brand-700 block text-sm"
              dir="ltr"
            >
              {order.email}
            </a>
          ) : null}

          <h2 className="text-ink-900 mt-4 text-sm font-medium">
            {t.orders.payment}
          </h2>
          <p className="text-ink-600 mt-1 text-sm">{t.orders.cod}</p>
          <form action={setOrderPaid} className="mt-2">
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="paid" value={paid ? "0" : "1"} />
            <button
              type="submit"
              className="text-ink-600 ring-ink-300 hover:bg-ink-100 rounded-xl px-3 py-1.5 text-xs font-medium ring-1"
            >
              {paid ? t.orders.markUnpaid : t.orders.markPaid}
            </button>
          </form>
        </section>
      </div>

      {order.note ? (
        <section className="rounded-card mt-5 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-ink-900 text-xl">
            {t.orders.customerNote}
          </h2>
          <p className="text-ink-600 mt-2 text-sm">{order.note}</p>
        </section>
      ) : null}

      <section className="rounded-card mt-5 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-ink-900 text-xl">
          {t.orders.changeStatus}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <form key={status} action={setOrderStatus}>
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="status" value={status} />
              <button
                type="submit"
                disabled={settled || status === order.status}
                className={`h-9 rounded-xl px-3.5 text-xs font-medium ring-1 disabled:cursor-default disabled:opacity-40 ${
                  status === "cancelled"
                    ? "text-sale ring-sale/30 hover:bg-sale/10"
                    : "text-ink-700 ring-ink-300 hover:bg-ink-100"
                }`}
              >
                {label[status]}
              </button>
            </form>
          ))}
        </div>
        <p className="text-ink-400 mt-2.5 text-[11px]">
          {settled ? t.orders.cancelledFinal : t.orders.cancelWarning}
        </p>
      </section>

      <section className="rounded-card mt-5 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-ink-900 text-xl">
          {t.orders.staffNote}
        </h2>
        <form action={saveOrderNote} className="mt-3">
          <input type="hidden" name="id" value={order.id} />
          <textarea
            name="staffNote"
            rows={3}
            defaultValue={order.staffNote ?? ""}
            className="ring-ink-300 focus:ring-ink-900 w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 focus:outline-none"
          />
          <p className="text-ink-400 mt-1 text-[11px]">
            {t.orders.staffNoteHint}
          </p>
          <button
            type="submit"
            className="bg-brand-900 hover:bg-brand-800 mt-3 h-10 rounded-full px-5 text-[13px] font-medium text-white"
          >
            {t.orders.saveNote}
          </button>
        </form>
      </section>
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
