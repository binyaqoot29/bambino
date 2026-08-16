import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { Newsletter } from "@/components/layout/Newsletter";
import {
  CardIcon,
  InstagramIcon,
  ReturnIcon,
  ShieldIcon,
  TiktokIcon,
  TruckIcon,
  WhatsappIcon,
} from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { NavDepartment } from "@/lib/nav";
import { routes } from "@/lib/routes";
import { loadSettings } from "@/lib/site-settings";

const PAYMENTS = ["KNET", "Visa", "Mastercard", "Apple Pay", "COD"];

/**
 * Market footer — a service band of guarantees first, then dense link columns
 * on white. Studio's footer is a plum showpiece; this one is a utility.
 */
export async function MarketFooter({
  locale,
  dict,
  nav,
}: {
  locale: Locale;
  dict: Dictionary;
  nav: NavDepartment[];
}) {
  const links = dict.footer.links;
  const { social } = await loadSettings();
  const socials = [
    { href: social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: social.tiktok, Icon: TiktokIcon, label: "TikTok" },
    { href: social.whatsapp, Icon: WhatsappIcon, label: "WhatsApp" },
  ].filter((s) => s.href);
  const guarantees = [
    { Icon: TruckIcon, item: dict.home.usp.delivery },
    { Icon: ReturnIcon, item: dict.home.usp.returns },
    { Icon: CardIcon, item: dict.home.usp.payment },
    { Icon: ShieldIcon, item: dict.home.usp.safety },
  ];

  return (
    <footer className="mt-14">
      {/* service guarantees */}
      <div className="border-ink-200 border-y bg-white">
        <ul className="container-bambino grid gap-px py-0 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map(({ Icon, item }) => (
            <li
              key={item.title}
              className="flex items-start gap-3 py-5 lg:px-5"
            >
              <Icon className="text-brand-500 mt-0.5 size-6 shrink-0" />
              <div>
                <p className="text-ink-900 text-[13px] font-semibold">
                  {item.title}
                </p>
                <p className="text-ink-500 mt-0.5 text-xs">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-brand-900 text-white">
        <Newsletter locale={locale} dict={dict} />
      </div>

      <div className="bg-ink-50">
        <div className="container-bambino grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <span className="flex items-center gap-2" dir="ltr">
              <BambinoMark className="text-brand-500 h-8 w-auto" />
              <Wordmark className="text-brand-500 h-4.5 w-auto" />
            </span>
            <p className="text-ink-500 mt-4 max-w-xs text-xs leading-relaxed">
              {dict.footer.aboutBody}
            </p>
            {socials.length ? (
              <ul className="mt-5 flex gap-2">
                {socials.map(({ href, Icon, label }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={label}
                      className="ring-ink-300 text-ink-600 hover:border-brand-500 hover:text-brand-600 inline-flex size-9 items-center justify-center rounded-lg ring-1"
                    >
                      <Icon className="size-4.5" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Column title={dict.footer.shopTitle}>
            {nav.map((d) => (
              <Row key={d.key} href={d.href}>
                {d.label}
              </Row>
            ))}
            <Row href={routes.collection(locale, "sale")}>{dict.nav.sale}</Row>
          </Column>

          <Column title={dict.footer.helpTitle}>
            <Row href={routes.about(locale)}>{links.contact}</Row>
            <Row href={routes.about(locale)}>{links.delivery}</Row>
            <Row href={routes.about(locale)}>{links.returns}</Row>
            <Row href={routes.about(locale)}>{links.sizeGuide}</Row>
            <Row href={routes.about(locale)}>{links.faq}</Row>
          </Column>

          <Column title={dict.footer.aboutUsTitle}>
            <Row href={routes.about(locale)}>{links.story}</Row>
            <Row href={routes.about(locale)}>{links.stores}</Row>
            <Row href={routes.about(locale)}>{links.careers}</Row>
            <Row href={routes.about(locale)}>{links.giftCards}</Row>
          </Column>
        </div>

        <div className="border-ink-200 border-t">
          <div className="container-bambino flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {PAYMENTS.map((method) => (
                <span
                  key={method}
                  className="ring-ink-300 text-ink-600 rounded bg-white px-2 py-1 text-[10px] font-medium ring-1"
                >
                  {method}
                </span>
              ))}
            </div>
            <div className="text-ink-500 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
              <Link href={routes.about(locale)} className="hover:text-brand-600">
                {links.privacy}
              </Link>
              <Link href={routes.about(locale)} className="hover:text-brand-600">
                {links.terms}
              </Link>
              <span>{dict.footer.rights}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Column({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-ink-900 text-[11px] font-bold tracking-[0.12em] uppercase">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function Row({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-ink-600 hover:text-brand-600 text-[13px] transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
