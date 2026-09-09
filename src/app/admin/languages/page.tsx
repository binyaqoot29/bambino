import Link from "next/link";
import { redirect } from "next/navigation";

import { saveLanguages } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { findTranslationGaps } from "@/admin/coverage";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { loadSettings } from "@/lib/site-settings";

export default async function AdminLanguagesPage({
  searchParams,
}: PageProps<"/admin/languages">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [params, locale, settings, gaps] = await Promise.all([
    searchParams,
    getAdminLocale(),
    loadSettings(),
    findTranslationGaps(),
  ]);
  const t = adminDictionary(locale);

  const fieldLabel = {
    name: t.languages.fieldName,
    summary: t.languages.fieldSummary,
    description: t.languages.fieldDescription,
    blurb: t.languages.fieldBlurb,
  };
  const kindLabel = {
    product: t.languages.productsWord,
    category: t.languages.categoriesWord,
    collection: t.languages.collectionsWord,
  };

  return (
    <div className="max-w-2xl">
      {params.saved ? (
        <p className="bg-success/10 text-success mb-5 rounded-xl px-4 py-3 text-sm">
          {t.languages.saved}
        </p>
      ) : null}

      <h1 className="text-ink-900 mb-1 text-xl font-medium">
        {t.languages.title}
      </h1>
      <p className="text-ink-500 mb-5 text-sm leading-relaxed">
        {t.languages.blurb}
      </p>

      <form action={saveLanguages}>
        <section className="ring-ink-200 divide-ink-200/70 divide-y rounded-xl bg-white ring-1">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1">
              <p className="text-ink-900 text-sm font-medium">
                {t.languages.english}
              </p>
              <p className="text-ink-400 mt-0.5 text-[11px]">
                {t.languages.alwaysOn}
              </p>
            </div>
            <span className="bg-success/10 text-success rounded px-2 py-0.5 text-[11px] font-medium">
              {t.languages.enabled}
            </span>
          </div>

          <label className="flex cursor-pointer items-start gap-3 p-4">
            <input
              type="checkbox"
              name="arabicEnabled"
              defaultChecked={settings.languages.arabicEnabled}
              className="accent-brand-900 mt-0.5 size-4"
            />
            <span className="flex-1">
              <span className="text-ink-900 block text-sm font-medium">
                {t.languages.arabic}
              </span>
              <span className="text-ink-500 mt-0.5 block text-[11px] leading-relaxed">
                {t.languages.arabicHint}
              </span>
            </span>
          </label>

          <div className="p-4">
            <label
              htmlFor="defaultLocale"
              className="text-ink-700 block text-[12px] font-medium"
            >
              {t.languages.defaultLocale}
            </label>
            <select
              id="defaultLocale"
              name="defaultLocale"
              defaultValue={settings.languages.defaultLocale}
              className="ring-ink-300 focus:ring-ink-900 mt-1.5 h-10 rounded-xl bg-white px-3 text-sm ring-1 focus:outline-none"
            >
              <option value="en">{t.languages.english}</option>
              <option value="ar">{t.languages.arabic}</option>
            </select>
            <p className="text-ink-400 mt-1 text-[11px]">
              {t.languages.defaultHint}
            </p>
          </div>
        </section>

        <button
          type="submit"
          className="bg-brand-900 hover:bg-brand-800 mt-5 h-11 rounded-full px-6 text-[13px] font-medium text-white"
        >
          {t.form.save}
        </button>
      </form>

      <section className="mt-8">
        <h2 className="font-display text-ink-900 text-xl">
          {t.languages.coverage}
        </h2>
        <p className="text-ink-500 mt-1 mb-3 text-xs leading-relaxed">
          {t.languages.coverageBlurb}
        </p>

        {gaps.length === 0 ? (
          <p className="bg-success/10 text-success rounded-xl px-4 py-3 text-sm font-medium">
            {t.languages.complete}
          </p>
        ) : (
          <div className="rounded-card overflow-hidden bg-white shadow-[var(--shadow-soft)]">
            <table className="w-full text-sm">
              <thead className="bg-canvas text-ink-500 text-[11px] font-medium tracking-[0.12em] uppercase">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">
                    {t.languages.item}
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    {t.languages.missingFields}
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-ink-200/70 divide-y">
                {gaps.map((gap) => (
                  <tr
                    key={`${gap.kind}:${gap.id}`}
                    className="hover:bg-canvas/70"
                  >
                    <td className="px-4 py-2">
                      <span className="text-ink-900 font-medium">
                        {gap.label}
                      </span>
                      <span className="text-ink-400 ms-2 text-[11px]">
                        {kindLabel[gap.kind]}
                      </span>
                    </td>
                    <td className="text-ink-600 px-4 py-2 text-xs">
                      {gap.fields.map((f) => fieldLabel[f]).join("، ")}
                    </td>
                    <td className="px-4 py-2 text-end">
                      <Link
                        href={gap.href}
                        className="link-draw text-ink-800 hover:text-ink-900 text-xs font-medium"
                      >
                        {t.languages.fix}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
