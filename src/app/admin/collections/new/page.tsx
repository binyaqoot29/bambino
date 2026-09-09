import { redirect } from "next/navigation";

import { isAuthenticated } from "@/admin/auth";
import { serveFromSnapshot } from "@/lib/cache/snapshot";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { CollectionForm } from "@/admin/ui/CollectionForm";
import { loadCollections } from "@/lib/catalog/collections";
import { pickableProducts } from "@/admin/pickable";

export default async function NewCollectionPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  // Catalogue and settings come from the KV snapshot here too: the admin's
  // own saves refresh it, and a KV write is visible at once where it was
  // made. Actions never read it — they run in their own requests.
  serveFromSnapshot();

  const [locale, products, existing] = await Promise.all([
    getAdminLocale(),
    pickableProducts(),
    loadCollections(),
  ]);
  const t = adminDictionary(locale);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-ink-900 mb-6 text-3xl">
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
