"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { CategoryFormState } from "@/admin/actions";
import type { AdminDictionary } from "@/admin/i18n";
import type { Category } from "@/lib/catalog/types";

type Option = { value: string; label: string };

export function CategoryForm({
  action,
  category,
  t,
  departments,
  arts,
}: {
  action: (
    state: CategoryFormState,
    formData: FormData,
  ) => Promise<CategoryFormState>;
  category?: Category;
  t: AdminDictionary;
  departments: Option[];
  arts: Option[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const err = state.fieldErrors ?? {};

  const input =
    "ring-ink-300 focus:ring-brand-500 w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 focus:ring-2 focus:outline-none";

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      {state.error ? (
        <p role="alert" className="bg-sale/10 text-sale rounded-lg px-4 py-2.5 text-sm font-medium">
          {state.error}
        </p>
      ) : null}

      <section className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
        <div className="space-y-4">
          <div>
            <p className="text-ink-700 text-xs font-semibold">
              {t.categories.name}
            </p>
            <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-ink-400 text-[10px] font-bold tracking-wide uppercase">
                  {t.form.english}
                </span>
                <input
                  name="nameEn"
                  defaultValue={category?.name.en}
                  className={`mt-1 h-10 ${input}`}
                />
                {err.nameEn ? (
                  <p className="text-sale mt-1 text-[11px] font-medium">{err.nameEn}</p>
                ) : null}
              </div>
              <div>
                <span className="text-ink-400 text-[10px] font-bold tracking-wide uppercase">
                  {t.form.arabic}
                </span>
                <input
                  name="nameAr"
                  defaultValue={category?.name.ar}
                  dir="rtl"
                  className={`mt-1 h-10 ${input}`}
                />
                {err.nameAr ? (
                  <p className="text-sale mt-1 text-[11px] font-medium">{err.nameAr}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <p className="text-ink-700 text-xs font-semibold">
              {t.categories.blurb}
            </p>
            <p className="text-ink-400 mt-0.5 text-[11px]">
              {t.categories.blurbHint}
            </p>
            <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
              <input
                name="blurbEn"
                defaultValue={category?.blurb?.en}
                className={`h-10 ${input}`}
              />
              <div>
                <input
                  name="blurbAr"
                  defaultValue={category?.blurb?.ar}
                  dir="rtl"
                  className={`h-10 ${input}`}
                />
                {err.blurbAr ? (
                  <p className="text-sale mt-1 text-[11px] font-medium">{err.blurbAr}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-ink-700 block text-xs font-semibold">
              {t.categories.department}
            </label>
            <p className="text-ink-400 mt-0.5 text-[11px]">
              {t.categories.departmentHint}
            </p>
            <select
              name="department"
              defaultValue={category?.department}
              className={`mt-1.5 h-10 ${input}`}
            >
              <option value="">—</option>
              {departments.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            {err.department ? (
              <p className="text-sale mt-1 text-[11px] font-medium">{err.department}</p>
            ) : null}
          </div>

          <div>
            <label className="text-ink-700 block text-xs font-semibold">
              {t.categories.art}
            </label>
            <select
              name="art"
              defaultValue={category?.art}
              className={`mt-1.5 h-10 ${input}`}
            >
              <option value="">—</option>
              {arts.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
            {err.art ? (
              <p className="text-sale mt-1 text-[11px] font-medium">{err.art}</p>
            ) : null}
          </div>

          <div>
            <label className="text-ink-700 block text-xs font-semibold">
              {t.categories.slug}
            </label>
            <p className="text-ink-400 mt-0.5 text-[11px]">
              {category ? t.categories.slugWarning : t.categories.slugHint}
            </p>
            <input
              name="slug"
              defaultValue={category?.slug}
              placeholder="bodysuits"
              className={`mt-1.5 h-10 font-mono ${input}`}
            />
            {err.slug ? (
              <p className="text-sale mt-1 text-[11px] font-medium">{err.slug}</p>
            ) : null}
          </div>

          <div>
            <label className="text-ink-700 block text-xs font-semibold">
              {t.categories.position}
            </label>
            <p className="text-ink-400 mt-0.5 text-[11px]">
              {t.categories.positionHint}
            </p>
            <input
              name="position"
              type="number"
              defaultValue={0}
              className={`mt-1.5 h-10 w-28 ${input}`}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-brand-500 hover:bg-brand-600 h-11 rounded-lg px-6 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? t.form.saving : category ? t.form.save : t.form.create}
        </button>
        <Link
          href="/admin/categories"
          className="text-ink-600 hover:text-ink-900 text-sm font-medium"
        >
          {t.form.cancel}
        </Link>
      </div>
    </form>
  );
}
