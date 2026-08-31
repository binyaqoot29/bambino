import type { Metadata } from "next";
import { Poppins, Tajawal } from "next/font/google";
import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { logout, setAdminLocale } from "@/admin/actions";
import { adminIsConfigured, isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { AdminNav } from "@/admin/ui/AdminNav";
import "../globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bambino admin",
  robots: { index: false, follow: false },
};

/**
 * The admin sits outside /[lang]: it's an internal tool with its own language
 * preference, so it shouldn't inherit the storefront's locale routing or
 * chrome.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authed, locale] = await Promise.all([
    isAuthenticated(),
    getAdminLocale(),
  ]);
  const t = adminDictionary(locale);
  const signedIn = authed && adminIsConfigured();

  return (
    <html
      lang={locale}
      dir={t.dir}
      className={`${poppins.variable} ${tajawal.variable} h-full`}
    >
      <body
        className={`bg-ink-50 flex min-h-full flex-col antialiased ${
          locale === "ar" ? "font-[family-name:var(--font-tajawal)]" : ""
        }`}
      >
        <header className="border-ink-200 border-b bg-white">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
            <Link href="/admin" className="flex items-center gap-2" dir="ltr">
              <BambinoMark className="text-brand-500 h-7 w-auto" />
              <Wordmark className="text-brand-500 h-3.5 w-auto" />
            </Link>
            <span className="bg-ink-100 text-ink-600 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
              {t.brand}
            </span>

            <div className="ms-auto flex items-center gap-3">
              {/* Language toggle is available even signed out, so the sign-in
                  page can be read in Arabic. */}
              <form action={setAdminLocale}>
                <input
                  type="hidden"
                  name="locale"
                  value={locale === "ar" ? "en" : "ar"}
                />
                <button
                  type="submit"
                  className="text-ink-600 ring-ink-300 hover:bg-ink-100 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1"
                >
                  {locale === "ar" ? "English" : "العربية"}
                </button>
              </form>

              {signedIn ? (
                <>
                  <Link
                    href="/en"
                    target="_blank"
                    className="text-ink-500 hover:text-brand-600 text-xs font-medium"
                  >
                    {t.viewShop} ↗
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="text-ink-600 ring-ink-300 hover:bg-ink-100 rounded-lg px-3 py-1.5 text-xs font-medium ring-1"
                    >
                      {t.signOut}
                    </button>
                  </form>
                </>
              ) : null}
            </div>
          </div>
        </header>

        {signedIn ? (
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-10 lg:py-8">
            <AdminNav labels={t.nav} />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        ) : (
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
