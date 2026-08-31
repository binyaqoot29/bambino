import { redirect } from "next/navigation";

import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { ShippingForm } from "@/admin/ui/ShippingForm";
import { loadSettings } from "@/lib/site-settings";

export default async function AdminShippingPage({
  searchParams,
}: PageProps<"/admin/shipping">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [params, locale, settings] = await Promise.all([
    searchParams,
    getAdminLocale(),
    loadSettings(),
  ]);
  const t = adminDictionary(locale);

  return (
    <div className="max-w-2xl">
      {params.saved ? (
        <p className="bg-success/10 text-success mb-4 rounded-lg px-4 py-2.5 text-sm font-medium">
          {t.shipping.saved}
        </p>
      ) : null}

      <h1 className="text-ink-900 mb-1 text-xl font-bold">
        {t.shipping.title}
      </h1>
      <p className="text-ink-500 mb-5 text-sm leading-relaxed">
        {t.shipping.blurb}
      </p>

      <ShippingForm settings={settings.shipping} t={t} />
    </div>
  );
}
