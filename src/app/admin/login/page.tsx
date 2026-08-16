import { redirect } from "next/navigation";

import { LoginForm } from "@/admin/ui/LoginForm";
import { adminIsConfigured, isAuthenticated } from "@/admin/auth";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  if (!adminIsConfigured()) {
    return (
      <div className="ring-ink-200 mx-auto max-w-md rounded-xl bg-white p-8 ring-1">
        <h1 className="text-ink-900 text-lg font-bold">Admin not configured</h1>
        <p className="text-ink-600 mt-3 text-sm leading-relaxed">
          Set <code className="bg-ink-100 rounded px-1.5 py-0.5">ADMIN_PASSWORD</code>{" "}
          before the admin panel can be used. Until it&apos;s set the panel
          stays locked — it never falls back to an open state.
        </p>
        <p className="text-ink-500 mt-3 text-xs">
          Locally, add it to <code>.env.local</code>. In production, set it on
          the hosting project. See the README under &ldquo;Admin panel&rdquo;.
        </p>
      </div>
    );
  }

  return <LoginForm />;
}
