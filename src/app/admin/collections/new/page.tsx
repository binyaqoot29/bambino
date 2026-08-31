import { redirect } from "next/navigation";

import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { CollectionForm } from "@/admin/ui/CollectionForm";
import { loadCollections } from "@/lib/catalog/collections";
import { pickableProducts } from "@/admin/pickable";

export default async function NewCollectionPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [locale, products, existing] = await Promise.all([
    getAdminLocale(),
    pickableProducts(),
    loadCollections(),
  ]);
  const t = adminDictionary(locale);

  return (
    <div className="max-w-3xl">
      <h1 className="text-ink-900 mb-5 text-xl font-bold">
        {t.collections.newTitle}
      </h1>
      <CollectionForm
        isNew
        locale={locale}
        t={t}
        products={products}
        draft={{
          slug: "",
          nameEn: "",
          nameAr: "",
          blurbEn: "",
          blurbAr: "",
          rule: null,
          // Land at the end of the list rather than tying with the first.
          position: existing.length,
          visible: true,
          members: [],
        }}
      />
    </div>
  );
}
