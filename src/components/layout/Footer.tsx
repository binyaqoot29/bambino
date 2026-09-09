import Link from "next/link";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { Newsletter } from "@/components/layout/Newsletter";
import {
  CardIcon,
  InstagramIcon,
  MailIcon,
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
import { deliveryCopy } from "@/lib/delivery-copy";
import { loadSettings } from "@/lib/site-settings";

const PAYMENTS = ["KNET", "Visa", "Mastercard", "Apple Pay", "COD"];

/**
 * Four promises on cream, the newsletter on plum, then the link columns with
 * the lockup and a line of the brand's own words. Hairlines, not boxes.
 */
export async function Footer({
  locale,
  dict,
  nav,
}: {
  locale: Locale;
  dict: Dictionary;
  nav: NavDepartment[];
}) {
  const links = dict.footer.links;
  const { social, shipping } = await loadSettings();
  const delivery = deliveryCopy(shipping, dict, locale);
  const socials = [
    { href: social.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: social.tiktok, Icon: TiktokIcon, label: "TikTok" },
    { href: social.whatsapp, Icon: WhatsappIcon, label: "WhatsApp" },
    social.email
      ? { href: `mailto:${social.email}`, Icon: MailIcon, label: social.email }
      : { href: "", Icon: MailIcon, label: "" },
  ].filter((s) => s.href);
  const guarantees = [
    {
      Icon: TruckIcon,
      // The delivery promise is editable, so it's composed rather than read
      // straight from the dictionary like the other three.
      item: { ...dict.home.usp.delivery, body: delivery.uspBody },
    },
    { Icon: ReturnIcon, item: dict.home.usp.returns },
    { Icon: CardIcon, item: dict.home.usp.payment },
    { Icon: ShieldIcon, item: dict.home.usp.safety },
  ];

  return (
    <footer className="mt-24">
      {/* service promises */}
      <div className="border-ink-200/70 bg-canvas border-t">
        <ul className="container-bambino grid gap-x-8 gap-y-8 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-14">
          {guarantees.map(({ Icon, item }) => (
            <li key={item.title} className="flex items-start gap-4">
              <span className="ring-ink-200 text-brand-700 inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white ring-1">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-ink-900 text-sm font-medium">{item.title}</p>
                <p className="text-ink-500 mt-1 text-[13px] leading-relaxed">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-brand-900 text-white">
        <Newsletter locale={locale} dict={dict} />
      </div>

      <div className="bg-paper">
        <div className="container-bambino grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-8 lg:py-20">
          <div>
            <span className="flex items-center gap-2.5" dir="ltr">
              <BambinoMark className="text-brand-500 h-9 w-auto" />
              <Wordmark className="text-brand-900 h-4.5 w-auto" />
            </span>
            <p className="font-display text-ink-700 mt-6 max-w-xs text-lg leading-snug">
              {dict.brand.tagline}
            </p>
            <p className="text-ink-500 mt-3 max-w-xs text-[13px] leading-relaxed">
              {dict.footer.aboutBody}
            </p>
            {socials.length ? (
              <ul className="mt-6 flex gap-2">
                {socials.map(({ href, Icon, label }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={label}
                      className="ring-ink-200 text-ink-600 hover:bg-brand-900 hover:text-white hover:ring-brand-900 inline-flex size-10 items-center justify-center rounded-full ring-1 transition-colors duration-200"
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
            <Row href={routes.help(locale, "contact")}>{links.contact}</Row>
            <Row href={routes.help(locale, "delivery")}>{links.delivery}</Row>
            <Row href={routes.help(locale, "returns")}>{links.returns}</Row>
            <Row href={routes.help(locale, "size-guide")}>
              {links.sizeGuide}
            </Row>
            <Row href={routes.help(locale, "faq")}>{links.faq}</Row>
          </Column>

          <Column title={dict.footer.aboutUsTitle}>
            <Row href={routes.about(locale)}>{links.story}</Row>
            <Row href={routes.about(locale)}>{links.giftCards}</Row>
          </Column>
        </div>

        <div className="border-ink-200/70 border-t">
          <div className="container-bambino flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <ul className="text-ink-500 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] tracking-[0.08em] uppercase [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case">
              {PAYMENTS.map((method) => (
                <li key={method}>{method}</li>
              ))}
            </ul>
            <div className="text-ink-500 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px]">
              <Link
                href={routes.about(locale)}
                className="link-draw hover:text-ink-900"
              >
                {links.privacy}
              </Link>
              <Link
                href={routes.about(locale)}
                className="link-draw hover:text-ink-900"
              >
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
      <h2 className="eyebrow text-ink-900">{title}</h2>
      <ul className="mt-5 space-y-2.5">{children}</ul>
    </div>
  );
}

function Row({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="link-draw text-ink-600 hover:text-ink-900 text-[14px] transition-colors duration-200"
      >
        {children}
      </Link>
    </li>
  );
}
