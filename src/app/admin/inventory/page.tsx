import Link from "next/link";
import { redirect } from "next/navigation";

import { setStockBulk } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { getAllProducts } from "@/lib/catalog/queries";
import { text } from "@/lib/catalog/types";

/** At or below this, a variant is worth flagging before it sells out. */
const LOW_STOCK = 5;

type Filter = "all" | "low" | "out";

export default async function AdminInventoryPage({
  searchParams,
}: PageProps<"/admin/inventory">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [params, locale, products] = await Promise.all([
    searchParams,
    getAdminLocale(),
    getAllProducts(),
  ]);
  const t = adminDictionary(locale);

  const query = String(params.q ?? "")
    .trim()
    .toLowerCase();
  const filterRaw = String(params.filter ?? "all");
  const filter: Filter =
    filterRaw === "low" || filterRaw === "out" ? filterRaw : "all";
  const saved = params.saved ? Number(params.saved) : null;

  // One flat row per variant: the unit being counted is a size in a colour, not
  // a product, and that's what the shop owner is holding when they count.
  const rows = products.flatMap((product) =>
    product.variants.map((variant) => ({
      product,
      variant,
      label: `${variant.colour} · ${variant.size}`,
    })),
  );

  const matches = rows.filter((row) => {
    if (filter === "out" && row.variant.stock > 0) return false;
    if (
      filter === "low" &&
      (row.variant.stock === 0 || row.variant.stock > LOW_STOCK)
    )
      return false;
    if (!query) return true;
    return [
      text(row.product.name, "en"),
      text(row.product.name, "ar"),
      row.product.handle,
      row.label,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  const totalUnits = rows.reduce((n, r) => n + r.variant.stock, 0);
  const lowCount = rows.filter(
    (r) => r.variant.stock > 0 && r.variant.stock <= LOW_STOCK,
  ).length;
  const outCount = rows.filter((r) => r.variant.stock === 0).length;

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: t.inventory.all, count: rows.length },
    { key: "low", label: t.inventory.low, count: lowCount },
    { key: "out", label: t.inventory.out, count: outCount },
  ];

  const tabHref = (key: Filter) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (key !== "all") next.set("filter", key);
    const tail = next.toString();
    return tail ? `/admin/inventory?${tail}` : "/admin/inventory";
  };

  return (
    <div>
      {saved !== null ? (
        <p className="bg-success/10 text-success mb-4 rounded-lg px-4 py-2.5 text-sm font-medium">
          {t.inventory.saved} ({saved})
        </p>
      ) : null}

      <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-ink-900 text-xl font-bold">{t.inventory.title}</h1>
        <p className="text-ink-500 text-sm">
          {totalUnits.toLocaleString("en")} {t.inventory.totalUnits} ·{" "}
          {t.inventory.across} {rows.length} {t.inventory.variantsWord}
        </p>
      </div>
      <p className="text-ink-500 mb-5 text-sm">{t.inventory.blurb}</p>

      <form method="get" className="mb-4 flex items-center gap-2">
        {filter !== "all" ? (
          <input type="hidden" name="filter" value={filter} />
        ) : null}
        <input
          name="q"
          defaultValue={query}
          placeholder={t.inventory.search}
          className="ring-ink-300 focus:ring-brand-500 h-10 min-w-0 flex-1 rounded-lg bg-white px-3 text-sm ring-1 focus:ring-2 focus:outline-none sm:max-w-xs sm:flex-none"
        />
        <button
          type="submit"
          className="ring-ink-300 hover:bg-ink-100 h-10 shrink-0 rounded-lg bg-white px-4 text-sm font-semibold whitespace-nowrap ring-1"
        >
          {t.form.search}
        </button>
      </form>

      <div className="border-ink-200 no-scrollbar -mx-4 mb-4 flex gap-1 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tabHref(tab.key)}
            aria-current={filter === tab.key ? "page" : undefined}
            className={`-mb-px inline-flex h-9 shrink-0 items-center gap-1.5 border-b-2 px-3 text-[13px] font-semibold whitespace-nowrap ${
              filter === tab.key
                ? "border-brand-500 text-brand-700"
                : "text-ink-500 hover:text-ink-800 border-transparent"
            }`}
          >
            {tab.label}
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] ${
                tab.key === "out" && tab.count
                  ? "bg-sale/10 text-sale"
                  : "bg-ink-100 text-ink-600"
              }`}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {matches.length === 0 ? (
        <p className="text-ink-500 ring-ink-200 rounded-xl bg-white px-4 py-10 text-center text-sm ring-1">
          {t.inventory.none}
        </p>
      ) : (
        <form action={setStockBulk}>
          <input type="hidden" name="q" value={query} />
          <input type="hidden" name="filter" value={filter} />

          <div className="ring-ink-200 overflow-hidden rounded-xl bg-white ring-1">
            <table className="stack-table w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-start text-[11px] font-bold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.inventory.product}
                  </th>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.inventory.variant}
                  </th>
                  <th className="w-32 px-4 py-2.5 text-start font-bold">
                    {t.inventory.stock}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-ink-100 divide-y">
                {matches.map(({ product, variant, label }) => (
                  <tr key={variant.id} className="hover:bg-ink-50/60">
                    <td data-label="" className="px-4 py-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-ink-900 hover:text-brand-600 font-medium"
                      >
                        {text(product.name, locale)}
                      </Link>
                    </td>
                    <td
                      data-label={t.inventory.variant}
                      className="text-ink-600 px-4 py-2"
                    >
                      <span dir="ltr">{label}</span>
                    </td>
                    <td data-label={t.inventory.stock} className="px-4 py-2">
                      <div className="flex items-center gap-2 max-sm:justify-end">
                        {/* The rendered value travels with the new one so the
                            action can skip rows nobody touched. */}
                        <input
                          type="hidden"
                          name={`was:${variant.id}`}
                          value={variant.stock}
                        />
                        <input
                          type="number"
                          min={0}
                          name={`stock:${variant.id}`}
                          defaultValue={variant.stock}
                          aria-label={`${text(product.name, locale)} — ${label}`}
                          className={`ring-ink-300 focus:ring-brand-500 h-9 w-20 rounded-lg bg-white px-2 text-sm ring-1 focus:ring-2 focus:outline-none ${
                            variant.stock === 0 ? "text-sale font-semibold" : ""
                          }`}
                        />
                        {variant.stock === 0 ? (
                          <span className="bg-sale/10 text-sale rounded px-1.5 py-0.5 text-[11px] font-semibold">
                            {t.inventory.outOfStock}
                          </span>
                        ) : variant.stock <= LOW_STOCK ? (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            {t.inventory.lowStock}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 mt-4 h-11 rounded-lg px-6 text-sm font-semibold text-white"
          >
            {t.form.save}
          </button>
        </form>
      )}
    </div>
  );
}
