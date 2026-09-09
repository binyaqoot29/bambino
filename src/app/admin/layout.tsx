import type { Metadata } from "next";
import { Amiri, Inter, Playfair_Display, Tajawal } from "next/font/google";
import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { logout, setAdminLocale } from "@/admin/actions";
import { adminIsConfigured, isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { AdminNav } from "@/admin/ui/AdminNav";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
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

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
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
      className={`${inter.variable} ${playfair.variable} ${tajawal.variable} ${amiri.variable} h-full`}
    >
      <body className="bg-canvas flex min-h-full flex-col overflow-x-clip antialiased">
        <header className="border-ink-200/70 bg-paper/92 sticky top-0 z-40 border-b backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
            <Link href="/admin" className="flex items-center gap-2.5" dir="ltr">
              <BambinoMark className="text-brand-500 h-8 w-auto" />
              <Wordmark className="text-brand-900 h-4 w-auto" />
            </Link>
            <span className="eyebrow text-ink-400 hidden sm:inline">
              {t.brand}
            </span>

            <div className="ms-auto flex items-center gap-2 sm:gap-3">
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
                  className="text-ink-700 hover:bg-ink-100 rounded-full px-3 py-2 text-[13px] whitespace-nowrap transition-colors duration-200"
                >
                  {locale === "ar" ? "English" : "العربية"}
                </button>
              </form>

              {signedIn ? (
                <>
                  <Link
                    href="/en"
                    target="_blank"
                    title={t.viewShop}
                    className="link-draw text-ink-600 hover:text-ink-900 text-[13px] whitespace-nowrap"
                  >
                    <span className="max-sm:sr-only">{t.viewShop} </span>↗
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="text-ink-800 ring-ink-300 hover:bg-ink-900 hover:text-white rounded-full px-4 py-2 text-[13px] whitespace-nowrap ring-1 transition-colors duration-200"
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
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 lg:flex-row lg:gap-12 lg:py-12">
            <AdminNav labels={t.nav} />
            <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
          </div>
        ) : (
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
