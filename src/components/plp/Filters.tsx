"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { CheckIcon, CloseIcon, FilterIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatPrice } from "@/lib/money";
import {
  activeFilterCount,
  buildQuery,
  toggle,
  type ListingParams,
} from "./search-params";

export type FacetOption = {
  value: string;
  label: string;
  count: number;
  /** Swatch colour, for the colour facet. */
  hex?: string;
};

export type FacetData = {
  ages: FacetOption[];
  colours: FacetOption[];
  sizes: FacetOption[];
  minPrice: number;
  maxPrice: number;
  onSale: number;
  inStock: number;
};

type FilterProps = {
  basePath: string;
  params: ListingParams;
  facets: FacetData;
  locale: Locale;
  dict: Dictionary;
  resultLabel: string;
};

/** The facet controls themselves, shared by the desktop rail and mobile sheet. */
function FilterPanel({ basePath, params, facets, locale, dict }: FilterProps) {
  const router = useRouter();
  const active = activeFilterCount(params);

  function apply(patch: Partial<ListingParams>) {
    router.push(`${basePath}${buildQuery(params, patch)}`, { scroll: false });
  }

  return (
    <div className="space-y-7">
      <FacetGroup title={dict.plp.availability}>
        <CheckboxRow
          checked={params.inStockOnly}
          onChange={() => apply({ inStockOnly: !params.inStockOnly })}
          label={dict.plp.inStockOnly}
          count={facets.inStock}
        />
        <CheckboxRow
          checked={params.onSaleOnly}
          onChange={() => apply({ onSaleOnly: !params.onSaleOnly })}
          label={dict.plp.onSaleOnly}
          count={facets.onSale}
        />
      </FacetGroup>

      {facets.ages.length > 0 ? (
        <FacetGroup title={dict.plp.ageGroup}>
          {facets.ages.map((option) => (
            <CheckboxRow
              key={option.value}
              checked={params.ages.includes(option.value as never)}
              onChange={() =>
                apply({ ages: toggle(params.ages, option.value) as never })
              }
              label={option.label}
              count={option.count}
            />
          ))}
        </FacetGroup>
      ) : null}

      {facets.sizes.length > 1 ? (
        <FacetGroup title={dict.plp.size}>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((option) => {
              const on = params.sizes.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => apply({ sizes: toggle(params.sizes, option.value) })}
                  aria-pressed={on}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                    on
                      ? "bg-brand-500 text-white ring-brand-500"
                      : "text-ink-600 ring-ink-200 hover:ring-brand-300"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </FacetGroup>
      ) : null}

      {facets.colours.length > 1 ? (
        <FacetGroup title={dict.plp.colour}>
          <div className="flex flex-wrap gap-2.5">
            {facets.colours.map((option) => {
              const on = params.colours.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  title={`${option.label} (${option.count})`}
                  onClick={() =>
                    apply({ colours: toggle(params.colours, option.value) })
                  }
                  aria-pressed={on}
                  aria-label={option.label}
                  className={`relative inline-flex size-8 items-center justify-center rounded-full ring-1 transition-all ${
                    on
                      ? "ring-brand-500 ring-2 ring-offset-2"
                      : "ring-ink-200 hover:ring-ink-300"
                  }`}
                  style={{ backgroundColor: option.hex }}
                >
                  {on ? (
                    <CheckIcon className="size-4 text-white mix-blend-difference" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </FacetGroup>
      ) : null}

      <FacetGroup title={dict.plp.price}>
        <PriceFilter
          params={params}
          min={facets.minPrice}
          max={facets.maxPrice}
          locale={locale}
          onApply={(minPrice, maxPrice) => apply({ minPrice, maxPrice })}
          applyLabel={dict.plp.apply}
          clearLabel={dict.plp.clear}
        />
      </FacetGroup>

      {active > 0 ? (
        <button
          type="button"
          onClick={() =>
            router.push(
              `${basePath}${buildQuery(params, {
                ages: [],
                colours: [],
                sizes: [],
                minPrice: undefined,
                maxPrice: undefined,
                inStockOnly: false,
                onSaleOnly: false,
              })}`,
              { scroll: false },
            )
          }
          className="text-brand-600 hover:text-brand-700 text-sm font-medium underline underline-offset-4"
        >
          {dict.plp.clearAll}
        </button>
      ) : null}
    </div>
  );
}

/** Persistent filter column, desktop only. */
export function FilterRail(props: FilterProps) {
  return (
    <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
      <FilterPanel {...props} />
    </aside>
  );
}

/** Trigger + slide-over sheet, mobile and tablet only. */
export function FilterSheet(props: FilterProps) {
  const [open, setOpen] = useState(false);
  const active = activeFilterCount(props.params);
  const { dict, resultLabel } = props;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-ink-700 ring-ink-200 inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium ring-1"
      >
        <FilterIcon className="size-4.5" />
        {dict.plp.filters}
        {active > 0 ? (
          <span className="bg-brand-500 inline-flex size-5 items-center justify-center rounded-full text-[11px] text-white">
            {active}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label={dict.common.close}
            onClick={() => setOpen(false)}
            className="bg-brand-950/35 absolute inset-0"
          />
          <div className="bg-paper absolute inset-y-0 end-0 flex w-[88%] max-w-sm flex-col">
            <div className="border-ink-200 flex h-16 items-center justify-between border-b px-5">
              <h2 className="text-ink-900 font-medium">{dict.plp.filters}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={dict.common.close}
                className="text-ink-600 hover:bg-ink-100 inline-flex size-10 items-center justify-center rounded-full"
              >
                <CloseIcon className="size-5.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <FilterPanel {...props} />
            </div>
            <div className="border-ink-200 border-t p-4">
              <Button block onClick={() => setOpen(false)}>
                {resultLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FacetGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-ink-900 mb-3 text-[13px] font-semibold tracking-wide">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count: number;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`inline-flex size-4.5 shrink-0 items-center justify-center rounded-[6px] ring-1 transition-colors ${
          checked
            ? "bg-brand-500 ring-brand-500 text-white"
            : "ring-ink-300 group-hover:ring-brand-300 bg-white"
        }`}
      >
        {checked ? <CheckIcon className="size-3.5" /> : null}
      </span>
      <span className="text-ink-600 group-hover:text-ink-900 flex-1 text-sm">
        {label}
      </span>
      <span className="text-ink-400 text-xs tabular-nums">{count}</span>
    </label>
  );
}

function PriceFilter({
  params,
  min,
  max,
  locale,
  onApply,
  applyLabel,
  clearLabel,
}: {
  params: ListingParams;
  min: number;
  max: number;
  locale: Locale;
  onApply: (min?: number, max?: number) => void;
  applyLabel: string;
  clearLabel: string;
}) {
  const [value, setValue] = useState(params.maxPrice ?? max);
  const dirty = params.maxPrice !== undefined || params.minPrice !== undefined;

  return (
    <div>
      <div className="text-ink-500 flex items-center justify-between text-xs tabular-nums">
        <span>{formatPrice(min, locale)}</span>
        <span className="text-ink-900 font-medium">
          {formatPrice(value, locale)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={500}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        aria-label={applyLabel}
        className="accent-brand-500 mt-3 w-full"
      />
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => onApply(undefined, value)}>
          {applyLabel}
        </Button>
        {dirty ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setValue(max);
              onApply(undefined, undefined);
            }}
          >
            {clearLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
