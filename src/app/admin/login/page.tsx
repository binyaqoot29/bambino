import { redirect } from "next/navigation";

import { LoginForm } from "@/admin/ui/LoginForm";
import { adminIsConfigured, isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  const t = adminDictionary(await getAdminLocale());

  if (!adminIsConfigured()) {
    return (
      <div className="ring-ink-200 mx-auto max-w-md rounded-xl bg-white p-8 ring-1">
        <h1 className="text-ink-900 text-lg font-bold">{t.notConfigured}</h1>
        <p className="text-ink-600 mt-3 text-sm leading-relaxed">
          {t.notConfiguredBody}
        </p>
        <p className="text-ink-500 mt-3 text-xs">{t.notConfiguredWhere}</p>
      </div>
    );
  }

  return <LoginForm t={t} />;
}
