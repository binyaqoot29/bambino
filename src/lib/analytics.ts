import "server-only";

import { categoryLookup, getAllProducts } from "@/lib/catalog/queries";
import type { Product } from "@/lib/catalog/types";
import { loadOrders } from "@/lib/orders/queries";
import type { OrderStatus, PaymentMethod } from "@/lib/orders/types";
import { loadSubscribers } from "@/lib/subscribers";

/**
 * The numbers behind the admin overview.
 *
 * Everything is computed from the rows the shop already has — orders,
 * products, subscribers — for a window of the last N days, with the window
 * before it for comparison. Cancelled orders never count as revenue: the
 * money was never taken. Days are bucketed in Kuwait time, because "today"
 * on this dashboard means today in the shop, not in UTC.
 */

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

export function isRange(value: number): value is Range {
  return (RANGES as readonly number[]).includes(value);
}

const DAY = 86_400_000;
const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kuwait",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-09-09" in Kuwait for any instant. */
export function kuwaitDay(date: Date): string {
  return dayKey.format(date);
}

export type Metric = {
  value: number;
  previous: number;
  /** Percent change vs the previous window; null when there was nothing before. */
  delta: number | null;
};

function metric(value: number, previous: number): Metric {
  return {
    value,
    previous,
    delta: previous > 0 ? ((value - previous) / previous) * 100 : null,
  };
}

export type DayPoint = { day: string; revenue: number; orders: number };
export type Named = {
  key: string;
  name: { en: string; ar: string };
  value: number;
};

export type Overview = {
  range: Range;
  from: Date;
  /** Fils earned in the window, orders counted, and so on. */
  revenue: Metric;
  orders: Metric;
  averageOrder: Metric;
  itemsSold: Metric;
  days: DayPoint[];
  byStatus: { status: OrderStatus; count: number }[];
  byPayment: { method: PaymentMethod; count: number; revenue: number }[];
  topProducts: Named[];
  byCategory: Named[];
  stock: {
    variants: number;
    out: number;
    low: number;
    /** The variants closest to selling out, worst first. */
    watch: { product: Product; colour: string; size: string; stock: number }[];
  };
  subscribers: { total: number; added: Metric };
  open: number;
  recent: Awaited<ReturnType<typeof loadOrders>>;
};

const LOW_STOCK = 5;

export async function buildOverview(
  range: Range,
  now = new Date(),
): Promise<Overview> {
  const [orders, products, subscribers, categoryFor] = await Promise.all([
    loadOrders(),
    getAllProducts(),
    loadSubscribers(),
    categoryLookup(),
  ]);

  const from = new Date(now.getTime() - (range - 1) * DAY);
  const previousFrom = new Date(from.getTime() - range * DAY);
  const inWindow = (d: Date) => d >= from;
  const inPrevious = (d: Date) => d >= previousFrom && d < from;

  const live = orders.filter((o) => o.status !== "cancelled");
  const current = live.filter((o) => inWindow(o.createdAt));
  const previous = live.filter((o) => inPrevious(o.createdAt));

  const sum = (rows: typeof live) => rows.reduce((n, o) => n + o.total, 0);
  const items = (rows: typeof live) =>
    rows.reduce((n, o) => n + o.lines.reduce((m, l) => m + l.quantity, 0), 0);

  const revenue = metric(sum(current), sum(previous));
  const orderCount = metric(current.length, previous.length);
  const averageOrder = metric(
    current.length ? Math.round(sum(current) / current.length) : 0,
    previous.length ? Math.round(sum(previous) / previous.length) : 0,
  );
  const itemsSold = metric(items(current), items(previous));

  // One point per day, including empty days, so the line has a real x axis.
  const days: DayPoint[] = [];
  const index = new Map<string, DayPoint>();
  for (let i = range - 1; i >= 0; i--) {
    const day = kuwaitDay(new Date(now.getTime() - i * DAY));
    const point = { day, revenue: 0, orders: 0 };
    days.push(point);
    index.set(day, point);
  }
  for (const order of current) {
    const point = index.get(kuwaitDay(order.createdAt));
    if (!point) continue;
    point.revenue += order.total;
    point.orders += 1;
  }

  const statuses: OrderStatus[] = [
    "placed",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const windowAll = orders.filter((o) => inWindow(o.createdAt));
  const byStatus = statuses.map((status) => ({
    status,
    count: windowAll.filter((o) => o.status === status).length,
  }));

  const methods: PaymentMethod[] = ["cod", "knet"];
  const byPayment = methods.map((method) => {
    const rows = current.filter((o) => o.paymentMethod === method);
    return { method, count: rows.length, revenue: sum(rows) };
  });

  const productById = new Map(products.map((p) => [p.id, p]));
  const units = new Map<string, Named>();
  const categories = new Map<string, Named>();
  for (const order of current) {
    for (const line of order.lines) {
      const existing = units.get(line.productId);
      if (existing) existing.value += line.quantity;
      else
        units.set(line.productId, {
          key: line.productId,
          name: line.name,
          value: line.quantity,
        });

      const product = productById.get(line.productId);
      const slug = product?.category ?? "other";
      const category = categoryFor(slug);
      const name = category?.name ?? { en: slug, ar: slug };
      const entry = categories.get(slug);
      const amount = line.unitPrice * line.quantity;
      if (entry) entry.value += amount;
      else categories.set(slug, { key: slug, name, value: amount });
    }
  }
  const topProducts = [...units.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const byCategory = [...categories.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const variants = products.flatMap((product) =>
    product.variants.map((v) => ({
      product,
      colour: v.colour,
      size: v.size,
      stock: v.stock,
    })),
  );
  const stock = {
    variants: variants.length,
    out: variants.filter((v) => v.stock === 0).length,
    low: variants.filter((v) => v.stock > 0 && v.stock <= LOW_STOCK).length,
    watch: variants
      .filter((v) => v.stock <= LOW_STOCK)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 8),
  };

  const active = subscribers.filter((s) => !s.unsubscribedAt);
  const subscriberStats = {
    total: active.length,
    added: metric(
      active.filter((s) => inWindow(s.createdAt)).length,
      active.filter((s) => inPrevious(s.createdAt)).length,
    ),
  };

  return {
    range,
    from,
    revenue,
    orders: orderCount,
    averageOrder,
    itemsSold,
    days,
    byStatus,
    byPayment,
    topProducts,
    byCategory,
    stock,
    subscribers: subscriberStats,
    open: orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled",
    ).length,
    recent: orders.slice(0, 6),
  };
}
