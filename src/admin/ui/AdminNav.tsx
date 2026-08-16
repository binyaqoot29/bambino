"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Section tabs. Client-side only so the current section can be highlighted. */
export function AdminNav({
  labels,
}: {
  labels: { products: string; categories: string; settings: string };
}) {
  const pathname = usePathname();

  const items = [
    { href: "/admin", label: labels.products, match: /^\/admin(\/products.*)?$/ },
    { href: "/admin/categories", label: labels.categories, match: /^\/admin\/categories/ },
    { href: "/admin/settings", label: labels.settings, match: /^\/admin\/settings/ },
  ];

  return (
    <nav className="mx-auto w-full max-w-6xl px-4">
      <ul className="-mb-px flex gap-1">
        {items.map((item) => {
          const active = item.match.test(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-10 items-center border-b-2 px-3 text-[13px] font-semibold transition-colors ${
                  active
                    ? "border-brand-500 text-brand-700"
                    : "text-ink-500 hover:text-ink-800 border-transparent"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
