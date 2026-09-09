import { redirect } from "next/navigation";

import { deleteMessageAction, setMessageRead } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { loadMessages } from "@/lib/messages";

/**
 * The inbox: what visitors wrote on the contact page, newest first, unread
 * in ink. Replying happens in the shop owner's own mail or phone — the row
 * offers the address as a link and the number as a call.
 */
export default async function AdminMessagesPage({
  searchParams,
}: PageProps<"/admin/messages">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [params, locale, rows] = await Promise.all([
    searchParams,
    getAdminLocale(),
    loadMessages(),
  ]);
  const t = adminDictionary(locale).messages;
  const unread = rows.filter((r) => !r.readAt).length;

  const dateFormat = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-KW" : "en-GB",
    {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      numberingSystem: "latn",
      timeZone: "Asia/Kuwait",
    },
  );

  return (
    <div className="max-w-3xl">
      {params.deleted ? (
        <p className="bg-canvas text-ink-700 mb-5 rounded-xl px-4 py-3 text-sm">
          {t.deleted}
        </p>
      ) : null}

      <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-ink-900 text-3xl">{t.title}</h1>
        {rows.length ? (
          <p className="text-ink-500 text-sm tabular-nums">
            {rows.length} {t.total}
            {unread ? ` · ${unread} ${t.unread}` : ""}
          </p>
        ) : null}
      </div>
      <p className="text-ink-500 mb-6 max-w-2xl text-sm leading-relaxed">
        {t.blurb}
      </p>

      {rows.length === 0 ? (
        <div className="rounded-card bg-white px-6 py-16 text-center shadow-[var(--shadow-soft)]">
          <p className="text-ink-700 text-sm font-medium">{t.none}</p>
          <p className="text-ink-500 mx-auto mt-1.5 max-w-sm text-xs leading-relaxed">
            {t.noneHint}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const read = Boolean(row.readAt);
            return (
              <li
                key={row.id}
                className={`rounded-card bg-white p-5 shadow-[var(--shadow-soft)] ${
                  read ? "" : "ring-brand-900/60 ring-1"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p
                    className={`text-[15px] ${read ? "text-ink-700" : "text-ink-900 font-medium"}`}
                  >
                    {row.name}
                    {!read ? (
                      <span className="bg-brand-900 ms-2 inline-block size-2 rounded-full align-middle" />
                    ) : null}
                  </p>
                  <p className="text-ink-400 text-[12px]" dir="ltr">
                    {dateFormat.format(row.createdAt)} ·{" "}
                    {row.locale.toUpperCase()}
                  </p>
                </div>
                <p
                  className="text-ink-600 mt-1 flex flex-wrap gap-x-4 text-[13px]"
                  dir="ltr"
                >
                  {row.email ? (
                    <a
                      href={`mailto:${row.email}`}
                      className="link-draw hover:text-ink-900"
                    >
                      {row.email}
                    </a>
                  ) : null}
                  {row.phone ? (
                    <a
                      href={`tel:${row.phone}`}
                      className="link-draw hover:text-ink-900"
                    >
                      {row.phone}
                    </a>
                  ) : null}
                </p>
                <p className="text-ink-800 mt-4 text-[15px] leading-relaxed whitespace-pre-line">
                  {row.body}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={setMessageRead}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="read" value={read ? "0" : "1"} />
                    <button
                      type="submit"
                      className="ring-ink-300 hover:bg-ink-900 hover:text-white h-9 rounded-full bg-white px-4 text-[12px] font-medium ring-1 transition-colors duration-200"
                    >
                      {read ? t.markUnread : t.markRead}
                    </button>
                  </form>
                  <form action={deleteMessageAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="text-sale hover:bg-sale/10 h-9 rounded-full px-4 text-[12px] font-medium transition-colors duration-200"
                    >
                      {t.delete}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
