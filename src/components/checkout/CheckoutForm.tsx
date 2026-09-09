"use client";

import Link from "next/link";
import { useActionState } from "react";

import { useBag } from "@/components/cart/store";
import { useCatalog } from "@/components/catalog/CatalogProvider";
import { ProductArt } from "@/components/product/ProductArt";
import { BambinoMark } from "@/components/brand/BambinoMark";
import { ButtonLink } from "@/components/ui/Button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { submitOrder, type CheckoutState } from "@/lib/actions/checkout";
import { formatPrice, shippingFor, type ShippingRates } from "@/lib/money";
import { GOVERNORATES, GOVERNORATE_LABELS } from "@/lib/orders/types";
import { routes } from "@/lib/routes";

export function CheckoutForm({
  locale,
  dict,
  rates,
  codEnabled,
  codFee,
}: {
  locale: Locale;
  dict: Dictionary;
  rates: ShippingRates;
  codEnabled: boolean;
  codFee: number;
}) {
  const { lines, ready } = useBag();
  const { products, sizeLabels } = useCatalog();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(
    submitOrder,
    {},
  );

  const t = dict.checkout;
  const errors = state.fieldErrors ?? {};

  /**
   * What the shopper last typed, so a rejected field doesn't cost them the
   * whole form. `defaultValue` only applies on mount, so the fields are keyed
   * on the attempt number — a failed submit remounts them with these values.
   */
  const kept = state.values ?? {};
  const attempt = state.attempt ?? 0;

  // The bag lives in localStorage, so there is nothing to show until it's read.
  if (!ready) return <div className="min-h-[60vh]" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="container-bambino py-16">
        <div className="bg-canvas-mint mx-auto flex max-w-xl flex-col items-center rounded-[2rem] px-6 py-20 text-center">
          <BambinoMark className="text-mint-400 h-20 w-auto" />
          <h1 className="text-brand-900 mt-6 text-2xl font-medium">{t.empty}</h1>
          <p className="text-ink-500 mt-2 text-sm">{t.emptyBody}</p>
          <ButtonLink href={routes.home(locale)} className="mt-7">
            {dict.cart.continueShopping}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const priced = lines.map((line) => ({
    line,
    product: products[line.productId],
  }));
  const subtotal = priced.reduce(
    (n, { line, product }) => n + (product ? product.price * line.quantity : 0),
    0,
  );
  const delivery = shippingFor(subtotal, rates);
  const cod = codEnabled ? codFee : 0;
  const total = subtotal + delivery + cod;

  /**
   * What the browser is trusted to say: which variant, how many. No prices —
   * the server looks all of those up again before charging anything.
   */
  const payload = JSON.stringify(
    lines.map((l) => ({
      productId: l.productId,
      size: l.size,
      colour: l.colour,
      quantity: l.quantity,
    })),
  );

  const field =
    "focus:ring-brand-500 mt-1.5 h-11 w-full rounded-xl bg-white px-3.5 text-sm ring-1 focus:ring-2 focus:outline-none";
  const ok = "ring-ink-200";
  const bad = "ring-sale ring-2";
  const label = "text-ink-700 block text-xs font-semibold";

  const errorText = (key: string) => {
    const code = errors[key];
    if (!code) return null;
    if (code === "phone") return t.invalidPhone;
    if (code === "email") return t.invalidEmail;
    return t.required;
  };

  return (
    <form action={action} className="container-bambino py-8 lg:py-12">
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="lines" value={payload} />

      <h1 className="text-brand-900 text-3xl font-semibold tracking-tight sm:text-4xl">
        {t.title}
      </h1>

      {state.unavailable?.length ? (
        <p className="bg-sale/10 text-sale mt-5 rounded-xl px-4 py-3 text-sm font-medium">
          {t.unavailable} {state.unavailable.join("، ")}
        </p>
      ) : null}
      {state.error ? (
        <p className="bg-sale/10 text-sale mt-5 rounded-xl px-4 py-3 text-sm font-medium">
          {state.error === "out-of-stock"
            ? t.outOfStock
            : state.error === "empty"
              ? t.emptyBody
              : t.failed}
        </p>
      ) : null}

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-12">
        <div key={attempt} className="space-y-6">
          <section className="ring-ink-200 rounded-2xl bg-white p-5 ring-1 sm:p-6">
            <h2 className="text-ink-900 text-sm font-bold">{t.contact}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="customerName" className={label}>
                  {t.name}
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  defaultValue={kept.customerName ?? ""}
                  autoComplete="name"
                  aria-invalid={errors.customerName ? true : undefined}
                  className={`${field} ${errors.customerName ? bad : ok}`}
                />
                {errorText("customerName") ? (
                  <p className="text-sale mt-1 text-[11px]">
                    {errorText("customerName")}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="phone" className={label}>
                  {t.phone}
                </label>
                <input
                  id="phone"
                  name="phone"
                  defaultValue={kept.phone ?? ""}
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  autoComplete="tel"
                  placeholder="9000 0000"
                  aria-invalid={errors.phone ? true : undefined}
                  className={`${field} ${errors.phone ? bad : ok}`}
                />
                <p
                  className={`mt-1 text-[11px] ${errors.phone ? "text-sale" : "text-ink-400"}`}
                >
                  {errorText("phone") ?? t.phoneHint}
                </p>
              </div>

              <div>
                <label htmlFor="email" className={label}>
                  {t.email}
                </label>
                <input
                  id="email"
                  name="email"
                  defaultValue={kept.email ?? ""}
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  aria-invalid={errors.email ? true : undefined}
                  className={`${field} ${errors.email ? bad : ok}`}
                />
                <p
                  className={`mt-1 text-[11px] ${errors.email ? "text-sale" : "text-ink-400"}`}
                >
                  {errorText("email") ?? t.emailOptional}
                </p>
              </div>
            </div>
          </section>

          <section className="ring-ink-200 rounded-2xl bg-white p-5 ring-1 sm:p-6">
            <h2 className="text-ink-900 text-sm font-bold">{t.delivery}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="governorate" className={label}>
                  {t.governorate}
                </label>
                <select
                  id="governorate"
                  name="governorate"
                  defaultValue={kept.governorate ?? ""}
                  aria-invalid={errors.governorate ? true : undefined}
                  className={`${field} ${errors.governorate ? bad : ok}`}
                >
                  <option value="" disabled>
                    {t.chooseGovernorate}
                  </option>
                  {GOVERNORATES.map((g) => (
                    <option key={g} value={g}>
                      {GOVERNORATE_LABELS[g][locale]}
                    </option>
                  ))}
                </select>
              </div>

              {(
                [
                  ["area", t.area],
                  ["block", t.block],
                  ["street", t.street],
                  ["building", t.building],
                ] as const
              ).map(([name, text]) => (
                <div key={name}>
                  <label htmlFor={name} className={label}>
                    {text}
                  </label>
                  <input
                    id={name}
                    name={name}
                    defaultValue={kept[name] ?? ""}
                    aria-invalid={errors[name] ? true : undefined}
                    className={`${field} ${errors[name] ? bad : ok}`}
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label htmlFor="extra" className={label}>
                  {t.extra}
                </label>
                <input
                  id="extra"
                  name="extra"
                  defaultValue={kept.extra ?? ""}
                  className={`${field} ${ok}`}
                />
                <p className="text-ink-400 mt-1 text-[11px]">{t.extraHint}</p>
              </div>
            </div>
          </section>

          <section className="ring-ink-200 rounded-2xl bg-white p-5 ring-1 sm:p-6">
            <h2 className="text-ink-900 text-sm font-bold">{t.payment}</h2>

            <div className="mt-4 space-y-2.5">
              <label className="ring-brand-200 bg-brand-50/40 flex cursor-pointer items-start gap-3 rounded-xl p-3.5 ring-1">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  defaultChecked
                  className="accent-brand-500 mt-0.5 size-4"
                />
                <span>
                  <span className="text-ink-900 block text-sm font-semibold">
                    {t.cod}
                  </span>
                  <span className="text-ink-500 block text-xs">{t.codBody}</span>
                </span>
              </label>

              {/* Shown, disabled, and labelled — so the shopper knows card
                  payment is coming rather than assuming the shop won't take it. */}
              <label className="ring-ink-200 flex items-start gap-3 rounded-xl p-3.5 opacity-55 ring-1">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="knet"
                  disabled
                  className="mt-0.5 size-4"
                />
                <span>
                  <span className="text-ink-700 block text-sm font-semibold">
                    {t.knet}
                  </span>
                  <span className="text-ink-400 block text-xs">
                    {t.knetSoon}
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-5">
              <label htmlFor="note" className={label}>
                {t.note}
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                defaultValue={kept.note ?? ""}
                className="ring-ink-200 focus:ring-brand-500 mt-1.5 w-full rounded-xl bg-white px-3.5 py-2.5 text-sm ring-1 focus:ring-2 focus:outline-none"
              />
              <p className="text-ink-400 mt-1 text-[11px]">{t.noteHint}</p>
            </div>
          </section>
        </div>

        <aside className="ring-ink-200 rounded-2xl bg-white p-5 ring-1 lg:sticky lg:top-24">
          <h2 className="text-ink-900 text-sm font-bold">{t.summary}</h2>

          <ul className="divide-ink-100 mt-4 divide-y">
            {priced.map(({ line, product }) =>
              product ? (
                <li key={line.key} className="flex items-center gap-3 py-2.5">
                  <ProductArt
                    art={product.art}
                    seed={product.id}
                    src={product.image}
                    sizes="44px"
                    className="size-11 shrink-0 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-ink-900 truncate text-xs font-medium">
                      {product.name}
                    </p>
                    <p className="text-ink-400 text-[11px]">
                      {product.colours[line.colour]?.name ?? line.colour} ·{" "}
                      {sizeLabels[line.size] ?? line.size} × {line.quantity}
                    </p>
                  </div>
                  <span className="text-ink-800 text-xs font-semibold tabular-nums">
                    {formatPrice(product.price * line.quantity, locale)}
                  </span>
                </li>
              ) : null,
            )}
          </ul>

          <dl className="border-ink-100 mt-4 space-y-1.5 border-t pt-4 text-sm">
            <Row label={t.subtotal} value={formatPrice(subtotal, locale)} />
            <Row
              label={t.deliveryFee}
              value={delivery === 0 ? t.free : formatPrice(delivery, locale)}
              muted={delivery === 0}
            />
            {cod > 0 ? (
              <Row label={t.codFee} value={formatPrice(cod, locale)} />
            ) : null}
            <div className="border-ink-100 mt-2 flex items-baseline justify-between border-t pt-3">
              <dt className="text-ink-900 font-semibold">{t.total}</dt>
              <dd className="text-brand-900 text-lg font-bold tabular-nums">
                {formatPrice(total, locale)}
              </dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={pending}
            className="bg-brand-500 hover:bg-brand-600 mt-5 h-12 w-full rounded-full text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? t.placing : t.place}
          </button>

          <Link
            href={routes.cart(locale)}
            className="text-ink-500 hover:text-brand-600 mt-3 block text-center text-xs font-medium"
          >
            {t.backToBag}
          </Link>
        </aside>
      </div>
    </form>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd
        className={`tabular-nums ${muted ? "text-success font-semibold" : "text-ink-800"}`}
      >
        {value}
      </dd>
    </div>
  );
}
