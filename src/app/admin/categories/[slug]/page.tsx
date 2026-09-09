import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { saveCategory } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { CategoryForm } from "@/admin/ui/CategoryForm";
import { artOptions, departmentOptions } from "@/admin/ui/form-options";
import { findCategory } from "@/lib/catalog/categories";

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[slug]">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const { slug } = await params;
  const [category, locale] = await Promise.all([
    findCategory(slug),
    getAdminLocale(),
  ]);
  if (!category) notFound();
  const t = adminDictionary(locale);

  return (
    <div>
      <Link
        href="/admin/categories"
        className="link-draw text-ink-500 hover:text-ink-900 text-xs"
      >
        ← {t.categories.title}
      </Link>
      <div className="mt-2 mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-ink-900 text-3xl">
          {category.name.en}
        </h1>
        <Link
          href={`/en/c/${category.slug}`}
          target="_blank"
          className="link-draw text-ink-800 hover:text-ink-900 text-xs font-medium"
        >
          {t.products.viewOnShop} ↗
        </Link>
      </div>

      <CategoryForm
        action={saveCategory.bind(null, category.slug)}
        category={category}
        t={t}
        departments={departmentOptions()}
        arts={artOptions}
      />
    </div>
  );
}
