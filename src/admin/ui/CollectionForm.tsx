"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { saveCollection, type CollectionFormState } from "@/admin/actions";
import type { AdminDictionary } from "@/admin/i18n";
import {
  COLLECTION_RULES,
  COLLECTION_RULE_LABELS,
  type CollectionRule,
} from "@/lib/catalog/collection-rules";
import type { Locale } from "@/i18n/config";

export type PickableProduct = { id: string; name: string; category: string };

export type CollectionDraft = {
  slug: string;
  nameEn: string;
  nameAr: string;
  blurbEn: string;
  blurbAr: string;
  rule: CollectionRule | null;
  position: number;
  visible: boolean;
  members: string[];
};

export function CollectionForm({
  draft,
  products,
  locale,
  t,
  isNew,
}: {
  draft: CollectionDraft;
  products: PickableProduct[];
  locale: Locale;
  t: AdminDictionary;
  isNew: boolean;
}) {
  const [state, action, pending] = useActionState<
    CollectionFormState,
    FormData
  >(saveCollection, {});
  const errors = state.fieldErrors ?? {};

  const [automatic, setAutomatic] = useState(draft.rule !== null);
  const [members, setMembers] = useState<string[]>(draft.members);
  const [search, setSearch] = useState("");

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const available = useMemo(() => {
    const chosen = new Set(members);
    const query = search.trim().toLowerCase();
    return products
      .filter((p) => !chosen.has(p.id))
      .filter((p) =>
        query ? `${p.name} ${p.category}`.toLowerCase().includes(query) : true,
      )
      .slice(0, 40);
  }, [products, members, search]);

  const move = (index: number, delta: number) => {
    setMembers((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const slugError =
    errors.slug === "taken"
      ? t.collections.slugTaken
      : errors.slug === "invalid"
        ? t.collections.slugInvalid
        : errors.slug
          ? t.form.required
          : undefined;

  const field =
    "focus:ring-brand-500 mt-1.5 h-10 w-full rounded-lg bg-white px-3 text-sm ring-1 focus:ring-2 focus:outline-none";
  const ok = "ring-ink-300";
  const bad = "ring-sale ring-2";

  return (
    <form action={action} className="space-y-5">
      <input
        type="hidden"
        name="originalSlug"
        value={isNew ? "" : draft.slug}
      />

      <section className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="nameEn"
              className="text-ink-700 block text-xs font-semibold"
            >
              {t.collections.name} — {t.form.english}
            </label>
            <input
              id="nameEn"
              name="nameEn"
              defaultValue={draft.nameEn}
              dir="ltr"
              className={`${field} ${errors.nameEn ? bad : ok}`}
            />
            {errors.nameEn ? (
              <p className="text-sale mt-1 text-[11px]">{t.form.required}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="nameAr"
              className="text-ink-700 block text-xs font-semibold"
            >
              {t.collections.name} — {t.form.arabic}
            </label>
            <input
              id="nameAr"
              name="nameAr"
              defaultValue={draft.nameAr}
              dir="rtl"
              className={`${field} ${errors.nameAr ? bad : ok}`}
            />
            {errors.nameAr ? (
              <p className="text-sale mt-1 text-[11px]">
                {t.form.requiredArabic}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="slug"
              className="text-ink-700 block text-xs font-semibold"
            >
              {t.collections.slug}
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={draft.slug}
              dir="ltr"
              className={`${field} ${slugError ? bad : ok}`}
            />
            <p
              className={`mt-1 text-[11px] ${slugError ? "text-sale" : "text-ink-400"}`}
            >
              {slugError ?? t.collections.slugHint}
            </p>
          </div>

          <div>
            <label
              htmlFor="blurbEn"
              className="text-ink-700 block text-xs font-semibold"
            >
              {t.collections.blurbLabel} — {t.form.english}
            </label>
            <input
              id="blurbEn"
              name="blurbEn"
              defaultValue={draft.blurbEn}
              dir="ltr"
              className={`${field} ${ok}`}
            />
          </div>

          <div>
            <label
              htmlFor="blurbAr"
              className="text-ink-700 block text-xs font-semibold"
            >
              {t.collections.blurbLabel} — {t.form.arabic}
            </label>
            <input
              id="blurbAr"
              name="blurbAr"
              defaultValue={draft.blurbAr}
              dir="rtl"
              className={`${field} ${ok}`}
            />
          </div>

          <div>
            <label
              htmlFor="position"
              className="text-ink-700 block text-xs font-semibold"
            >
              {t.collections.position}
            </label>
            <input
              id="position"
              name="position"
              type="number"
              min={0}
              defaultValue={draft.position}
              dir="ltr"
              className={`${field} ${ok} w-24`}
            />
          </div>

          <label className="flex items-end gap-2.5 pb-2">
            <input
              type="checkbox"
              name="visible"
              defaultChecked={draft.visible}
              className="accent-brand-500 size-4"
            />
            <span className="text-ink-700 text-sm font-medium">
              {t.collections.visible}
            </span>
          </label>
        </div>
      </section>

      <section className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
        <h2 className="text-ink-900 text-sm font-bold">{t.collections.type}</h2>

        <div className="mt-3 space-y-2.5">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="radio"
              name="membership"
              checked={automatic}
              onChange={() => setAutomatic(true)}
              className="accent-brand-500 mt-0.5 size-4"
            />
            <span>
              <span className="text-ink-900 block text-sm font-semibold">
                {t.collections.automatic}
              </span>
              <span className="text-ink-500 block text-[11px] leading-relaxed">
                {t.collections.automaticHint}
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="radio"
              name="membership"
              checked={!automatic}
              onChange={() => setAutomatic(false)}
              className="accent-brand-500 mt-0.5 size-4"
            />
            <span>
              <span className="text-ink-900 block text-sm font-semibold">
                {t.collections.manual}
              </span>
              <span className="text-ink-500 block text-[11px] leading-relaxed">
                {t.collections.manualHint}
              </span>
            </span>
          </label>
        </div>

        {automatic ? (
          <div className="mt-4">
            <label
              htmlFor="rule"
              className="text-ink-700 block text-xs font-semibold"
            >
              {t.collections.rule}
            </label>
            <select
              id="rule"
              name="rule"
              defaultValue={draft.rule ?? COLLECTION_RULES[0]}
              className={`${field} ${ok}`}
            >
              {COLLECTION_RULES.map((rule) => (
                <option key={rule} value={rule}>
                  {COLLECTION_RULE_LABELS[rule][locale]}
                </option>
              ))}
            </select>
          </div>
        ) : (
          // The name is only submitted for curated collections; an empty rule is
          // what the action reads as "curated".
          <input type="hidden" name="rule" value="" />
        )}
      </section>

      {!automatic ? (
        <section className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
          <h2 className="text-ink-900 text-sm font-bold">
            {t.collections.choose}
          </h2>

          <p className="text-ink-500 mt-3 text-xs font-semibold">
            {t.collections.chosen} ({members.length})
          </p>

          {members.length === 0 ? (
            <p className="text-ink-400 mt-2 text-xs">{t.collections.empty}</p>
          ) : (
            <ol className="divide-ink-100 ring-ink-200 mt-2 divide-y rounded-lg ring-1">
              {members.map((id, index) => (
                <li key={id} className="flex items-center gap-2 px-3 py-1.5">
                  <input type="hidden" name="member" value={id} />
                  <span className="text-ink-400 w-5 text-[11px] tabular-nums">
                    {index + 1}
                  </span>
                  <span className="text-ink-800 flex-1 truncate text-sm">
                    {byId.get(id)?.name ?? id}
                  </span>
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={t.collections.moveUp}
                    className="text-ink-500 hover:bg-ink-100 rounded px-1.5 py-1 text-xs disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === members.length - 1}
                    aria-label={t.collections.moveDown}
                    className="text-ink-500 hover:bg-ink-100 rounded px-1.5 py-1 text-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setMembers((m) => m.filter((x) => x !== id))}
                    className="text-sale hover:bg-sale/10 rounded px-2 py-1 text-xs font-semibold"
                  >
                    {t.collections.remove}
                  </button>
                </li>
              ))}
            </ol>
          )}

          <p className="text-ink-500 mt-5 text-xs font-semibold">
            {t.collections.available}
          </p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.products.search}
            className={`${field} ${ok}`}
          />

          <ul className="divide-ink-100 ring-ink-200 mt-2 max-h-64 divide-y overflow-y-auto rounded-lg ring-1">
            {available.map((product) => (
              <li
                key={product.id}
                className="flex items-center gap-2 px-3 py-1.5"
              >
                <span className="text-ink-800 flex-1 truncate text-sm">
                  {product.name}
                </span>
                <span className="text-ink-400 text-[11px]">
                  {product.category}
                </span>
                <button
                  type="button"
                  onClick={() => setMembers((m) => [...m, product.id])}
                  className="text-brand-600 hover:bg-brand-50 rounded px-2 py-1 text-xs font-semibold"
                >
                  {t.collections.add_}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-brand-500 hover:bg-brand-600 h-11 rounded-lg px-6 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? t.form.saving : isNew ? t.form.create : t.form.save}
        </button>
        <Link
          href="/admin/collections"
          className="text-ink-600 hover:text-ink-900 text-sm font-semibold"
        >
          {t.form.cancel}
        </Link>
      </div>
    </form>
  );
}
