import { MarketFooter } from "./market/MarketFooter";
import { MarketHeader } from "./market/MarketHeader";
import { MarketHome } from "./market/MarketHome";
import { MarketListing } from "./market/MarketListing";
import { MarketProduct } from "./market/MarketProduct";
import { StudioFooter } from "./studio/StudioFooter";
import { StudioHeader } from "./studio/StudioHeader";
import { StudioHome } from "./studio/StudioHome";
import { StudioListing } from "./studio/StudioListing";
import { StudioProduct } from "./studio/StudioProduct";
import { getDesign } from "./server";
import type { HomeProps, ListingProps, ProductViewProps } from "./types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { AgeLink, NavDepartment } from "@/lib/nav";

/**
 * Design dispatchers. Route files render these and stay ignorant of which
 * direction is active; each one resolves the cookie and picks an
 * implementation.
 */

export async function Home(props: HomeProps) {
  const design = await getDesign();
  return design === "market" ? <MarketHome {...props} /> : <StudioHome {...props} />;
}

export async function Listing(props: ListingProps) {
  const design = await getDesign();
  return design === "market" ? (
    <MarketListing {...props} />
  ) : (
    <StudioListing {...props} />
  );
}

export async function ProductView(props: ProductViewProps) {
  const design = await getDesign();
  return design === "market" ? (
    <MarketProduct {...props} />
  ) : (
    <StudioProduct {...props} />
  );
}

export type ShellProps = {
  locale: Locale;
  dict: Dictionary;
  nav: NavDepartment[];
  ages: AgeLink[];
};

export async function SiteHeader({ locale, dict, nav, ages }: ShellProps) {
  const design = await getDesign();
  const strings = {
    newIn: dict.nav.newIn,
    sale: dict.nav.sale,
    searchPlaceholder: dict.nav.searchPlaceholder,
    search: dict.common.search,
    account: dict.nav.account,
    wishlist: dict.nav.wishlist,
    cart: dict.nav.cart,
    changeLanguage: dict.nav.changeLanguage,
    openMenu: dict.nav.openMenu,
    closeMenu: dict.nav.closeMenu,
    shopByAge: dict.nav.shopByAge,
    close: dict.common.close,
  };

  const announcements = [
    dict.announce.shipping,
    dict.announce.returns,
    dict.announce.cod,
  ];

  const shared = { locale, nav, ages, strings, announcements };

  return design === "market" ? (
    <MarketHeader {...shared} />
  ) : (
    <StudioHeader {...shared} />
  );
}

export async function SiteFooter({
  locale,
  dict,
  nav,
}: Omit<ShellProps, "ages">) {
  const design = await getDesign();
  return design === "market" ? (
    <MarketFooter locale={locale} dict={dict} nav={nav} />
  ) : (
    <StudioFooter locale={locale} dict={dict} nav={nav} />
  );
}
