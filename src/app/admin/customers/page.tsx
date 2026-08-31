import { redirect } from "next/navigation";

import { deleteSubscriber, setSubscribed } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { loadSubscribers, summarise } from "@/lib/subscribers";

export default async function AdminCustomersPage({
  searchParams,
}: PageProps<"/admin/customers">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [params, locale, rows] = await Promise.all([
    searchParams,
    getAdminLocale(),
    loadSubscribers(),
  ]);
  const t = adminDictionary(locale);

  const query = String(params.q ?? "")
    .trim()
    .toLowerCase();
  const matches = query
    ? rows.filter((r) => r.email.toLowerCase().includes(query))
    : rows;
  const stats = summarise(rows);

  const dateFormat = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-KW" : "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      numberingSystem: "latn",
    },
  );

  return (
    <div>
      {params.done ? (
        <p className="bg-success/10 text-success mb-4 rounded-lg px-4 py-2.5 text-sm font-medium">
          {t.customers.done}
        </p>
      ) : null}
      {params.deleted ? (
        <p className="bg-ink-200 text-ink-700 mb-4 rounded-lg px-4 py-2.5 text-sm font-medium">
          {t.customers.deleted}
        </p>
      ) : null}

      <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-ink-900 text-xl font-bold">{t.customers.title}</h1>
        {rows.length ? (
          <p className="text-ink-500 text-sm">
            {stats.active} {t.customers.total}
            {stats.thisWeek
              ? ` · ${stats.thisWeek} ${t.customers.thisWeek}`
              : ""}
          </p>
        ) : null}
      </div>
      <p className="text-ink-500 mb-5 max-w-2xl text-sm leading-relaxed">
        {t.customers.blurb}
      </p>

      {rows.length === 0 ? (
        <div className="ring-ink-200 rounded-xl bg-white px-4 py-12 text-center ring-1">
          <p className="text-ink-700 text-sm font-medium">{t.customers.none}</p>
          <p className="text-ink-500 mx-auto mt-1.5 max-w-sm text-xs leading-relaxed">
            {t.customers.noneHint}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <form method="get" className="flex items-center gap-2">
              <input
                name="q"
                defaultValue={query}
                placeholder={t.customers.search}
                dir="ltr"
                className="ring-ink-300 focus:ring-brand-500 h-10 w-full max-w-xs rounded-lg bg-white px-3 text-sm ring-1 focus:ring-2 focus:outline-none"
              />
              <button
                type="submit"
                className="ring-ink-300 hover:bg-ink-100 h-10 rounded-lg bg-white px-4 text-sm font-semibold ring-1"
              >
                {t.form.search}
              </button>
            </form>

            {/* A plain anchor, not <Link>: this points at a route handler that
                returns a CSV attachment, so it's a download rather than a page
                navigation. Client-side routing has nothing to render. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/admin/customers/export"
              className="ms-auto ring-ink-300 hover:bg-ink-100 inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold ring-1"
              title={t.customers.exportHint}
            >
              {t.customers.export}
            </a>
          </div>

          <div className="ring-ink-200 overflow-hidden rounded-xl bg-white ring-1">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-[11px] font-bold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.customers.email}
                  </th>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.customers.language}
                  </th>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.customers.joined}
                  </th>
                  <th className="px-4 py-2.5 text-start font-bold">
                    {t.customers.status}
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-ink-100 divide-y">
                {matches.map((row) => {
                  const active = !row.unsubscribedAt;
                  return (
                    <tr key={row.id} className="hover:bg-ink-50/60">
                      <td
                        className="text-ink-900 px-4 py-2 font-medium"
                        dir="ltr"
                      >
                        {row.email}
                      </td>
                      <td className="text-ink-600 px-4 py-2 uppercase">
                        {row.locale}
                      </td>
                      <td className="text-ink-600 px-4 py-2">
                        {dateFormat.format(row.createdAt)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                            active
                              ? "bg-success/10 text-success"
                              : "bg-ink-100 text-ink-500"
                          }`}
                        >
                          {active
                            ? t.customers.active
                            : t.customers.unsubscribed}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <form action={setSubscribed}>
                            <input type="hidden" name="id" value={row.id} />
                            <input
                              type="hidden"
                              name="subscribed"
                              value={active ? "0" : "1"}
                            />
                            <button
                              type="submit"
                              className="text-ink-600 hover:bg-ink-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                            >
                              {active
                                ? t.customers.unsubscribe
                                : t.customers.resubscribe}
                            </button>
                          </form>
                          <form action={deleteSubscriber}>
                            <input type="hidden" name="id" value={row.id} />
                            <button
                              type="submit"
                              className="text-sale hover:bg-sale/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                            >
                              {t.customers.delete}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
