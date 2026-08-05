import Link from "next/link";

import { DoodleField } from "@/components/brand/Doodles";
import { Logo } from "@/components/brand/Logo";
import {
  InstagramIcon,
  TiktokIcon,
  WhatsappIcon,
} from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { NavDepartment } from "@/lib/nav";
import { routes } from "@/lib/routes";
import { Newsletter } from "./Newsletter";

const PAYMENTS = ["KNET", "Visa", "Mastercard", "Apple Pay", "COD"];

export function Footer({
  locale,
  dict,
  nav,
}: {
  locale: Locale;
  dict: Dictionary;
  nav: NavDepartment[];
}) {
  const links = dict.footer.links;

  return (
    <footer className="bg-brand-900 relative mt-24 overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="text-mint-300/12 pointer-events-none absolute inset-0"
      >
        <DoodleField id="footer-doodles" />
      </div>

      <div className="relative">
        <Newsletter locale={locale} dict={dict} />

        <div className="container-bambino grid gap-12 pt-16 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="text-mint-200/80 mt-5 max-w-xs text-sm leading-relaxed">
              {dict.footer.aboutBody}
            </p>
            <ul className="mt-6 flex gap-2">
              {[
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: TiktokIcon, label: "TikTok" },
                { Icon: WhatsappIcon, label: "WhatsApp" },
              ].map(({ Icon, label }) => (
                <li key={label}>
                  <span
                    role="link"
                    aria-label={label}
                    className="ring-mint-300/25 text-mint-200 hover:bg-mint-300/10 inline-flex size-10 cursor-pointer items-center justify-center rounded-full ring-1 transition-colors"
                  >
                    <Icon className="size-5" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title={dict.footer.shopTitle}>
            {nav.map((department) => (
              <FooterLink key={department.key} href={department.href}>
                {department.label}
              </FooterLink>
            ))}
            <FooterLink href={routes.collection(locale, "new-in")}>
              {dict.nav.newIn}
            </FooterLink>
            <FooterLink href={routes.collection(locale, "sale")}>
              {dict.nav.sale}
            </FooterLink>
          </FooterColumn>

          <FooterColumn title={dict.footer.helpTitle}>
            <FooterLink href={routes.about(locale)}>{links.contact}</FooterLink>
            <FooterLink href={routes.about(locale)}>{links.delivery}</FooterLink>
            <FooterLink href={routes.about(locale)}>{links.returns}</FooterLink>
            <FooterLink href={routes.about(locale)}>{links.sizeGuide}</FooterLink>
            <FooterLink href={routes.about(locale)}>{links.faq}</FooterLink>
          </FooterColumn>

          <FooterColumn title={dict.footer.aboutUsTitle}>
            <FooterLink href={routes.about(locale)}>{links.story}</FooterLink>
            <FooterLink href={routes.about(locale)}>{links.stores}</FooterLink>
            <FooterLink href={routes.about(locale)}>
              {links.sustainability}
            </FooterLink>
            <FooterLink href={routes.about(locale)}>{links.careers}</FooterLink>
            <FooterLink href={routes.about(locale)}>
              {links.giftCards}
            </FooterLink>
          </FooterColumn>
        </div>

        <div className="border-mint-300/15 container-bambino flex flex-col gap-6 border-t py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-mint-200/60 me-1 text-xs">
              {dict.footer.paymentsTitle}
            </span>
            {PAYMENTS.map((method) => (
              <span
                key={method}
                className="ring-mint-300/20 text-mint-200/90 rounded-md px-2 py-1 text-[11px] ring-1"
              >
                {method}
              </span>
            ))}
          </div>
          <div className="text-mint-200/60 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
            <Link href={routes.about(locale)} className="hover:text-white">
              {links.privacy}
            </Link>
            <Link href={routes.about(locale)} className="hover:text-white">
              {links.terms}
            </Link>
            <span>{dict.footer.rights}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-mint-300 text-[11px] font-semibold tracking-[0.16em] uppercase">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-mint-200/80 text-sm transition-colors hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}
