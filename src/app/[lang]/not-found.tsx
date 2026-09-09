import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { loadSettings } from "@/lib/site-settings";

/**
 * The 404 renders inside the locale layout, but `notFound()` can fire before a
 * valid locale is known — so it stays language-neutral and offers both, rather
 * than guessing which one the visitor was after.
 *
 * "Both" means both the shop actually serves: when Arabic is switched off, that
 * button would land on a redirect back to English.
 */
export default async function NotFound() {
  const { languages } = await loadSettings();
  const arabicEnabled = languages.arabicEnabled;

  return (
    <div className="container-bambino flex flex-col items-center py-28 text-center">
      <BambinoMark className="text-brand-300 h-20 w-auto" />
      <p className="eyebrow mt-8">404</p>
      <h1 className="font-display text-ink-900 mt-3 text-4xl">
        We couldn&apos;t find that page
      </h1>
      {arabicEnabled ? (
        <p className="text-ink-500 mt-3 max-w-sm text-sm" dir="rtl" lang="ar">
          لم نتمكّن من العثور على هذه الصفحة
        </p>
      ) : null}
      <div className="mt-8 flex gap-3">
        <Link
          href="/en"
          className="bg-brand-900 hover:bg-brand-800 inline-flex h-12 items-center rounded-full px-7 text-[13px] font-medium tracking-[0.06em] text-white uppercase"
        >
          English
        </Link>
        {arabicEnabled ? (
          <Link
            href="/ar"
            className="text-ink-900 ring-ink-900/80 hover:bg-ink-900 inline-flex h-12 items-center rounded-full px-7 text-[13px] font-medium ring-1 hover:text-white"
          >
            العربية
          </Link>
        ) : null}
      </div>
    </div>
  );
}
