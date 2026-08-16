import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { logout } from "@/admin/actions";
import { adminIsConfigured, isAuthenticated } from "@/admin/auth";
import "../globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bambino admin",
  robots: { index: false, follow: false },
};

/**
 * The admin sits outside /[lang] on purpose: it's a single-language internal
 * tool, not part of the bilingual storefront, and it shouldn't inherit the
 * shop chrome or the design switcher.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();

  return (
    <html lang="en" dir="ltr" className={`${poppins.variable} h-full`}>
      <body className="bg-ink-50 flex min-h-full flex-col antialiased">
        <header className="border-ink-200 bg-white border-b">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
            <Link href="/admin" className="flex items-center gap-2">
              <BambinoMark className="text-brand-500 h-7 w-auto" />
              <Wordmark className="text-brand-500 h-3.5 w-auto" />
            </Link>
            <span className="bg-ink-100 text-ink-600 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
              Admin
            </span>

            {authed && adminIsConfigured() ? (
              <div className="ms-auto flex items-center gap-4">
                <Link
                  href="/en"
                  target="_blank"
                  className="text-ink-500 hover:text-brand-600 text-xs font-medium"
                >
                  View shop ↗
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-ink-600 ring-ink-300 hover:bg-ink-100 rounded-lg px-3 py-1.5 text-xs font-medium ring-1"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
