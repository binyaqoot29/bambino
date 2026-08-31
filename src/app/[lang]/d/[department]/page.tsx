import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductArt } from "@/components/product/ProductArt";
import { ProductListing } from "@/components/plp/ProductListing";
import { parseListingParams } from "@/components/plp/search-params";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getProductsInDepartment } from "@/lib/catalog/queries";
import { categoriesInDepartment } from "@/lib/catalog/categories";
import { DEPARTMENT_ORDER } from "@/lib/catalog/taxonomy";
import { DEPARTMENT_LABELS, type Department } from "@/lib/catalog/types";
import { languageAlternates } from "@/lib/alternates";
import { routes } from "@/lib/routes";

function isDepartment(value: string): value is Department {
  return (DEPARTMENT_ORDER as string[]).includes(value);
}

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    DEPARTMENT_ORDER.map((department) => ({ lang, department })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; department: string }>;
}): Promise<Metadata> {
  const { lang, department } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  if (!isDepartment(department)) return {};

  return {
    title: DEPARTMENT_LABELS[department][locale],
    alternates: {
      canonical: routes.department(locale, department),
      languages: await languageAlternates((l) =>
        routes.department(l, department),
      ),
    },
  };
}

export default async function DepartmentPage({
  params,
  searchParams,
}: PageProps<"/[lang]/d/[department]">) {
  const { lang, department } = await params;
  if (!isLocale(lang)) notFound();
  if (!isDepartment(department)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const listingParams = parseListingParams(await searchParams);

  const products = await getProductsInDepartment(department);
  const categories = await categoriesInDepartment(department);

  return (
    <>
      {/* Category shelf, so a department page isn't just a wall of products. */}
      <div className="border-ink-100 border-b">
        <div className="container-bambino py-6">
          <ul className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
            {categories.map((category) => (
              <li key={category.slug} className="shrink-0">
                <Link
                  href={routes.category(locale, category.slug)}
                  className="group ring-ink-200/70 hover:ring-brand-300 flex w-40 flex-col overflow-hidden rounded-2xl ring-1 transition-all"
                >
                  <ProductArt
                    art={category.art}
                    seed={category.slug}
                    className="aspect-3/2 w-full"
                  />
                  <span className="text-ink-800 group-hover:text-brand-700 px-3 py-2.5 text-xs font-medium">
                    {category.name[locale]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ProductListing
        title={DEPARTMENT_LABELS[department][locale]}
        crumbs={[
          { label: dict.nav.home, href: routes.home(locale) },
          { label: DEPARTMENT_LABELS[department][locale] },
        ]}
        products={products}
        params={listingParams}
        basePath={routes.department(locale, department)}
        locale={locale}
        dict={dict}
      />
    </>
  );
}
