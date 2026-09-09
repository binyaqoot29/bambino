import { redirect } from "next/navigation";

import { saveSettings } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { serveFromSnapshot } from "@/lib/cache/snapshot";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { loadSettings } from "@/lib/site-settings";

export default async function AdminSettingsPage({
  searchParams,
}: PageProps<"/admin/settings">) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  // Catalogue and settings come from the KV snapshot here too: the admin's
  // own saves refresh it, and a KV write is visible at once where it was
  // made. Actions never read it — they run in their own requests.
  serveFromSnapshot();

  const [locale, params, settings] = await Promise.all([
    getAdminLocale(),
    searchParams,
    loadSettings(),
  ]);
  const t = adminDictionary(locale);

  const fields = [
    {
      name: "instagram",
      label: t.settings.instagram,
      hint: "@bambino.kw",
      value: settings.social.instagram,
    },
    {
      name: "tiktok",
      label: t.settings.tiktok,
      hint: "@bambino.kw",
      value: settings.social.tiktok,
    },
    {
      name: "whatsapp",
      label: t.settings.whatsapp,
      hint: t.settings.whatsappHint,
      value: settings.social.whatsapp,
    },
    {
      name: "email",
      label: t.settings.email,
      hint: t.settings.emailHint,
      value: settings.social.email,
    },
  ];

  return (
    <div className="max-w-2xl">
      {params.saved ? (
        <p className="bg-success/10 text-success mb-5 rounded-xl px-4 py-3 text-sm">
          {t.settings.saved}
        </p>
      ) : null}

      <h1 className="font-display text-ink-900 mb-6 text-3xl">
        {t.settings.title}
      </h1>

      <form action={saveSettings}>
        <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-ink-900 text-xl">
            {t.settings.social}
          </h2>
          <p className="text-ink-500 mt-1 text-xs leading-relaxed">
            {t.settings.socialBlurb}
          </p>

          <div className="mt-4 space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="text-ink-700 block text-[12px] font-medium"
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  defaultValue={field.value}
                  placeholder={field.hint}
                  dir="ltr"
                  className="ring-ink-300 focus:ring-ink-900 mt-1.5 h-10 w-full rounded-xl bg-white px-3 text-sm ring-1 focus:outline-none"
                />
                <p className="text-ink-400 mt-1 text-[11px]" dir="ltr">
                  {field.value
                    ? `${t.settings.preview}: ${field.value}`
                    : t.settings.notSet}
                </p>
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="bg-brand-900 hover:bg-brand-800 mt-5 h-11 rounded-full px-6 text-[13px] font-medium text-white"
        >
          {t.form.save}
        </button>
      </form>
    </div>
  );
}
