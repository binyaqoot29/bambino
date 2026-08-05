import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";

/**
 * The 404 renders inside the locale layout, but `notFound()` can fire before a
 * valid locale is known — so it stays language-neutral and links to both.
 */
export default function NotFound() {
  return (
    <div className="container-bambino flex flex-col items-center py-28 text-center">
      <BambinoMark className="text-mint-400 h-20 w-auto" />
      <p className="text-brand-400 mt-8 text-sm font-medium tracking-[0.2em] uppercase">
        404
      </p>
      <h1 className="text-brand-900 mt-3 text-3xl font-semibold tracking-tight">
        We couldn&apos;t find that page
      </h1>
      <p className="text-ink-500 mt-3 max-w-sm text-sm" dir="rtl" lang="ar">
        لم نتمكّن من العثور على هذه الصفحة
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/en"
          className="bg-brand-500 hover:bg-brand-600 inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-white"
        >
          English
        </Link>
        <Link
          href="/ar"
          className="text-brand-700 ring-brand-200 hover:bg-brand-50 inline-flex h-11 items-center rounded-full px-6 text-sm font-medium ring-1"
        >
          العربية
        </Link>
      </div>
    </div>
  );
}
