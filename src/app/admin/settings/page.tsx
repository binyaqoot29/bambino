import { redirect } from "next/navigation";

import { saveSettings } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { loadSettings } from "@/lib/site-settings";

export default async function AdminSettingsPage({
  searchParams,
}: PageProps<"/admin/settings">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [locale, params, settings] = await Promise.all([
    getAdminLocale(),
    searchParams,
    loadSettings(),
  ]);
  const t = adminDictionary(locale);

  const fields = [
    { name: "instagram", label: t.settings.instagram, hint: "@bambino.kw", value: settings.social.instagram },
    { name: "tiktok", label: t.settings.tiktok, hint: "@bambino.kw", value: settings.social.tiktok },
    { name: "whatsapp", label: t.settings.whatsapp, hint: t.settings.whatsappHint, value: settings.social.whatsapp },
  ];

  return (
    <div className="max-w-2xl">
      {params.saved ? (
        <p className="bg-success/10 text-success mb-4 rounded-lg px-4 py-2.5 text-sm font-medium">
          {t.settings.saved}
        </p>
      ) : null}

      <h1 className="text-ink-900 mb-5 text-xl font-bold">{t.settings.title}</h1>

      <form action={saveSettings}>
        <section className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
          <h2 className="text-ink-900 text-sm font-bold">{t.settings.social}</h2>
          <p className="text-ink-500 mt-1 text-xs leading-relaxed">
            {t.settings.socialBlurb}
          </p>

          <div className="mt-4 space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="text-ink-700 block text-xs font-semibold"
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  defaultValue={field.value}
                  placeholder={field.hint}
                  dir="ltr"
                  className="ring-ink-300 focus:ring-brand-500 mt-1.5 h-10 w-full rounded-lg bg-white px-3 text-sm ring-1 focus:ring-2 focus:outline-none"
                />
                <p className="text-ink-400 mt-1 text-[11px]" dir="ltr">
                  {field.value ? `${t.settings.preview}: ${field.value}` : t.settings.notSet}
                </p>
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="bg-brand-500 hover:bg-brand-600 mt-5 h-11 rounded-lg px-6 text-sm font-semibold text-white"
        >
          {t.form.save}
        </button>
      </form>
    </div>
  );
}
