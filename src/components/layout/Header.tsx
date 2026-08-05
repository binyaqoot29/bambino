"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { useBag } from "@/components/cart/store";
import {
  BagIcon,
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/Icons";
import { LocaleSwitcher } from "./LocaleSwitcher";
import type { Locale } from "@/i18n/config";
import type { AgeLink, NavDepartment } from "@/lib/nav";
import { routes } from "@/lib/routes";

type HeaderStrings = {
  newIn: string;
  sale: string;
  searchPlaceholder: string;
  search: string;
  account: string;
  wishlist: string;
  cart: string;
  changeLanguage: string;
  openMenu: string;
  closeMenu: string;
  shopByAge: string;
  close: string;
};

export function Header({
  locale,
  nav,
  ages,
  strings,
}: {
  locale: Locale;
  nav: NavDepartment[];
  ages: AgeLink[];
  strings: HeaderStrings;
}) {
  const router = useRouter();
  const { count, wishlist, ready } = useBag();

  const [openDepartment, setOpenDepartment] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  /**
   * Overlays close on navigation. Handled by delegation on the overlay
   * containers rather than an effect on `usePathname()` — a click on any link
   * inside is the navigation, and this avoids a setState cascade on every
   * route change for a header that is on every page.
   */
  function closeAll() {
    setOpenDepartment(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }

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
      setSearchOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The nav row itself: a click on a department link navigates, so close up.
  function onNavClick() {
    setOpenDepartment(null);
  }

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
    const data = new FormData(event.currentTarget);
    const query = String(data.get("q") ?? "").trim();
    if (query) router.push(routes.search(locale, query));
  }

  const openPanel = nav.find((d) => d.key === openDepartment);

  return (
    <header className="border-ink-200/70 bg-paper/95 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container-bambino">
        <div className="flex h-16 items-center gap-3 lg:h-[4.5rem] lg:gap-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={strings.openMenu}
            aria-expanded={mobileOpen}
            className="text-ink-700 hover:bg-ink-100 -ms-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full lg:hidden"
          >
            <MenuIcon className="size-6" />
          </button>

          <Link
            href={routes.home(locale)}
            className="shrink-0"
            aria-label="Bambino"
          >
            <Logo />
          </Link>

          <div className="ms-auto flex items-center gap-0.5">
            {/* desktop search */}
            <form
              onSubmit={submitSearch}
              role="search"
              className="relative hidden lg:block"
            >
              <SearchIcon className="text-ink-400 pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                placeholder={strings.searchPlaceholder}
                aria-label={strings.search}
                className="bg-canvas placeholder:text-ink-400 focus:bg-paper focus:ring-brand-300 h-10 w-56 rounded-full ps-10 pe-4 text-sm ring-1 ring-transparent transition-all focus:w-72 focus:outline-none xl:w-72 xl:focus:w-80"
              />
            </form>

            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={strings.search}
              aria-expanded={searchOpen}
              className="text-ink-700 hover:bg-ink-100 inline-flex size-11 items-center justify-center rounded-full lg:hidden"
            >
              <SearchIcon className="size-5.5" />
            </button>

            <LocaleSwitcher
              locale={locale}
              label={strings.changeLanguage}
              className="hidden sm:inline-flex"
            />

            <Link
              href={routes.wishlist(locale)}
              aria-label={strings.wishlist}
              className="text-ink-700 hover:bg-ink-100 relative hidden size-11 items-center justify-center rounded-full sm:inline-flex"
            >
              <HeartIcon className="size-5.5" />
              {ready && wishlist.length > 0 ? (
                <CountDot value={wishlist.length} locale={locale} />
              ) : null}
            </Link>

            <button
              type="button"
              aria-label={strings.account}
              className="text-ink-700 hover:bg-ink-100 hidden size-11 items-center justify-center rounded-full lg:inline-flex"
            >
              <UserIcon className="size-5.5" />
            </button>

            <Link
              href={routes.cart(locale)}
              aria-label={strings.cart}
              className="text-ink-700 hover:bg-ink-100 relative inline-flex size-11 items-center justify-center rounded-full"
            >
              <BagIcon className="size-5.5" />
              {ready && count > 0 ? (
                <CountDot value={count} locale={locale} />
              ) : null}
            </Link>
          </div>
        </div>

        {/* department nav, second row so labels never wrap */}
        <nav
          className="-mx-2 hidden justify-center lg:flex"
          onMouseLeave={hoverClose}
          onClick={onNavClick}
        >
          {nav.map((department) => (
            <Link
              key={department.key}
              href={department.href}
              onMouseEnter={() => hoverOpen(department.key)}
              onFocus={() => hoverOpen(department.key)}
              aria-expanded={openDepartment === department.key}
              className={`inline-flex h-12 items-center gap-1 whitespace-nowrap border-b-2 px-4 text-sm font-medium transition-colors ${
                openDepartment === department.key
                  ? "border-brand-500 text-brand-700"
                  : "text-ink-700 hover:text-brand-600 border-transparent"
              }`}
            >
              {department.label}
              <ChevronDownIcon
                className={`size-3.5 opacity-60 transition-transform duration-200 ${
                  openDepartment === department.key ? "rotate-180" : ""
                }`}
              />
            </Link>
          ))}
          <Link
            href={routes.collection(locale, "new-in")}
            onMouseEnter={hoverClose}
            className="text-ink-700 hover:text-brand-600 inline-flex h-12 items-center border-b-2 border-transparent px-4 text-sm font-medium whitespace-nowrap"
          >
            {strings.newIn}
          </Link>
          <Link
            href={routes.collection(locale, "sale")}
            onMouseEnter={hoverClose}
            className="text-sale hover:text-sale/75 inline-flex h-12 items-center border-b-2 border-transparent px-4 text-sm font-medium whitespace-nowrap"
          >
            {strings.sale}
          </Link>
        </nav>

        {/* mobile search drawer */}
        {searchOpen ? (
          <form
            onSubmit={submitSearch}
            role="search"
            className="pb-3 lg:hidden"
          >
            <div className="relative">
              <SearchIcon className="text-ink-400 pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2" />
              <input
                autoFocus
                type="search"
                name="q"
                placeholder={strings.searchPlaceholder}
                aria-label={strings.search}
                className="bg-canvas placeholder:text-ink-400 focus:ring-brand-300 h-12 w-full rounded-full ps-12 pe-4 text-sm ring-1 ring-transparent focus:outline-none"
              />
            </div>
          </form>
        ) : null}
      </div>

      {/* mega menu */}
      {openPanel ? (
        <div
          onMouseEnter={() => hoverOpen(openPanel.key)}
          onMouseLeave={hoverClose}
          onClick={onNavClick}
          className="border-ink-200/70 bg-paper absolute inset-x-0 top-full hidden border-b shadow-[0_20px_40px_-24px_rgb(102_31_71_/_0.28)] lg:block"
        >
          <div className="container-bambino grid grid-cols-[1fr_auto] gap-10 py-8">
            <ul className="grid grid-cols-3 gap-x-8 gap-y-1">
              {openPanel.categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={category.href}
                    className="group hover:bg-brand-50 block rounded-2xl p-3 transition-colors"
                  >
                    <span className="text-ink-900 group-hover:text-brand-700 block text-sm font-medium">
                      {category.label}
                    </span>
                    {category.blurb ? (
                      <span className="text-ink-500 mt-0.5 block text-xs">
                        {category.blurb}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-ink-200 w-64 border-s ps-8">
              <p className="text-ink-400 text-[11px] font-medium tracking-[0.14em] uppercase">
                {strings.shopByAge}
              </p>
              <ul className="mt-3 space-y-1">
                {ages.map((age) => (
                  <li key={age.key}>
                    <Link
                      href={age.href}
                      className="text-ink-600 hover:text-brand-600 block py-1 text-sm"
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

      {/* mobile drawer */}
      {mobileOpen ? (
        <MobileNav
          locale={locale}
          nav={nav}
          ages={ages}
          strings={strings}
          onClose={closeAll}
        />
      ) : null}
    </header>
  );
}

function CountDot({ value, locale }: { value: number; locale: Locale }) {
  const formatted = new Intl.NumberFormat(
    locale === "ar" ? "ar-KW-u-nu-latn" : "en-KW",
  ).format(value);
  return (
    <span className="bg-brand-500 absolute end-1.5 top-1.5 inline-flex min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] leading-4.5 font-semibold text-white tabular-nums">
      {formatted}
    </span>
  );
}

function MobileNav({
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
        className="bg-brand-950/35 absolute inset-0 backdrop-blur-[2px]"
      />
      <div className="bg-paper absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col shadow-2xl">
        <div className="border-ink-200 flex h-16 items-center justify-between border-b px-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label={strings.closeMenu}
            className="text-ink-700 hover:bg-ink-100 inline-flex size-11 items-center justify-center rounded-full"
          >
            <CloseIcon className="size-6" />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto overscroll-contain px-2 py-3"
          // Any link tapped in here is a navigation — shut the drawer.
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
                  className="text-ink-900 flex w-full items-center justify-between px-3 py-3.5 text-start text-[15px] font-medium"
                >
                  {department.label}
                  <ChevronDownIcon
                    className={`text-ink-400 size-4.5 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open ? (
                  <ul className="pb-2">
                    {department.categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={category.href}
                          className="text-ink-600 hover:text-brand-600 block rounded-xl px-3 py-2.5 text-sm"
                        >
                          {category.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href={department.href}
                        className="text-brand-600 block rounded-xl px-3 py-2.5 text-sm font-medium"
                      >
                        {department.label} →
                      </Link>
                    </li>
                  </ul>
                ) : null}
              </div>
            );
          })}

          <div className="mt-2 space-y-1 px-3 py-2">
            <Link
              href={routes.collection(locale, "new-in")}
              className="text-ink-900 block py-2.5 text-[15px] font-medium"
            >
              {strings.newIn}
            </Link>
            <Link
              href={routes.collection(locale, "sale")}
              className="text-sale block py-2.5 text-[15px] font-medium"
            >
              {strings.sale}
            </Link>
            <Link
              href={routes.wishlist(locale)}
              className="text-ink-900 block py-2.5 text-[15px] font-medium"
            >
              {strings.wishlist}
            </Link>
          </div>

          <div className="border-ink-100 mt-2 border-t px-3 pt-4 pb-6">
            <p className="text-ink-400 text-[11px] font-medium tracking-[0.14em] uppercase">
              {strings.shopByAge}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {ages.map((age) => (
                <li key={age.key}>
                  <Link
                    href={age.href}
                    className="bg-mint-100 text-mint-800 inline-flex rounded-full px-3 py-1.5 text-xs font-medium"
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
