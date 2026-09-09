import { redirect } from "next/navigation";

import { isAuthenticated } from "@/admin/auth";
import { serveFromSnapshot } from "@/lib/cache/snapshot";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { ShippingForm } from "@/admin/ui/ShippingForm";
import { loadSettings } from "@/lib/site-settings";

export default async function AdminShippingPage({
  searchParams,
}: PageProps<"/admin/shipping">) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  // Catalogue and settings come from the KV snapshot here too: the admin's
  // own saves refresh it, and a KV write is visible at once where it was
  // made. Actions never read it — they run in their own requests.
  serveFromSnapshot();

  const [params, locale, settings] = await Promise.all([
    searchParams,
    getAdminLocale(),
    loadSettings(),
  ]);
  const t = adminDictionary(locale);

  return (
    <div className="max-w-2xl">
      {params.saved ? (
        <p className="bg-success/10 text-success mb-5 rounded-xl px-4 py-3 text-sm">
          {t.shipping.saved}
        </p>
      ) : null}

      <h1 className="text-ink-900 mb-1 text-xl font-medium">
        {t.shipping.title}
      </h1>
      <p className="text-ink-500 mb-5 text-sm leading-relaxed">
        {t.shipping.blurb}
      </p>

      <ShippingForm settings={settings.shipping} t={t} />
    </div>
  );
}
