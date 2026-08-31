import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteCollection } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { COLLECTION_RULE_LABELS } from "@/lib/catalog/collection-rules";
import {
  loadCollectionMembers,
  loadCollections,
} from "@/lib/catalog/collections";
import { applyCollectionRule } from "@/lib/catalog/collection-rules";
import { getAllProducts } from "@/lib/catalog/queries";
import { text } from "@/lib/catalog/types";

export default async function AdminCollectionsPage({
  searchParams,
}: PageProps<"/admin/collections">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [params, locale, collections, catalogue] = await Promise.all([
    searchParams,
    getAdminLocale(),
    loadCollections(),
    getAllProducts(),
  ]);
  const t = adminDictionary(locale);

  // Show what each shelf actually holds — an automatic collection's count is
  // only meaningful once its rule has been run.
  const counts = await Promise.all(
    collections.map(async (collection) =>
      collection.rule
        ? applyCollectionRule(collection.rule, catalogue).length
        : (await loadCollectionMembers(collection.slug)).length,
    ),
  );

  const notice = params.saved
    ? t.collections.saved
    : params.created
      ? t.collections.created
      : params.deleted
        ? t.collections.deleted
        : null;

  return (
    <div>
      {notice ? (
        <p
          className={`mb-4 rounded-lg px-4 py-2.5 text-sm font-medium ${
            params.deleted
              ? "bg-ink-200 text-ink-700"
              : "bg-success/10 text-success"
          }`}
        >
          {notice}
        </p>
      ) : null}

      <div className="mb-1 flex items-center gap-3">
        <h1 className="text-ink-900 text-xl font-bold">
          {t.collections.title}
        </h1>
        <Link
          href="/admin/collections/new"
          className="bg-brand-500 hover:bg-brand-600 ms-auto inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-white"
        >
          {t.collections.add}
        </Link>
      </div>
      <p className="text-ink-500 mb-5 max-w-2xl text-sm leading-relaxed">
        {t.collections.blurb}
      </p>

      <div className="ring-ink-200 overflow-hidden rounded-xl bg-white ring-1">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 text-[11px] font-bold tracking-wide uppercase">
            <tr>
              <th className="px-4 py-2.5 text-start font-bold">
                {t.collections.name}
              </th>
              <th className="px-4 py-2.5 text-start font-bold">
                {t.collections.type}
              </th>
              <th className="px-4 py-2.5 text-start font-bold">
                {t.collections.products}
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-ink-100 divide-y">
            {collections.map((collection, index) => (
              <tr key={collection.slug} className="hover:bg-ink-50/60">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/collections/${collection.slug}`}
                    className="text-ink-900 hover:text-brand-600 font-medium"
                  >
                    {text(collection.name, locale)}
                  </Link>
                  <span className="text-ink-400 ms-2 text-[11px]" dir="ltr">
                    /{collection.slug}
                  </span>
                  {!collection.visible ? (
                    <span className="bg-ink-100 text-ink-500 ms-2 rounded px-1.5 py-0.5 text-[11px] font-semibold">
                      {t.collections.hidden}
                    </span>
                  ) : null}
                </td>
                <td className="text-ink-600 px-4 py-2.5 text-xs">
                  {collection.rule ? (
                    <>
                      <span className="text-ink-800 font-semibold">
                        {t.collections.automatic}
                      </span>
                      <span className="text-ink-400 ms-1.5">
                        {COLLECTION_RULE_LABELS[collection.rule][locale]}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink-800 font-semibold">
                      {t.collections.manual}
                    </span>
                  )}
                </td>
                <td className="text-ink-600 px-4 py-2.5 tabular-nums">
                  {counts[index]}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/collections/${collection.slug}`}
                      className="text-ink-600 hover:bg-ink-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                    >
                      {t.collections.edit}
                    </Link>
                    <form action={deleteCollection}>
                      <input
                        type="hidden"
                        name="slug"
                        value={collection.slug}
                      />
                      <button
                        type="submit"
                        className="text-sale hover:bg-sale/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                      >
                        {t.collections.delete}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
