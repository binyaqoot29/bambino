"use client";

import { useActionState } from "react";

import { saveShipping, type ShippingFormState } from "@/admin/actions";
import type { AdminDictionary } from "@/admin/i18n";
import { formatDinarsInput, type ShippingSettings } from "@/lib/settings";

/** A dinar amount, with the unit shown so the scale is never in doubt. */
function Money({
  name,
  label,
  hint,
  value,
  error,
  kd,
}: {
  name: string;
  label: string;
  hint: string;
  value: number;
  error?: string;
  kd: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-ink-700 block text-xs font-semibold"
      >
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          id={name}
          name={name}
          defaultValue={formatDinarsInput(value)}
          inputMode="decimal"
          dir="ltr"
          aria-invalid={error ? true : undefined}
          className={`focus:ring-brand-500 h-10 w-32 rounded-lg bg-white px-3 text-sm ring-1 focus:ring-2 focus:outline-none ${
            error ? "ring-sale ring-2" : "ring-ink-300"
          }`}
        />
        <span className="text-ink-500 text-sm font-medium">{kd}</span>
      </div>
      <p className={`mt-1 text-[11px] ${error ? "text-sale" : "text-ink-400"}`}>
        {error ?? hint}
      </p>
    </div>
  );
}

export function ShippingForm({
  settings,
  t,
}: {
  settings: ShippingSettings;
  t: AdminDictionary;
}) {
  const [state, action, pending] = useActionState<ShippingFormState, FormData>(
    saveShipping,
    {},
  );
  const errors = state.fieldErrors ?? {};
  const amountError = (key: string) =>
    errors[key] ? t.shipping.invalidAmount : undefined;

  return (
    <form action={action} className="space-y-5">
      <section className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
        <h2 className="text-ink-900 text-sm font-bold">{t.shipping.rates}</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Money
            name="freeThreshold"
            label={t.shipping.freeThreshold}
            hint={t.shipping.freeThresholdHint}
            value={settings.freeThreshold}
            error={amountError("freeThreshold")}
            kd={t.shipping.kd}
          />
          <Money
            name="flatRate"
            label={t.shipping.flatRate}
            hint={t.shipping.flatRateHint}
            value={settings.flatRate}
            error={amountError("flatRate")}
            kd={t.shipping.kd}
          />
        </div>
      </section>

      <section className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
        <h2 className="text-ink-900 text-sm font-bold">{t.shipping.cod}</h2>

        <label className="mt-3 flex items-center gap-2.5">
          <input
            type="checkbox"
            name="codEnabled"
            defaultChecked={settings.codEnabled}
            className="accent-brand-500 size-4"
          />
          <span className="text-ink-700 text-sm font-medium">
            {t.shipping.codEnabled}
          </span>
        </label>

        <div className="mt-4">
          <Money
            name="codFee"
            label={t.shipping.codFee}
            hint={t.shipping.codFeeHint}
            value={settings.codFee}
            error={amountError("codFee")}
            kd={t.shipping.kd}
          />
        </div>
      </section>

      <section className="ring-ink-200 rounded-xl bg-white p-5 ring-1">
        <h2 className="text-ink-900 text-sm font-bold">
          {t.shipping.promises}
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="deliveryEn"
              className="text-ink-700 block text-xs font-semibold"
            >
              {t.shipping.deliveryWindow} — {t.form.english}
            </label>
            <input
              id="deliveryEn"
              name="deliveryEn"
              defaultValue={settings.deliveryWindow.en}
              dir="ltr"
              aria-invalid={errors.deliveryEn ? true : undefined}
              className={`focus:ring-brand-500 mt-1.5 h-10 w-full rounded-lg bg-white px-3 text-sm ring-1 focus:ring-2 focus:outline-none ${
                errors.deliveryEn ? "ring-sale ring-2" : "ring-ink-300"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="deliveryAr"
              className="text-ink-700 block text-xs font-semibold"
            >
              {t.shipping.deliveryWindow} — {t.form.arabic}
            </label>
            <input
              id="deliveryAr"
              name="deliveryAr"
              defaultValue={settings.deliveryWindow.ar}
              dir="rtl"
              aria-invalid={errors.deliveryAr ? true : undefined}
              className={`focus:ring-brand-500 mt-1.5 h-10 w-full rounded-lg bg-white px-3 text-sm ring-1 focus:ring-2 focus:outline-none ${
                errors.deliveryAr ? "ring-sale ring-2" : "ring-ink-300"
              }`}
            />
            <p className="text-ink-400 mt-1 text-[11px]">
              {t.shipping.deliveryWindowHint}
            </p>
          </div>

          <div>
            <label
              htmlFor="returnsDays"
              className="text-ink-700 block text-xs font-semibold"
            >
              {t.shipping.returnsDays}
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="returnsDays"
                name="returnsDays"
                type="number"
                min={0}
                max={365}
                defaultValue={settings.returnsDays}
                dir="ltr"
                aria-invalid={errors.returnsDays ? true : undefined}
                className={`focus:ring-brand-500 h-10 w-24 rounded-lg bg-white px-3 text-sm ring-1 focus:ring-2 focus:outline-none ${
                  errors.returnsDays ? "ring-sale ring-2" : "ring-ink-300"
                }`}
              />
              <span className="text-ink-500 text-sm font-medium">
                {t.shipping.days}
              </span>
            </div>
            {errors.returnsDays ? (
              <p className="text-sale mt-1 text-[11px]">
                {t.shipping.invalidDays}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-500 hover:bg-brand-600 h-11 rounded-lg px-6 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? t.form.saving : t.form.save}
      </button>
    </form>
  );
}
