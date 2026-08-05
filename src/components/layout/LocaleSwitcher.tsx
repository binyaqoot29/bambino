"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { GlobeIcon } from "@/components/ui/Icons";
import { localeMeta, locales, localizePath, type Locale } from "@/i18n/config";

/**
 * Swaps the locale segment and remembers the choice so the proxy honours it on
 * the next visit.
 *
 * The `href` is built from the pathname alone — deliberately, so the link is a
 * real crawlable URL and the header doesn't force every page out of static
 * prerendering (which `useSearchParams()` would). Any active filters are
 * re-attached at click time from `window.location`, so a person switching
 * language from a filtered listing keeps their filters.
 */
export function LocaleSwitcher({
  locale,
  label,
  className = "",
}: {
  locale: Locale;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const other = locales.find((l) => l !== locale) ?? locale;
  const href = localizePath(pathname, other);

  return (
    <Link
      href={href}
      hrefLang={other}
      lang={other}
      title={label}
      aria-label={`${label}: ${localeMeta[other].label}`}
      onClick={(event) => {
        document.cookie = `bambino_locale=${other}; path=/; max-age=31536000; samesite=lax`;
        const search = window.location.search;
        if (search) {
          event.preventDefault();
          router.push(`${href}${search}`);
        }
      }}
      className={`text-ink-600 hover:text-brand-600 hover:bg-brand-50 inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors ${className}`}
    >
      <GlobeIcon className="size-4.5" />
      <span>{localeMeta[other].nativeLabel}</span>
    </Link>
  );
}
