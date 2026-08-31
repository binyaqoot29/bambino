"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavLabels = {
  catalogue: string;
  products: string;
  inventory: string;
  collections: string;
  categories: string;
  audience: string;
  customers: string;
  configuration: string;
  shipping: string;
  languages: string;
  settings: string;
  menu: string;
};

/**
 * Section navigation.
 *
 * A sidebar rather than the tab row this replaced: seven destinations in three
 * groups don't read as a flat list, and grouping them is what makes the panel
 * scannable — catalogue work, audience, configuration.
 *
 * On narrow screens the same tree becomes a horizontally scrolling strip;
 * a phone can't spare 200px of width, and the group headings survive as
 * separators.
 */
export function AdminNav({ labels }: { labels: NavLabels }) {
  const pathname = usePathname();

  const groups = [
    {
      heading: labels.catalogue,
      items: [
        {
          href: "/admin",
          label: labels.products,
          match: /^\/admin(\/products.*)?$/,
        },
        {
          href: "/admin/inventory",
          label: labels.inventory,
          match: /^\/admin\/inventory/,
        },
        {
          href: "/admin/collections",
          label: labels.collections,
          match: /^\/admin\/collections/,
        },
        {
          href: "/admin/categories",
          label: labels.categories,
          match: /^\/admin\/categories/,
        },
      ],
    },
    {
      heading: labels.audience,
      items: [
        {
          href: "/admin/customers",
          label: labels.customers,
          match: /^\/admin\/customers/,
        },
      ],
    },
    {
      heading: labels.configuration,
      items: [
        {
          href: "/admin/shipping",
          label: labels.shipping,
          match: /^\/admin\/shipping/,
        },
        {
          href: "/admin/languages",
          label: labels.languages,
          match: /^\/admin\/languages/,
        },
        {
          href: "/admin/settings",
          label: labels.settings,
          match: /^\/admin\/settings/,
        },
      ],
    },
  ];

  return (
    <nav aria-label={labels.menu} className="lg:w-52 lg:shrink-0">
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pe-8 lg:mx-0 lg:overflow-visible lg:p-0">
        <ul className="flex items-center gap-1 lg:block lg:space-y-5">
          {groups.map((group) => (
            <li key={group.heading} className="contents lg:block">
              <p className="text-ink-400 hidden px-3 pb-1.5 text-[11px] font-bold tracking-wide uppercase lg:block">
                {group.heading}
              </p>
              <ul className="flex items-center gap-1 lg:block lg:space-y-0.5">
                {group.items.map((item) => {
                  const active = item.match.test(pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex h-9 items-center rounded-lg px-3 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                          active
                            ? "bg-brand-50 text-brand-700"
                            : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
