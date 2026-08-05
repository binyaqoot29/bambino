import Link from "next/link";

import { ArrowIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Product } from "@/lib/catalog/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  locale,
  dict,
  className = "",
}: {
  products: Product[];
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 ${className}`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          dict={dict}
        />
      ))}
    </div>
  );
}

/**
 * Horizontally scrolling shelf for the homepage. Snap points keep cards aligned
 * on touch, and the whole rail stays keyboard-reachable as a normal list.
 */
export function ProductRail({
  title,
  body,
  href,
  viewAllLabel,
  products,
  locale,
  dict,
}: {
  title: string;
  body?: string;
  href?: string;
  viewAllLabel: string;
  products: Product[];
  locale: Locale;
  dict: Dictionary;
}) {
  if (products.length === 0) return null;

  return (
    <section className="container-bambino py-14 lg:py-16">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-ink-900 text-2xl font-medium tracking-tight sm:text-3xl">
            {title}
          </h2>
          {body ? (
            <p className="text-ink-500 mt-1.5 text-sm">{body}</p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            {viewAllLabel}
            <ArrowIcon className="flip-rtl size-4" />
          </Link>
        ) : null}
      </div>

      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
        {products.map((product) => (
          <li
            key={product.id}
            className="w-[62%] shrink-0 snap-start sm:w-[38%] lg:w-auto"
          >
            <ProductCard product={product} locale={locale} dict={dict} />
          </li>
        ))}
      </ul>
    </section>
  );
}
