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
        <p className="bg-success/10 text-success mb-5 rounded-xl px-4 py-3 text-sm">
          {t.customers.done}
        </p>
      ) : null}
      {params.deleted ? (
        <p className="bg-canvas text-ink-700 mb-5 rounded-xl px-4 py-3 text-sm">
          {t.customers.deleted}
        </p>
      ) : null}

      <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-ink-900 text-3xl">
          {t.customers.title}
        </h1>
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
        <div className="rounded-card bg-white px-6 py-16 text-center shadow-[var(--shadow-soft)]">
          <p className="text-ink-700 text-sm font-medium">{t.customers.none}</p>
          <p className="text-ink-500 mx-auto mt-1.5 max-w-sm text-xs leading-relaxed">
            {t.customers.noneHint}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <form
              method="get"
              className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none"
            >
              <input
                name="q"
                defaultValue={query}
                placeholder={t.customers.search}
                dir="ltr"
                className="ring-ink-300 focus:ring-ink-900 h-10 min-w-0 flex-1 rounded-xl bg-white px-3 text-sm ring-1 focus:outline-none sm:max-w-xs sm:flex-none"
              />
              <button
                type="submit"
                className="ring-ink-300 hover:bg-ink-900 hover:text-white h-10 shrink-0 rounded-full bg-white px-5 text-[13px] font-medium whitespace-nowrap ring-1 transition-colors duration-200"
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
              className="ring-ink-300 hover:bg-ink-100 inline-flex h-10 shrink-0 items-center rounded-xl bg-white px-4 text-sm font-medium whitespace-nowrap ring-1 sm:ms-auto"
              title={t.customers.exportHint}
            >
              {t.customers.export}
            </a>
          </div>

          <div className="rounded-card overflow-hidden bg-white shadow-[var(--shadow-soft)]">
            <table className="stack-table w-full text-sm">
              <thead className="bg-canvas text-ink-500 text-[11px] font-medium tracking-[0.12em] uppercase">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">
                    {t.customers.email}
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    {t.customers.language}
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    {t.customers.joined}
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    {t.customers.status}
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-ink-200/70 divide-y">
                {matches.map((row) => {
                  const active = !row.unsubscribedAt;
                  return (
                    <tr key={row.id} className="hover:bg-canvas/70">
                      <td
                        data-label=""
                        className="text-ink-900 px-4 py-2 font-medium"
                        dir="ltr"
                      >
                        {row.email}
                      </td>
                      <td
                        data-label={t.customers.language}
                        className="text-ink-600 px-4 py-2 uppercase"
                      >
                        {row.locale}
                      </td>
                      <td
                        data-label={t.customers.joined}
                        className="text-ink-600 px-4 py-2"
                      >
                        {dateFormat.format(row.createdAt)}
                      </td>
                      <td data-label={t.customers.status} className="px-4 py-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
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
                      <td data-label="" data-actions="" className="px-4 py-2">
                        <div className="flex items-center gap-1 sm:justify-end">
                          <form action={setSubscribed}>
                            <input type="hidden" name="id" value={row.id} />
                            <input
                              type="hidden"
                              name="subscribed"
                              value={active ? "0" : "1"}
                            />
                            <button
                              type="submit"
                              className="text-ink-600 hover:bg-ink-100 rounded-xl px-2.5 py-1.5 text-xs font-medium"
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
                              className="text-sale hover:bg-sale/10 rounded-xl px-2.5 py-1.5 text-xs font-medium"
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
