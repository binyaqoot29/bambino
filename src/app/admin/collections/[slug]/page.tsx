import { notFound, redirect } from "next/navigation";

import { isAuthenticated } from "@/admin/auth";
import { serveFromSnapshot } from "@/lib/cache/snapshot";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { CollectionForm } from "@/admin/ui/CollectionForm";
import { pickableProducts } from "@/admin/pickable";
import {
  findCollection,
  loadCollectionMembers,
} from "@/lib/catalog/collections";

export default async function EditCollectionPage({
  params,
}: PageProps<"/admin/collections/[slug]">) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  // Catalogue and settings come from the KV snapshot here too: the admin's
  // own saves refresh it, and a KV write is visible at once where it was
  // made. Actions never read it — they run in their own requests.
  serveFromSnapshot();

  const { slug } = await params;
  const [locale, collection, products] = await Promise.all([
    getAdminLocale(),
    findCollection(slug),
    pickableProducts(),
  ]);
  if (!collection) notFound();

  const t = adminDictionary(locale);
  const members = collection.rule ? [] : await loadCollectionMembers(slug);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-ink-900 mb-6 text-3xl">
        {t.collections.editTitle}
      </h1>
      <CollectionForm
        isNew={false}
        locale={locale}
        t={t}
        products={products}
        draft={{
          slug: collection.slug,
          nameEn: collection.name.en,
          nameAr: collection.name.ar,
          blurbEn: collection.blurb?.en ?? "",
          blurbAr: collection.blurb?.ar ?? "",
          rule: collection.rule,
          position: collection.position,
          visible: collection.visible,
          members,
        }}
      />
    </div>
  );
}
