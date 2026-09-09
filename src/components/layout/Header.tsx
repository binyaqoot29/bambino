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
  UserIcon,
} from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";

export type HeaderStrings = {
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

/** A collection as the header needs it — the rule only decides styling. */
export type CollectionLink = {
  slug: string;
  label: string;
  rule: string | null;
};
import type { AgeLink, NavDepartment } from "@/lib/nav";
import { routes } from "@/lib/routes";

/**
 * A boutique header: the lockup at the start, a quiet search field in the
 * middle, and the utilities as plain glyphs at the end. Below it, the
 * departments as small capitals with a hairline under the open one. Nothing
 * here is coloured except the mark itself; the products carry the colour.
 */
export function Header({
  locale,
  nav,
  ages,
  collections,
  showLanguageSwitch,
  strings,
  announcements,
}: {
  locale: Locale;
  nav: NavDepartment[];
  ages: AgeLink[];
  collections: CollectionLink[];
  /** False when the shop is serving one language — the toggle has nowhere to go. */
  showLanguageSwitch: boolean;
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
    closeTimer.current = window.setTimeout(() => setOpenDepartment(null), 140);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(
      new FormData(event.currentTarget).get("q") ?? "",
    ).trim();
    if (query) router.push(routes.search(locale, query));
  }

  const openPanel = nav.find((d) => d.key === openDepartment);
  const iconButton =
    "text-ink-800 hover:bg-ink-100 relative inline-flex size-10 items-center justify-center rounded-full transition-colors duration-200";

  return (
    <>
      {/* Utility strip — one line of fact in small capitals. */}
      <div className="bg-brand-900 hidden text-[11px] tracking-[0.12em] text-white/85 uppercase md:block [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case">
        <div className="container-bambino flex h-9 items-center justify-center gap-6">
          {announcements.map((message, i) => (
            <span key={message} className="flex items-center gap-6">
              {i > 0 ? (
                <span
                  aria-hidden="true"
                  className="bg-white/30 size-1 rounded-full"
                />
              ) : null}
              {message}
            </span>
          ))}
        </div>
      </div>

      <header className="border-ink-200/70 bg-paper/92 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="container-bambino">
          <div className="flex h-16 items-center gap-3 lg:h-20 lg:gap-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={strings.openMenu}
              className={`${iconButton} -ms-2 shrink-0 lg:hidden`}
            >
              <MenuIcon className="size-6" />
            </button>

            <Link
              href={routes.home(locale)}
              aria-label="Bambino"
              className="flex shrink-0 items-center gap-2.5"
              dir="ltr"
            >
              <BambinoMark className="text-brand-500 h-9 w-auto lg:h-10" />
              <Wordmark className="text-brand-900 hidden h-4.5 w-auto sm:block lg:h-5" />
            </Link>

            {/* A quiet field, not a search bar. */}
            <form
              onSubmit={submitSearch}
              role="search"
              className="relative mx-auto hidden w-full max-w-md md:block"
            >
              <SearchIcon className="text-ink-400 pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                placeholder={strings.searchPlaceholder}
                aria-label={strings.search}
                className="bg-canvas placeholder:text-ink-400 focus:bg-paper focus:ring-brand-400 h-11 w-full rounded-full ps-11 pe-5 text-sm ring-1 ring-transparent transition-[background-color,box-shadow] duration-300 focus:ring-1 focus:outline-none"
              />
            </form>

            <div className="ms-auto flex items-center gap-0.5 md:ms-0">
              {showLanguageSwitch ? (
                <LocaleSwitcher
                  locale={locale}
                  label={strings.changeLanguage}
                  className="hidden rounded-full sm:inline-flex"
                />
              ) : null}
              <Link
                href={routes.wishlist(locale)}
                aria-label={strings.wishlist}
                className={`${iconButton} hidden sm:inline-flex`}
              >
                <HeartIcon className="size-5.5" />
                {ready && wishlist.length > 0 ? (
                  <Count value={wishlist.length} locale={locale} />
                ) : null}
              </Link>
              <Link
                href={routes.account(locale)}
                aria-label={strings.account}
                className={`${iconButton} hidden lg:inline-flex`}
              >
                <UserIcon className="size-5.5" />
              </Link>
              <Link
                href={routes.cart(locale)}
                aria-label={strings.cart}
                className={iconButton}
              >
                <BagIcon className="size-5.5" />
                {ready && count > 0 ? (
                  <Count value={count} locale={locale} />
                ) : null}
              </Link>
            </div>
          </div>

          {/* mobile search */}
          <form
            onSubmit={submitSearch}
            role="search"
            className="pb-3 md:hidden"
          >
            <div className="relative">
              <SearchIcon className="text-ink-400 pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                placeholder={strings.searchPlaceholder}
                aria-label={strings.search}
                className="bg-canvas placeholder:text-ink-400 focus:ring-brand-400 h-11 w-full rounded-full ps-11 pe-4 text-sm ring-1 ring-transparent focus:ring-1 focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Department bar */}
        <nav
          className="border-ink-200/70 hidden border-t lg:block"
          onMouseLeave={hoverClose}
          onClick={() => setOpenDepartment(null)}
        >
          <div className="container-bambino flex items-center justify-center gap-1">
            {nav.map((department) => (
              <Link
                key={department.key}
                href={department.href}
                onMouseEnter={() => hoverOpen(department.key)}
                onFocus={() => hoverOpen(department.key)}
                className={`relative inline-flex h-12 items-center gap-1.5 px-4 text-[12px] font-medium tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-200 [html[lang=ar]_&]:text-[13px] [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case after:absolute after:inset-x-4 after:bottom-0 after:h-px after:origin-start after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-[var(--ease-out-quint)] ${
                  openDepartment === department.key
                    ? "text-ink-900 after:scale-x-100"
                    : "text-ink-600 hover:text-ink-900 hover:after:scale-x-100"
                }`}
              >
                {department.label}
                <ChevronDownIcon className="size-3 opacity-40" />
              </Link>
            ))}
            {collections.length ? (
              <span aria-hidden="true" className="bg-ink-200 mx-3 h-4 w-px" />
            ) : null}
            {collections.map((collection) => (
              <Link
                key={collection.slug}
                href={routes.collection(locale, collection.slug)}
                className={`relative inline-flex h-12 items-center px-4 text-[12px] font-medium tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-200 [html[lang=ar]_&]:text-[13px] [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case after:absolute after:inset-x-4 after:bottom-0 after:h-px after:origin-start after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                  collection.rule === "sale"
                    ? "text-sale hover:text-sale"
                    : "text-ink-600 hover:text-ink-900"
                }`}
              >
                {collection.label}
              </Link>
            ))}
          </div>
        </nav>

        {openPanel ? (
          <div
            onMouseEnter={() => hoverOpen(openPanel.key)}
            onMouseLeave={hoverClose}
            className="border-ink-200/70 bg-paper animate-fade-up absolute inset-x-0 top-full hidden border-b shadow-[var(--shadow-lift)] lg:block"
          >
            <div className="container-bambino grid grid-cols-[1fr_18rem] gap-12 py-10">
              <ul className="grid grid-cols-4 gap-x-8 gap-y-2">
                {openPanel.categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={category.href}
                      className="group flex items-center gap-4 rounded-2xl p-2 transition-colors duration-200 hover:bg-canvas"
                    >
                      <ProductArt
                        art={category.art}
                        seed={category.slug}
                        className="size-14 shrink-0 rounded-full"
                      />
                      <span>
                        <span className="text-ink-900 block text-sm">
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
              <div className="border-ink-200/70 border-s ps-10">
                <p className="eyebrow">{strings.shopByAge}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {ages.map((age) => (
                    <li key={age.key}>
                      <Link
                        href={age.href}
                        className="ring-ink-200 text-ink-700 hover:bg-brand-900 hover:text-white hover:ring-brand-900 inline-flex rounded-full px-3.5 py-2 text-[12px] font-medium ring-1 transition-colors duration-200"
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
          collections={collections}
          showLanguageSwitch={showLanguageSwitch}
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
    <span className="bg-brand-900 absolute end-0.5 top-0.5 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold text-white tabular-nums">
      {formatted}
    </span>
  );
}

function MobileMenu({
  locale,
  nav,
  ages,
  collections,
  showLanguageSwitch,
  strings,
  onClose,
}: {
  locale: Locale;
  nav: NavDepartment[];
  ages: AgeLink[];
  collections: CollectionLink[];
  showLanguageSwitch: boolean;
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
        className="bg-brand-950/40 absolute inset-0 backdrop-blur-[2px]"
      />
      <div className="bg-paper animate-float-in absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col shadow-[var(--shadow-lift)]">
        <div className="border-ink-200/70 flex h-16 items-center justify-between border-b px-5">
          <span dir="ltr" className="flex items-center gap-2">
            <BambinoMark className="text-brand-500 h-7 w-auto" />
            <Wordmark className="text-brand-900 h-3.5 w-auto" />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={strings.closeMenu}
            className="text-ink-700 hover:bg-ink-100 inline-flex size-10 items-center justify-center rounded-full"
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
                  className="text-ink-900 flex w-full items-center justify-between px-5 py-4 text-start text-[13px] font-medium tracking-[0.12em] uppercase [html[lang=ar]_&]:text-base [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case"
                >
                  {department.label}
                  <ChevronDownIcon
                    className={`text-ink-400 size-4 transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open ? (
                  <ul className="bg-canvas pb-2">
                    {department.categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={category.href}
                          className="text-ink-700 flex items-center justify-between px-5 py-3 text-sm"
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

          {collections.length ? (
            <div className="border-ink-100 space-y-3 border-b px-5 py-4">
              {collections.map((collection) => (
                <Link
                  key={collection.slug}
                  href={routes.collection(locale, collection.slug)}
                  className={`block text-[13px] font-medium tracking-[0.12em] uppercase [html[lang=ar]_&]:text-base [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case ${
                    collection.rule === "sale" ? "text-sale" : "text-ink-900"
                  }`}
                >
                  {collection.label}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="px-5 py-5">
            <p className="eyebrow">{strings.shopByAge}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {ages.map((age) => (
                <li key={age.key}>
                  <Link
                    href={age.href}
                    className="ring-ink-200 text-ink-700 inline-flex rounded-full px-3.5 py-2 text-[12px] font-medium ring-1"
                  >
                    {age.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="border-ink-200/70 flex items-center justify-between border-t p-4">
          <div className="flex items-center gap-5">
            <Link
              href={routes.account(locale)}
              className="text-ink-700 inline-flex items-center gap-2 text-sm"
            >
              <UserIcon className="size-5" />
              {strings.account}
            </Link>
            <Link
              href={routes.wishlist(locale)}
              className="text-ink-700 inline-flex items-center gap-2 text-sm"
            >
              <HeartIcon className="size-5" />
              {strings.wishlist}
            </Link>
          </div>
          {showLanguageSwitch ? (
            <LocaleSwitcher locale={locale} label={strings.changeLanguage} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
