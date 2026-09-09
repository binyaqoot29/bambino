import Link from "next/link";
import { redirect } from "next/navigation";

import { saveCategory } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { serveFromSnapshot } from "@/lib/cache/snapshot";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { CategoryForm } from "@/admin/ui/CategoryForm";
import { artOptions, departmentOptions } from "@/admin/ui/form-options";

export default async function NewCategoryPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  // Catalogue and settings come from the KV snapshot here too: the admin's
  // own saves refresh it, and a KV write is visible at once where it was
  // made. Actions never read it — they run in their own requests.
  serveFromSnapshot();

  const t = adminDictionary(await getAdminLocale());

  return (
    <div>
      <Link
        href="/admin/categories"
        className="link-draw text-ink-500 hover:text-ink-900 text-xs"
      >
        ← {t.categories.title}
      </Link>
      <h1 className="font-display text-ink-900 mt-2 mb-6 text-3xl">
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
