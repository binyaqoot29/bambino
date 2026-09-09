import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import {
  CardIcon,
  InstagramIcon,
  ReturnIcon,
  ShieldIcon,
  TruckIcon,
  WhatsappIcon,
} from "@/components/ui/Icons";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { createTranslator } from "@/i18n/t";
import { languageAlternates } from "@/lib/alternates";
import { formatPrice } from "@/lib/money";
import { HELP_TOPICS, isHelpTopic, routes, type HelpTopic } from "@/lib/routes";
import { SIZE_LABELS } from "@/lib/catalog/taxonomy";
import { loadSettings } from "@/lib/site-settings";

/**
 * Five help pages that share one frame: a quiet hero, a topic rail, and a
 * content column of short sections in the storefront's own voice. Every
 * number in the copy — the free-delivery threshold, the rate, the returns
 * window, the delivery promise — comes from the settings the shop owner
 * edits, so these pages can never contradict the checkout.
 */

const ICONS: Record<HelpTopic, typeof TruckIcon> = {
  contact: WhatsappIcon,
  delivery: TruckIcon,
  returns: ReturnIcon,
  "size-guide": ShieldIcon,
  faq: CardIcon,
};

const BABY = [
  { size: "newborn", height: "≤ 50", weight: "≤ 3.5" },
  { size: "0-3m", height: "50–62", weight: "3.5–6" },
  { size: "3-6m", height: "62–68", weight: "6–8" },
  { size: "6-9m", height: "68–74", weight: "8–9" },
  { size: "9-12m", height: "74–80", weight: "9–10.5" },
  { size: "12-18m", height: "80–86", weight: "10.5–12" },
  { size: "18-24m", height: "86–92", weight: "12–13.5" },
];
const KIDS = [
  { size: "2-3y", height: "92–98" },
  { size: "3-4y", height: "98–104" },
  { size: "4-5y", height: "104–110" },
  { size: "5-6y", height: "110–116" },
];
const SHOES = [
  { eu: "17", foot: "10.3" },
  { eu: "18", foot: "11.0" },
  { eu: "19", foot: "11.7" },
  { eu: "20", foot: "12.3" },
  { eu: "21", foot: "13.0" },
  { eu: "22", foot: "13.7" },
];

export function generateStaticParams() {
  return HELP_TOPICS.map((topic) => ({ topic }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; topic: string }>;
}): Promise<Metadata> {
  const { lang, topic } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  if (!isHelpTopic(topic)) return {};
  const dict = getDictionary(locale);
  const page = dict.help.topics[topic];
  return {
    title: page.title,
    description: page.lede,
    alternates: {
      canonical: routes.help(locale, topic),
      languages: await languageAlternates((l) => routes.help(l, topic)),
    },
  };
}

export default async function HelpPage({
  params,
}: PageProps<"/[lang]/help/[topic]">) {
  const { lang, topic } = await params;
  if (!isLocale(lang) || !isHelpTopic(topic)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const { t } = createTranslator(locale);
  const { shipping, social } = await loadSettings();
  const help = dict.help;
  const page = help.topics[topic];

  // The numbers every topic may mention, filled in once.
  const vars = {
    window: shipping.deliveryWindow[locale],
    free: formatPrice(shipping.freeThreshold, locale),
    rate: formatPrice(shipping.flatRate, locale),
    days: shipping.returnsDays,
    fee: formatPrice(shipping.codFee, locale),
  };
  const fill = (s: string) => t(s, vars);
  const lede = fill(page.lede);

  return (
    <>
      <section className="bg-canvas">
        <div className="container-bambino py-14 lg:py-20">
          <p className="eyebrow">{help.title}</p>
          <h1 className="font-display text-ink-900 mt-4 max-w-2xl text-5xl leading-[1.05] sm:text-6xl">
            {page.title}
          </h1>
          <p className="text-ink-600 mt-5 max-w-xl text-[17px] leading-relaxed">
            {lede}
          </p>
        </div>
      </section>

      <div className="container-bambino grid gap-12 py-12 lg:grid-cols-[14rem_1fr] lg:gap-20 lg:py-16">
        <nav
          aria-label={help.title}
          className="min-w-0 lg:sticky lg:top-40 lg:self-start"
        >
          <ul className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-0.5 lg:overflow-visible lg:px-0">
            {HELP_TOPICS.map((key) => {
              const Icon = ICONS[key];
              const active = key === topic;
              return (
                <li key={key} className="shrink-0">
                  <Link
                    href={routes.help(locale, key)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-[13px] whitespace-nowrap transition-colors duration-200 lg:rounded-xl ${
                      active
                        ? "bg-ink-900 text-white"
                        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                    }`}
                  >
                    <Icon className="size-4 shrink-0 opacity-70" />
                    {help.topics[key].title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 max-w-2xl">
          {topic === "contact" ? (
            <Contact
              locale={locale}
              page={help.topics.contact}
              social={social}
            />
          ) : null}
          {topic === "delivery" ? (
            <Delivery
              page={help.topics.delivery}
              fill={fill}
              vars={vars}
              cod={shipping.codEnabled}
              codFee={shipping.codFee}
            />
          ) : null}
          {topic === "returns" ? (
            <Returns page={help.topics.returns} fill={fill} />
          ) : null}
          {topic === "size-guide" ? (
            <SizeGuide
              page={help.topics["size-guide"]}
              dict={dict}
              locale={locale}
            />
          ) : null}
          {topic === "faq" ? <Faq page={help.topics.faq} fill={fill} /> : null}

          {topic !== "contact" ? (
            <div className="border-ink-200/70 mt-14 border-t pt-10">
              <p className="font-display text-ink-800 text-2xl leading-snug">
                {help.reachUs}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {social.whatsapp ? (
                  <ButtonLink
                    href={social.whatsapp}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <WhatsappIcon className="size-4.5" />
                    {help.topics.contact.whatsapp}
                  </ButtonLink>
                ) : null}
                <ButtonLink
                  href={routes.help(locale, "contact")}
                  variant="secondary"
                >
                  {help.topics.contact.title}
                </ButtonLink>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

/* --------------------------------------------------------------------------
 * Sections
 * ----------------------------------------------------------------------- */

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-ink-200/70 border-t py-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-ink-900 text-2xl">{title}</h2>
      <div className="text-ink-600 mt-3 space-y-3 text-[15px] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

type Dict = ReturnType<typeof getDictionary>;
type Fill = (s: string) => string;

function Contact({
  locale,
  page,
  social,
}: {
  locale: Locale;
  page: Dict["help"]["topics"]["contact"];
  social: { whatsapp?: string; instagram?: string };
}) {
  const channels = [
    social.whatsapp
      ? {
          href: social.whatsapp,
          Icon: WhatsappIcon,
          title: page.whatsapp,
          body: page.whatsappBody,
        }
      : null,
    social.instagram
      ? {
          href: social.instagram,
          Icon: InstagramIcon,
          title: page.instagram,
          body: page.instagramBody,
        }
      : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <>
      {channels.length ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {channels.map(({ href, Icon, title, body }) => (
            <li key={title}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="group rounded-card block bg-white p-6 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]"
              >
                <span className="bg-brand-900 inline-flex size-11 items-center justify-center rounded-full text-white">
                  <Icon className="size-5" />
                </span>
                <p className="font-display text-ink-900 mt-5 text-2xl">
                  {title}
                </p>
                <p className="text-ink-600 mt-1.5 text-[14px] leading-relaxed">
                  {body}
                </p>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <div className={channels.length ? "mt-10" : ""}>
        <Block title={page.hoursTitle}>
          <p>{page.hours}</p>
        </Block>
        <Block title={page.orderTitle}>
          <p>{page.orderBody}</p>
        </Block>
        <Block title={page.storeTitle}>
          <p>{page.storeBody}</p>
        </Block>
        <p className="text-ink-400 mt-2 text-[13px]">
          <Link
            href={routes.help(locale, "faq")}
            className="link-draw hover:text-ink-900"
          >
            {locale === "ar" ? "الأسئلة الشائعة" : "See the FAQ"}
          </Link>
        </p>
      </div>
    </>
  );
}

function Delivery({
  page,
  fill,
  vars,
  cod,
  codFee,
}: {
  page: Dict["help"]["topics"]["delivery"];
  fill: Fill;
  vars: { free: string; rate: string };
  cod: boolean;
  codFee: number;
}) {
  return (
    <>
      <Block title={page.windowTitle}>
        <p>{fill(page.windowBody)}</p>
      </Block>
      <Block title={page.costTitle}>
        <p>{fill(page.free)}</p>
        <p>{fill(page.rate)}</p>
        <table className="mt-5 w-full text-[14px]">
          <caption className="sr-only">{page.ratesHeading}</caption>
          <thead>
            <tr className="text-ink-400 text-[11px] tracking-[0.12em] uppercase">
              <th className="border-ink-200/70 border-b pb-2 text-start font-medium">
                {page.rateOrders}
              </th>
              <th className="border-ink-200/70 border-b pb-2 text-end font-medium">
                {page.rateCost}
              </th>
            </tr>
          </thead>
          <tbody className="divide-ink-200/70 divide-y">
            <tr>
              <td className="py-3">{fill(page.rateFrom)}</td>
              <td className="text-success py-3 text-end font-medium">
                {page.freeLabel}
              </td>
            </tr>
            <tr>
              <td className="py-3">{fill(page.rateBelow)}</td>
              <td className="text-ink-900 py-3 text-end tabular-nums">
                {vars.rate}
              </td>
            </tr>
          </tbody>
        </table>
      </Block>
      <Block title={page.areasTitle}>
        <p>{page.areasBody}</p>
      </Block>
      <Block title={page.trackTitle}>
        <p>{page.trackBody}</p>
      </Block>
      {cod ? (
        <Block title={page.codTitle}>
          <p>{page.codBody}</p>
          <p>{codFee > 0 ? fill(page.codFee) : page.codFree}</p>
        </Block>
      ) : null}
      <Block title={page.largeTitle}>
        <p>{page.largeBody}</p>
      </Block>
    </>
  );
}

function Returns({
  page,
  fill,
}: {
  page: Dict["help"]["topics"]["returns"];
  fill: Fill;
}) {
  return (
    <>
      <Block title={page.windowTitle}>
        <p>{fill(page.windowBody)}</p>
      </Block>
      <Block title={page.howTitle}>
        <ol className="mt-1 space-y-4">
          {page.steps.map((step, i) => (
            <li key={step} className="flex gap-4">
              <span className="font-display text-brand-500 shrink-0 text-2xl leading-none tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </Block>
      <Block title={page.conditionTitle}>
        <p>{page.conditionBody}</p>
      </Block>
      <Block title={page.exchangeTitle}>
        <p>{page.exchangeBody}</p>
      </Block>
      <Block title={page.refundTitle}>
        <p>{page.refundBody}</p>
      </Block>
      <Block title={page.excludedTitle}>
        <p>{page.excludedBody}</p>
      </Block>
    </>
  );
}

function SizeGuide({
  page,
  dict,
  locale,
}: {
  page: Dict["help"]["topics"]["size-guide"];
  dict: Dict;
  locale: Locale;
}) {
  const th = "border-ink-200/70 border-b pb-2 text-start font-medium";
  const head = "text-ink-400 text-[11px] tracking-[0.12em] uppercase";
  const sizeLabel = (key: string) => SIZE_LABELS[key]?.[locale] ?? key;
  void dict;
  return (
    <>
      <Block title={page.howTitle}>
        <p>{page.howBody}</p>
      </Block>
      <Block title={page.babyTitle}>
        <table className="w-full text-[14px] tabular-nums">
          <thead>
            <tr className={head}>
              <th className={th}>{page.size}</th>
              <th className={th}>
                {page.height} ({page.cm})
              </th>
              <th className={th}>
                {page.weight} ({page.kg})
              </th>
            </tr>
          </thead>
          <tbody className="divide-ink-200/70 divide-y">
            {BABY.map((row) => (
              <tr key={row.size}>
                <td className="text-ink-900 py-2.5 font-medium">
                  {sizeLabel(row.size)}
                </td>
                <td className="py-2.5" dir="ltr">
                  {row.height}
                </td>
                <td className="py-2.5" dir="ltr">
                  {row.weight}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>
      <Block title={page.kidsTitle}>
        <table className="w-full text-[14px] tabular-nums">
          <thead>
            <tr className={head}>
              <th className={th}>{page.age}</th>
              <th className={th}>
                {page.height} ({page.cm})
              </th>
            </tr>
          </thead>
          <tbody className="divide-ink-200/70 divide-y">
            {KIDS.map((row) => (
              <tr key={row.size}>
                <td className="text-ink-900 py-2.5 font-medium">
                  {sizeLabel(row.size)}
                </td>
                <td className="py-2.5" dir="ltr">
                  {row.height}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>
      <Block title={page.shoesTitle}>
        <table className="w-full text-[14px] tabular-nums">
          <thead>
            <tr className={head}>
              <th className={th}>{page.euSize}</th>
              <th className={th}>
                {page.foot} ({page.cm})
              </th>
            </tr>
          </thead>
          <tbody className="divide-ink-200/70 divide-y">
            {SHOES.map((row) => (
              <tr key={row.eu}>
                <td className="text-ink-900 py-2.5 font-medium" dir="ltr">
                  {row.eu}
                </td>
                <td className="py-2.5" dir="ltr">
                  {row.foot}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-ink-400 mt-4 text-[13px]">{page.note}</p>
        <p className="text-ink-400 text-[13px]">{page.onProductBody}</p>
      </Block>
    </>
  );
}

function Faq({
  page,
  fill,
}: {
  page: Dict["help"]["topics"]["faq"];
  fill: Fill;
}) {
  return (
    <div className="border-ink-200/70 border-t">
      {page.items.map((item, i) => (
        <Accordion key={item.q} title={item.q} defaultOpen={i === 0}>
          <p>{fill(item.a)}</p>
        </Accordion>
      ))}
    </div>
  );
}
