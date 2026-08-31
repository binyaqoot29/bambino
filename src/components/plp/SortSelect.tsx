"use client";

import { useRouter } from "next/navigation";

import { ChevronDownIcon } from "@/components/ui/Icons";
import type { Dictionary } from "@/i18n/get-dictionary";
import { SORT_KEYS, type SortKey } from "@/lib/catalog/types";
import { buildQuery, type ListingParams } from "./search-params";

export function SortSelect({
  basePath,
  params,
  dict,
}: {
  basePath: string;
  params: ListingParams;
  dict: Dictionary;
}) {
  const router = useRouter();

  // "Curated" is only meaningful on a manually arranged collection — that's the
  // only listing where it's the default.
  const options = SORT_KEYS.filter(
    (key) => key !== "curated" || params.defaultSort === "curated",
  );

  return (
    <div className="relative">
      <label htmlFor="sort" className="sr-only">
        {dict.plp.sortBy}
      </label>
      <select
        id="sort"
        value={params.sort}
        onChange={(event) =>
          router.push(
            `${basePath}${buildQuery(params, {
              sort: event.target.value as SortKey,
            })}`,
            { scroll: false },
          )
        }
        className="text-ink-700 ring-ink-200 hover:ring-ink-300 focus:ring-brand-400 h-10 cursor-pointer appearance-none rounded-full bg-white ps-4 pe-10 text-sm font-medium ring-1 focus:outline-none"
      >
        {options.map((key) => (
          <option key={key} value={key}>
            {dict.plp.sort[key]}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="text-ink-400 pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2" />
    </div>
  );
}
