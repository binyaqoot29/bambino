"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ImageUploader } from "@/admin/ui/ImageUploader";

import type { ProductFormState } from "@/admin/actions";
import type { Product } from "@/lib/catalog/types";

type Option = { value: string; label: string };

/**
 * Create/edit form.
 *
 * Laid out English-beside-Arabic rather than as two tabs, because the failure
 * this design guards against is shipping a product that's blank on /ar — and a
 * hidden tab is easy to forget. The action rejects a missing Arabic field for
 * the same reason.
 */
export function ProductForm({
  action,
  product,
  categories,
  arts,
  colours,
  sizes,
  ages,
}: {
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  product?: Product;
  categories: Option[];
  arts: Option[];
  colours: (Option & { hex: string })[];
  sizes: Option[];
  ages: Option[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const err = state.fieldErrors ?? {};

  /**
   * After a rejected submit the action echoes what was typed (see FormEcho in
   * actions.ts). Those values win over the saved product, and the fields sit
   * under `key={attempt}` so they remount and take them as defaults — a form
   * that lost everything over one blank field is the bug this guards against.
   */
  const v = state.values ?? {};
  const kept = (name: string, fallback?: string) =>
    typeof v[name] === "string" ? (v[name] as string) : fallback;
  const keptList = (name: string, fallback: Iterable<string>) =>
    name in v
      ? new Set(
          Array.isArray(v[name]) ? (v[name] as string[]) : [v[name] as string],
        )
      : new Set(fallback);
  const keptOn = (name: string, fallback?: boolean) =>
    state.values ? v[name] === "on" : fallback;

  const selectedColours = keptList(
    "colours",
    product?.colours.map((c) => c.key) ?? [],
  );
  const selectedSizes = keptList(
    "sizes",
    product?.variants.map((v) => v.size) ?? [],
  );
  const selectedAges = keptList("ageGroups", product?.ageGroups ?? []);
  const images = [...keptList("image", product?.images ?? [])];
  const money = (fils?: number) =>
    fils === undefined ? "" : (fils / 1000).toFixed(3);

  return (
    <form action={formAction} className="space-y-5">
      <div key={state.attempt ?? 0} className="space-y-5">
        {state.error ? (
          <p
            role="alert"
            className="bg-sale/10 text-sale rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            {state.error}
          </p>
        ) : null}

        <Card
          title="Names and copy"
          note="Both languages are required — the Arabic site shows these."
        >
          <Bilingual
            label="Product name"
            nameEn="nameEn"
            nameAr="nameAr"
            defaultEn={kept("nameEn", product?.name.en)}
            defaultAr={kept("nameAr", product?.name.ar)}
            errEn={err.nameEn}
            errAr={err.nameAr}
          />
          <Bilingual
            label="Short summary"
            hint="One line, shown under the name on product cards"
            nameEn="summaryEn"
            nameAr="summaryAr"
            defaultEn={kept("summaryEn", product?.summary.en)}
            defaultAr={kept("summaryAr", product?.summary.ar)}
            errEn={err.summaryEn}
            errAr={err.summaryAr}
          />
          <Bilingual
            label="Description"
            textarea
            nameEn="descriptionEn"
            nameAr="descriptionAr"
            defaultEn={kept("descriptionEn", product?.description.en)}
            defaultAr={kept("descriptionAr", product?.description.ar)}
            errEn={err.descriptionEn}
            errAr={err.descriptionAr}
          />
          <Bilingual
            label="Detail bullets"
            hint="One per line. Both languages need the same number of lines."
            textarea
            nameEn="detailsEn"
            nameAr="detailsAr"
            defaultEn={kept(
              "detailsEn",
              product?.details.map((d) => d.en).join("\n"),
            )}
            defaultAr={kept(
              "detailsAr",
              product?.details.map((d) => d.ar).join("\n"),
            )}
            errEn={err.detailsEn}
            errAr={err.detailsAr}
          />
          <Bilingual
            label="Care instructions"
            hint="Optional — fill both languages or neither"
            textarea
            nameEn="careEn"
            nameAr="careAr"
            defaultEn={kept("careEn", product?.care?.en)}
            defaultAr={kept("careAr", product?.care?.ar)}
            errEn={err.careEn}
            errAr={err.careAr}
          />
        </Card>

        <Card title="Classification">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={err.category}>
              <select
                name="category"
                defaultValue={kept("category", product?.category)}
                className="ring-ink-300 focus:ring-ink-900 h-10 w-full rounded-xl bg-white px-3 text-sm ring-1 focus:outline-none"
              >
                <option value="">Choose…</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <ImageUploader
                initial={images}
                labels={{
                  title: "Photos",
                  hint: "First one is the cover. Resized automatically — JPEG, PNG or WebP.",
                  add: "+ Add",
                  uploading: "Uploading…",
                  remove: "Remove",
                  makeFirst: "Make cover",
                  cover: "Cover",
                  tooLarge: "Too large",
                  wrongType: "Not an image",
                  failed: "Upload failed",
                  empty: "No photos yet — the illustration below will be used.",
                }}
              />
            </div>
            <Field
              label="Illustration"
              hint="Used whenever this product has no photos"
              error={err.art}
            >
              <select
                name="art"
                defaultValue={kept("art", product?.art)}
                className="ring-ink-300 focus:ring-ink-900 h-10 w-full rounded-xl bg-white px-3 text-sm ring-1 focus:outline-none"
              >
                <option value="">Choose…</option>
                {arts.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Web address"
              hint="Leave blank to build it from the name"
            >
              <input
                name="handle"
                defaultValue={kept("handle", product?.handle)}
                placeholder="tiered-twirl-dress"
                className="ring-ink-300 focus:ring-ink-900 h-10 w-full rounded-xl bg-white px-3 font-mono text-sm ring-1 focus:outline-none"
              />
            </Field>
          </div>

          <Field label="Age groups" error={err.ageGroups}>
            <CheckGrid
              name="ageGroups"
              options={ages}
              selected={selectedAges}
            />
          </Field>
        </Card>

        <Card
          title="Price"
          note="In dinars, three decimals — 12.500 means 12 KD 500 fils."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price" error={err.price}>
              <input
                name="price"
                inputMode="decimal"
                defaultValue={kept("price", money(product?.price))}
                placeholder="12.500"
                className="ring-ink-300 focus:ring-ink-900 h-10 w-full rounded-xl bg-white px-3 text-sm tabular-nums ring-1 focus:outline-none"
              />
            </Field>
            <Field
              label="Was (optional)"
              hint="Higher than the price — shows a discount badge"
              error={err.compareAtPrice}
            >
              <input
                name="compareAtPrice"
                inputMode="decimal"
                defaultValue={kept(
                  "compareAtPrice",
                  money(product?.compareAtPrice),
                )}
                placeholder="19.500"
                className="ring-ink-300 focus:ring-ink-900 h-10 w-full rounded-xl bg-white px-3 text-sm tabular-nums ring-1 focus:outline-none"
              />
            </Field>
          </div>
        </Card>

        <Card
          title="Colours, sizes and stock"
          note="A variant is created for every colour × size combination. Editing these keeps the stock of combinations that already existed."
        >
          <Field label="Colours" error={err.colours}>
            <div className="flex flex-wrap gap-2">
              {colours.map((c) => (
                <label
                  key={c.value}
                  className="ring-ink-300 has-checked:ring-ink-900 has-checked:bg-ink-900 has-checked:text-white flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs ring-1 has-checked:ring-2"
                >
                  <input
                    type="checkbox"
                    name="colours"
                    value={c.value}
                    defaultChecked={selectedColours.has(c.value)}
                    className="sr-only"
                  />
                  <span
                    className="ring-ink-200 size-4 rounded-full ring-1"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Sizes" error={err.sizes}>
            <CheckGrid name="sizes" options={sizes} selected={selectedSizes} />
          </Field>

          <Field
            label="Stock per new variant"
            hint="Applied to newly created combinations only"
          >
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={kept("stock", "5")}
              className="ring-ink-300 focus:ring-ink-900 h-10 w-32 rounded-xl bg-white px-3 text-sm tabular-nums ring-1 focus:outline-none"
            />
          </Field>
        </Card>

        <Card title="Merchandising">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rating" hint="0–5, shown on cards">
              <input
                name="rating"
                type="number"
                step="0.1"
                min={0}
                max={5}
                defaultValue={kept("rating", String(product?.rating ?? 4.5))}
                className="ring-ink-300 focus:ring-ink-900 h-10 w-32 rounded-xl bg-white px-3 text-sm tabular-nums ring-1 focus:outline-none"
              />
            </Field>
            <Field label="Review count">
              <input
                name="reviewCount"
                type="number"
                min={0}
                defaultValue={kept(
                  "reviewCount",
                  String(product?.reviewCount ?? 0),
                )}
                className="ring-ink-300 focus:ring-ink-900 h-10 w-32 rounded-xl bg-white px-3 text-sm tabular-nums ring-1 focus:outline-none"
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-5">
            <Toggle
              name="featured"
              label="Featured"
              defaultChecked={keptOn("featured", product?.featured)}
            />
            <Toggle
              name="bestseller"
              label="Bestseller"
              defaultChecked={keptOn("bestseller", product?.bestseller)}
            />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-brand-900 hover:bg-brand-800 h-11 rounded-full px-6 text-[13px] font-medium text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
          <Link
            href="/admin"
            className="text-ink-600 hover:text-ink-900 text-sm font-medium"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function Card({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
      <h2 className="font-display text-ink-900 text-xl">{title}</h2>
      {note ? <p className="text-ink-500 mt-1 text-xs">{note}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-ink-700 block text-[12px] font-medium">
        {label}
      </label>
      {hint ? <p className="text-ink-400 mt-0.5 text-[11px]">{hint}</p> : null}
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="text-sale mt-1 text-[11px] font-medium">{error}</p>
      ) : null}
    </div>
  );
}

function Bilingual({
  label,
  hint,
  nameEn,
  nameAr,
  defaultEn,
  defaultAr,
  errEn,
  errAr,
  textarea = false,
}: {
  label: string;
  hint?: string;
  nameEn: string;
  nameAr: string;
  defaultEn?: string;
  defaultAr?: string;
  errEn?: string;
  errAr?: string;
  textarea?: boolean;
}) {
  const base =
    "ring-ink-300 focus:ring-ink-900 w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 focus:outline-none";

  return (
    <div>
      <p className="text-ink-700 text-[12px] font-medium">{label}</p>
      {hint ? <p className="text-ink-400 mt-0.5 text-[11px]">{hint}</p> : null}
      <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
        <div>
          <span className="text-ink-400 text-[10px] font-medium tracking-[0.14em] uppercase">
            English
          </span>
          {textarea ? (
            <textarea
              name={nameEn}
              defaultValue={defaultEn}
              rows={3}
              className={`mt-1 ${base}`}
            />
          ) : (
            <input
              name={nameEn}
              defaultValue={defaultEn}
              className={`mt-1 h-10 ${base}`}
            />
          )}
          {errEn ? (
            <p className="text-sale mt-1 text-[11px] font-medium">{errEn}</p>
          ) : null}
        </div>
        <div>
          <span className="text-ink-400 text-[10px] font-medium tracking-[0.14em] uppercase">
            العربية
          </span>
          {textarea ? (
            <textarea
              name={nameAr}
              defaultValue={defaultAr}
              rows={3}
              dir="rtl"
              className={`mt-1 ${base}`}
            />
          ) : (
            <input
              name={nameAr}
              defaultValue={defaultAr}
              dir="rtl"
              className={`mt-1 h-10 ${base}`}
            />
          )}
          {errAr ? (
            <p className="text-sale mt-1 text-[11px] font-medium">{errAr}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CheckGrid({
  name,
  options,
  selected,
}: {
  name: string;
  options: Option[];
  selected: Set<string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className="ring-ink-300 has-checked:ring-ink-900 has-checked:bg-ink-900 has-checked:text-white text-ink-600 cursor-pointer rounded-xl px-3 py-1.5 text-xs font-medium ring-1 has-checked:ring-2"
        >
          <input
            type="checkbox"
            name={name}
            value={o.value}
            defaultChecked={selected.has(o.value)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="text-ink-700 flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="accent-brand-900 size-4"
      />
      {label}
    </label>
  );
}
