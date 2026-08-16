import Link from "next/link";
import { redirect } from "next/navigation";

import { saveCategory } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { CategoryForm } from "@/admin/ui/CategoryForm";
import { artOptions, departmentOptions } from "@/admin/ui/form-options";

export default async function NewCategoryPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const t = adminDictionary(await getAdminLocale());

  return (
    <div>
      <Link
        href="/admin/categories"
        className="text-ink-500 hover:text-brand-600 text-xs font-medium"
      >
        ← {t.categories.title}
      </Link>
      <h1 className="text-ink-900 mt-2 mb-5 text-xl font-bold">
        {t.categories.addTitle}
      </h1>

      <CategoryForm
        action={saveCategory.bind(null, null)}
        t={t}
        departments={departmentOptions()}
        arts={artOptions}
      />
    </div>
  );
}
