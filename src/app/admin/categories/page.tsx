import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteCategory } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { ProductArt } from "@/components/product/ProductArt";
import { loadCategories } from "@/lib/catalog/categories";
import { countsByCategory } from "@/lib/catalog/queries";
import { DEPARTMENT_LABELS } from "@/lib/catalog/types";

export default async function AdminCategoriesPage({
  searchParams,
}: PageProps<"/admin/categories">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [locale, params, categories, counts] = await Promise.all([
    getAdminLocale(),
    searchParams,
    loadCategories(),
    countsByCategory(),
  ]);
  const t = adminDictionary(locale);
  const blocked = params.blocked ? String(params.blocked) : null;

  return (
    <div>
      {params.saved ? (
        <p className="bg-success/10 text-success mb-4 rounded-lg px-4 py-2.5 text-sm font-medium">
          {t.categories.saved}
        </p>
      ) : null}
      {params.deleted ? (
        <p className="bg-ink-200 text-ink-700 mb-4 rounded-lg px-4 py-2.5 text-sm font-medium">
          {t.categories.deleted}
        </p>
      ) : null}
      {blocked ? (
        <p className="bg-sale/10 text-sale mb-4 rounded-lg px-4 py-2.5 text-sm font-medium">
          {t.categories.deleteBlocked}
        </p>
      ) : null}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink-900 text-xl font-bold">
            {t.categories.title}
          </h1>
          <p className="text-ink-500 mt-0.5 text-xs tabular-nums">
            {categories.length} {t.categories.count}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-brand-500 hover:bg-brand-600 inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white"
        >
          {t.categories.add}
        </Link>
      </div>

      <div className="ring-ink-200 overflow-hidden rounded-xl bg-white ring-1">
        <table className="stack-table w-full text-sm">
          <thead className="border-ink-200 bg-ink-50 border-b">
            <tr className="text-ink-500 text-start text-[11px] tracking-wide uppercase">
              <th className="px-4 py-2.5 text-start font-semibold">
                {t.categories.name}
              </th>
              <th className="px-4 py-2.5 text-start font-semibold">
                {t.categories.department}
              </th>
              <th className="px-4 py-2.5 text-start font-semibold">
                {t.products.title}
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-ink-100 divide-y">
            {categories.map((category) => {
              const used = counts[category.slug] ?? 0;
              return (
                <tr key={category.slug} className="hover:bg-ink-50/60">
                  <td data-label="" className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductArt
                        art={category.art}
                        seed={category.slug}
                        className="size-10 shrink-0 rounded-md"
                      />
                      <div className="min-w-0">
                        <p className="text-ink-900 truncate font-medium">
                          {category.name.en}
                        </p>
                        <p className="text-ink-400 truncate text-xs" dir="rtl">
                          {category.name.ar}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    data-label={t.categories.department}
                    className="text-ink-600 px-4 py-3 text-xs"
                  >
                    {DEPARTMENT_LABELS[category.department][locale]}
                  </td>
                  <td
                    data-label={t.products.title}
                    className="text-ink-600 px-4 py-3 text-xs tabular-nums"
                  >
                    {used}
                  </td>
                  <td
                    data-label=""
                    data-actions=""
                    className="px-4 py-3 text-end whitespace-nowrap max-sm:text-start"
                  >
                    <Link
                      href={`/admin/categories/${category.slug}`}
                      className="text-brand-600 hover:text-brand-700 text-xs font-semibold"
                    >
                      {t.products.edit}
                    </Link>
                    {used === 0 ? (
                      <form action={deleteCategory} className="ms-3 inline">
                        <input
                          type="hidden"
                          name="slug"
                          value={category.slug}
                        />
                        <button
                          type="submit"
                          className="text-ink-400 hover:text-sale text-xs font-semibold"
                        >
                          {t.products.delete}
                        </button>
                      </form>
                    ) : (
                      <span
                        title={t.categories.deleteBlocked}
                        className="text-ink-300 ms-3 text-xs font-semibold"
                      >
                        {t.categories.inUse}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
