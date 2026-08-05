"use client";

import { useRouter } from "next/navigation";

import { CloseIcon } from "@/components/ui/Icons";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { FacetData } from "./Filters";
import {
  activeFilterCount,
  buildQuery,
  toggle,
  type ListingParams,
} from "./search-params";

export function ActiveFilters({
  basePath,
  params,
  facets,
  dict,
}: {
  basePath: string;
  params: ListingParams;
  facets: FacetData;
  dict: Dictionary;
}) {
  const router = useRouter();
  if (activeFilterCount(params) === 0) return null;

  function go(patch: Partial<ListingParams>) {
    router.push(`${basePath}${buildQuery(params, patch)}`, { scroll: false });
  }

  const label = (options: FacetData[keyof FacetData], value: string) =>
    Array.isArray(options)
      ? (options.find((o) => o.value === value)?.label ?? value)
      : value;

  const chips: { key: string; text: string; clear: () => void }[] = [
    ...params.ages.map((age) => ({
      key: `age-${age}`,
      text: label(facets.ages, age),
      clear: () => go({ ages: toggle(params.ages, age) as never }),
    })),
    ...params.sizes.map((size) => ({
      key: `size-${size}`,
      text: label(facets.sizes, size),
      clear: () => go({ sizes: toggle(params.sizes, size) }),
    })),
    ...params.colours.map((colour) => ({
      key: `colour-${colour}`,
      text: label(facets.colours, colour),
      clear: () => go({ colours: toggle(params.colours, colour) }),
    })),
  ];

  if (params.inStockOnly) {
    chips.push({
      key: "stock",
      text: dict.plp.inStockOnly,
      clear: () => go({ inStockOnly: false }),
    });
  }
  if (params.onSaleOnly) {
    chips.push({
      key: "sale",
      text: dict.plp.onSaleOnly,
      clear: () => go({ onSaleOnly: false }),
    });
  }
  if (params.maxPrice !== undefined || params.minPrice !== undefined) {
    chips.push({
      key: "price",
      text: dict.plp.price,
      clear: () => go({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  return (
    <ul
      aria-label={dict.plp.activeFilters}
      className="flex flex-wrap items-center gap-2"
    >
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={chip.clear}
            className="bg-brand-50 text-brand-700 hover:bg-brand-100 inline-flex items-center gap-1.5 rounded-full py-1.5 ps-3 pe-2 text-xs font-medium transition-colors"
          >
            {chip.text}
            <CloseIcon className="size-3.5" />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={() =>
            go({
              ages: [],
              colours: [],
              sizes: [],
              minPrice: undefined,
              maxPrice: undefined,
              inStockOnly: false,
              onSaleOnly: false,
            })
          }
          className="text-ink-500 hover:text-ink-800 px-2 text-xs font-medium underline underline-offset-4"
        >
          {dict.plp.clearAll}
        </button>
      </li>
    </ul>
  );
}
