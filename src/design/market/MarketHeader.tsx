"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { useBag } from "@/components/cart/store";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ProductArt } from "@/components/product/ProductArt";
import {
  BagIcon,
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  TruckIcon,
  UserIcon,
} from "@/components/ui/Icons";
import type { HeaderStrings } from "@/design/studio/StudioHeader";
import type { Locale } from "@/i18n/config";
import type { AgeLink, NavDepartment } from "@/lib/nav";
import { routes } from "@/lib/routes";

/**
 * Market header.
 *
 * Where Studio leads with the logo and lets the nav breathe, this leads with
 * search — the single widest input on the page — and packs the utility rail
 * tight beside it. Below the bar sits a scrolling category strip, so a
 * department is always one click away without opening anything.
 */
export function MarketHeader({
  locale,
  nav,
  ages,
  strings,
  announcements,
}: {
  locale: Locale;
  nav: NavDepartment[];
  ages: AgeLink[];
  strings: HeaderStrings;
  announcements: string[];
}) {
  const router = useRouter();
  const { count, wishlist, ready } = useBag();
  const [openDepartment, setOpenDepartment] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpenDepartment(null);
      setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function hoverOpen(key: string) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenDepartment(key);
  }
  function hoverClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenDepartment(null), 120);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (query) router.push(routes.search(locale, query));
  }

  const openPanel = nav.find((d) => d.key === openDepartment);

  return (
    <>
      {/* Utility strip — thin, factual, no rotation. */}
      <div className="bg-brand-900 text-mint-200/90 hidden text-[11px] md:block">
        <div className="container-bambino flex h-8 items-center justify-between">
          <p className="flex items-center gap-1.5">
            <TruckIcon className="size-3.5" />
            {announcements[0]}
          </p>
          <div className="flex items-center gap-5">
            {announcements.slice(1).map((message) => (
              <span key={message}>{message}</span>
            ))}
          </div>
        </div>
      </div>

      <header className="border-ink-200 bg-paper sticky top-0 z-50 border-b">
        <div className="container-bambino">
          <div className="flex h-16 items-center gap-3 lg:gap-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={strings.openMenu}
              className="text-ink-700 hover:bg-ink-100 -ms-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg lg:hidden"
            >
              <MenuIcon className="size-6" />
            </button>

            <Link
              href={routes.home(locale)}
              aria-label="Bambino"
              className="flex shrink-0 items-center gap-2"
              dir="ltr"
            >
              <BambinoMark className="text-brand-500 h-8 w-auto" />
              <Wordmark className="text-brand-500 hidden h-4.5 w-auto sm:block" />
            </Link>

            {/* Search is the centrepiece here. */}
            <form
              onSubmit={submitSearch}
              role="search"
              className="relative hidden flex-1 md:block"
            >
              <SearchIcon className="text-ink-400 pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                placeholder={strings.searchPlaceholder}
                aria-label={strings.search}
                className="ring-ink-300 focus:ring-brand-500 h-11 w-full rounded-lg bg-white ps-11 pe-24 text-sm ring-1 focus:ring-2 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 absolute end-1.5 top-1/2 h-8 -translate-y-1/2 rounded-md px-4 text-xs font-semibold text-white"
              >
                {strings.search}
              </button>
            </form>

            <div className="ms-auto flex items-center gap-1 md:ms-0">
              <LocaleSwitcher
                locale={locale}
                label={strings.changeLanguage}
                className="hidden rounded-lg sm:inline-flex"
              />
              <Link
                href={routes.wishlist(locale)}
                aria-label={strings.wishlist}
                className="text-ink-700 hover:bg-ink-100 relative hidden size-10 items-center justify-center rounded-lg sm:inline-flex"
              >
                <HeartIcon className="size-5.5" />
                {ready && wishlist.length > 0 ? (
                  <Count value={wishlist.length} locale={locale} />
                ) : null}
              </Link>
              <button
                type="button"
                aria-label={strings.account}
                className="text-ink-700 hover:bg-ink-100 hidden size-10 items-center justify-center rounded-lg lg:inline-flex"
              >
                <UserIcon className="size-5.5" />
              </button>
              <Link
                href={routes.cart(locale)}
                aria-label={strings.cart}
                className="bg-brand-500 hover:bg-brand-600 relative inline-flex h-10 items-center gap-2 rounded-lg px-3 text-white"
              >
                <BagIcon className="size-5" />
                <span className="hidden text-xs font-semibold tabular-nums lg:inline">
                  {ready ? count : 0}
                </span>
                {ready && count > 0 ? (
                  <span className="bg-sale absolute -end-1 -top-1 inline-flex min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] leading-4.5 font-bold text-white tabular-nums lg:hidden">
                    {count}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>

          {/* mobile search */}
          <form onSubmit={submitSearch} role="search" className="pb-3 md:hidden">
            <div className="relative">
              <SearchIcon className="text-ink-400 pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                placeholder={strings.searchPlaceholder}
                aria-label={strings.search}
                className="ring-ink-300 focus:ring-brand-500 h-10 w-full rounded-lg bg-white ps-11 pe-4 text-sm ring-1 focus:ring-2 focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Department bar */}
        <nav
          className="border-ink-200 hidden border-t lg:block"
          onMouseLeave={hoverClose}
          onClick={() => setOpenDepartment(null)}
        >
          <div className="container-bambino flex items-center gap-1">
            {nav.map((department) => (
              <Link
                key={department.key}
                href={department.href}
                onMouseEnter={() => hoverOpen(department.key)}
                onFocus={() => hoverOpen(department.key)}
                className={`inline-flex h-11 items-center gap-1 px-3 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                  openDepartment === department.key
                    ? "text-brand-600"
                    : "text-ink-700 hover:text-brand-600"
                }`}
              >
                {department.label}
                <ChevronDownIcon className="size-3.5 opacity-50" />
              </Link>
            ))}
            <span className="bg-ink-200 mx-2 h-4 w-px" />
            <Link
              href={routes.collection(locale, "new-in")}
              className="text-ink-700 hover:text-brand-600 inline-flex h-11 items-center px-3 text-[13px] font-semibold"
            >
              {strings.newIn}
            </Link>
            <Link
              href={routes.collection(locale, "sale")}
              className="text-sale inline-flex h-11 items-center gap-1.5 px-3 text-[13px] font-bold"
            >
              {strings.sale}
              <span className="bg-sale rounded px-1.5 py-0.5 text-[10px] font-bold text-white">
                %
              </span>
            </Link>
          </div>
        </nav>

        {openPanel ? (
          <div
            onMouseEnter={() => hoverOpen(openPanel.key)}
            onMouseLeave={hoverClose}
            className="border-ink-200 bg-paper absolute inset-x-0 top-full hidden border-b border-t shadow-lg lg:block"
          >
            <div className="container-bambino grid grid-cols-[1fr_16rem] gap-8 py-6">
              <ul className="grid grid-cols-4 gap-x-6 gap-y-0.5">
                {openPanel.categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={category.href}
                      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-ink-100"
                    >
                      <ProductArt
                        art={category.art}
                        seed={category.slug}
                        className="size-11 shrink-0 rounded-md"
                      />
                      <span>
                        <span className="text-ink-900 group-hover:text-brand-700 block text-[13px] font-medium">
                          {category.label}
                        </span>
                        <span className="text-ink-400 block text-[11px] tabular-nums">
                          {category.count}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-ink-200 border-s ps-8">
                <p className="text-ink-400 text-[10px] font-bold tracking-[0.14em] uppercase">
                  {strings.shopByAge}
                </p>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {ages.map((age) => (
                    <li key={age.key}>
                      <Link
                        href={age.href}
                        className="bg-ink-100 text-ink-700 hover:bg-brand-50 hover:text-brand-700 inline-flex rounded-md px-2.5 py-1.5 text-[11px] font-medium"
                      >
                        {age.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      {mobileOpen ? (
        <MobileMenu
          locale={locale}
          nav={nav}
          ages={ages}
          strings={strings}
          onClose={() => setMobileOpen(false)}
        />
      ) : null}
    </>
  );
}

function Count({ value, locale }: { value: number; locale: Locale }) {
  const formatted = new Intl.NumberFormat(
    locale === "ar" ? "ar-KW-u-nu-latn" : "en-KW",
  ).format(value);
  return (
    <span className="bg-sale absolute end-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-bold text-white tabular-nums">
      {formatted}
    </span>
  );
}

function MobileMenu({
  locale,
  nav,
  ages,
  strings,
  onClose,
}: {
  locale: Locale;
  nav: NavDepartment[];
  ages: AgeLink[];
  strings: HeaderStrings;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(nav[0]?.key ?? null);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label={strings.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="bg-paper absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col">
        <div className="border-ink-200 flex h-14 items-center justify-between border-b px-4">
          <span className="text-ink-900 text-sm font-bold">
            {strings.shopByAge.split(" ")[0]}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={strings.closeMenu}
            className="text-ink-700 hover:bg-ink-100 inline-flex size-9 items-center justify-center rounded-lg"
          >
            <CloseIcon className="size-5.5" />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto overscroll-contain"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) onClose();
          }}
        >
          {nav.map((department) => {
            const open = expanded === department.key;
            return (
              <div key={department.key} className="border-ink-100 border-b">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : department.key)}
                  aria-expanded={open}
                  className="text-ink-900 flex w-full items-center justify-between px-4 py-3 text-start text-sm font-semibold"
                >
                  {department.label}
                  <ChevronDownIcon
                    className={`text-ink-400 size-4 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open ? (
                  <ul className="bg-ink-50 pb-1">
                    {department.categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={category.href}
                          className="text-ink-600 flex items-center justify-between px-4 py-2.5 text-[13px]"
                        >
                          {category.label}
                          <span className="text-ink-400 text-[11px] tabular-nums">
                            {category.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}

          <div className="border-ink-100 border-b px-4 py-3">
            <Link
              href={routes.collection(locale, "sale")}
              className="text-sale block text-sm font-bold"
            >
              {strings.sale}
            </Link>
          </div>

          <div className="px-4 py-4">
            <p className="text-ink-400 text-[10px] font-bold tracking-[0.14em] uppercase">
              {strings.shopByAge}
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {ages.map((age) => (
                <li key={age.key}>
                  <Link
                    href={age.href}
                    className="bg-ink-100 text-ink-700 inline-flex rounded-md px-2.5 py-1.5 text-[11px] font-medium"
                  >
                    {age.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="border-ink-200 border-t p-3">
          <LocaleSwitcher locale={locale} label={strings.changeLanguage} />
        </div>
      </div>
    </div>
  );
}
