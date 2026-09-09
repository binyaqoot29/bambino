"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import {
  changePassword,
  saveProfile,
  signIn,
  signOut,
  signUp,
  type AccountState,
} from "@/lib/actions/account";
import { GOVERNORATE_LABELS, GOVERNORATES } from "@/lib/orders/types";
import { routes } from "@/lib/routes";

type Strings = Dictionary["account"];

const field =
  "focus:ring-ink-900 mt-1.5 h-12 w-full rounded-xl bg-white px-4 text-[15px] ring-1 transition-[box-shadow] duration-200 focus:outline-none";
const label = "text-ink-700 block text-[12px] font-medium";

function Field({
  id,
  name,
  text,
  error,
  hint,
  type = "text",
  defaultValue,
  autoComplete,
  dir,
  required,
}: {
  id: string;
  name: string;
  text: string;
  error?: string | null;
  hint?: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  dir?: "ltr" | "rtl";
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        dir={dir}
        required={required}
        aria-invalid={error ? true : undefined}
        className={`${field} ${error ? "ring-sale ring-2" : "ring-ink-200"}`}
      />
      {error ? (
        <p className="text-sale mt-1 text-[12px]">{error}</p>
      ) : hint ? (
        <p className="text-ink-400 mt-1 text-[12px]">{hint}</p>
      ) : null}
    </div>
  );
}

function useErrors(state: AccountState, s: Strings) {
  const errors = state.fieldErrors ?? {};
  return (key: string) => {
    const code = errors[key] as keyof Strings | undefined;
    return code ? String(s[code] ?? code) : null;
  };
}

/* -------------------------------------------------------------------------- */

export function SignInForm({
  locale,
  s,
  next,
  contactLabel,
}: {
  locale: Locale;
  s: Strings;
  next?: string;
  contactLabel: string;
}) {
  const [state, action, pending] = useActionState<AccountState, FormData>(
    signIn,
    {},
  );
  const err = useErrors(state, s);
  const kept = state.values ?? {};

  return (
    <form action={action} key={state.attempt ?? 0} className="space-y-4">
      <input type="hidden" name="lang" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field
        id="signin-email"
        name="email"
        type="email"
        text={s.email}
        defaultValue={kept.email}
        autoComplete="email"
        dir="ltr"
        required
        error={err("email")}
      />
      <Field
        id="signin-password"
        name="password"
        type="password"
        text={s.password}
        autoComplete="current-password"
        dir="ltr"
        required
        error={err("password")}
      />
      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? s.signingIn : s.signInCta}
      </Button>
      <p className="text-ink-500 text-[13px] leading-relaxed">
        {s.forgot}{" "}
        <Link
          href={routes.help(locale, "contact")}
          className="link-draw text-ink-800"
        >
          {contactLabel}
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({
  locale,
  s,
  next,
}: {
  locale: Locale;
  s: Strings;
  next?: string;
}) {
  const [state, action, pending] = useActionState<AccountState, FormData>(
    signUp,
    {},
  );
  const err = useErrors(state, s);
  const kept = state.values ?? {};

  return (
    <form action={action} key={state.attempt ?? 0} className="space-y-4">
      <input type="hidden" name="lang" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Field
        id="signup-name"
        name="name"
        text={s.name}
        defaultValue={kept.name}
        autoComplete="name"
        required
        error={err("name")}
      />
      <Field
        id="signup-email"
        name="email"
        type="email"
        text={s.email}
        defaultValue={kept.email}
        autoComplete="email"
        dir="ltr"
        required
        error={err("email")}
      />
      <Field
        id="signup-password"
        name="password"
        type="password"
        text={s.password}
        hint={s.passwordHint}
        autoComplete="new-password"
        dir="ltr"
        required
        error={err("password")}
      />
      {state.status === "failed" ? (
        <p role="alert" className="text-sale text-[13px]">
          {s.failed}
        </p>
      ) : null}
      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? s.creating : s.signUpCta}
      </Button>
    </form>
  );
}

export function ProfileForm({
  locale,
  s,
  dict,
  initial,
}: {
  locale: Locale;
  s: Strings;
  dict: Dictionary;
  initial: Record<string, string>;
}) {
  const [state, action, pending] = useActionState<AccountState, FormData>(
    saveProfile,
    {},
  );
  const err = useErrors(state, s);
  const kept = { ...initial, ...(state.values ?? {}) };
  const c = dict.checkout;

  return (
    <form action={action} key={state.attempt ?? 0} className="space-y-6">
      <input type="hidden" name="lang" value={locale} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="p-name"
          name="name"
          text={s.name}
          defaultValue={kept.name}
          autoComplete="name"
          required
          error={err("name")}
        />
        <Field
          id="p-phone"
          name="phone"
          type="tel"
          text={s.phone}
          defaultValue={kept.phone}
          autoComplete="tel"
          dir="ltr"
          hint={c.phoneHint}
        />
      </div>

      <div>
        <p className="font-display text-ink-900 text-xl">{s.address}</p>
        <p className="text-ink-500 mt-1 text-[13px]">{s.addressHint}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="p-governorate" className={label}>
              {c.governorate}
            </label>
            <select
              id="p-governorate"
              name="governorate"
              defaultValue={kept.governorate ?? ""}
              className={`${field} ring-ink-200`}
            >
              <option value="">{c.chooseGovernorate}</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {GOVERNORATE_LABELS[g][locale]}
                </option>
              ))}
            </select>
          </div>
          {(
            [
              ["area", c.area],
              ["block", c.block],
              ["street", c.street],
              ["building", c.building],
            ] as const
          ).map(([name, text]) => (
            <Field
              key={name}
              id={`p-${name}`}
              name={name}
              text={text}
              defaultValue={kept[name]}
            />
          ))}
          <div className="sm:col-span-2">
            <Field
              id="p-extra"
              name="extra"
              text={c.extra}
              defaultValue={kept.extra}
              hint={c.extraHint}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? s.saving : s.save}
        </Button>
        {state.status === "saved" ? (
          <p
            role="status"
            className="text-success inline-flex items-center gap-2 text-[13px]"
          >
            <CheckIcon className="size-4" />
            {s.saved}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function PasswordForm({ locale, s }: { locale: Locale; s: Strings }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(
    changePassword,
    {},
  );
  const err = useErrors(state, s);

  return (
    <form action={action} key={state.attempt ?? 0} className="space-y-4">
      <input type="hidden" name="lang" value={locale} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="pw-current"
          name="currentPassword"
          type="password"
          text={s.currentPassword}
          autoComplete="current-password"
          dir="ltr"
          required
          error={err("currentPassword")}
        />
        <Field
          id="pw-new"
          name="newPassword"
          type="password"
          text={s.newPassword}
          hint={s.passwordHint}
          autoComplete="new-password"
          dir="ltr"
          required
          error={err("newPassword")}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? s.saving : s.changePassword}
        </Button>
        {state.status === "passwordChanged" ? (
          <p
            role="status"
            className="text-success inline-flex items-center gap-2 text-[13px]"
          >
            <CheckIcon className="size-4" />
            {s.passwordChanged}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function SignOutButton({ locale, s }: { locale: Locale; s: Strings }) {
  return (
    <form action={signOut}>
      <input type="hidden" name="lang" value={locale} />
      <Button type="submit" variant="ghost" size="sm">
        {s.signOut}
      </Button>
    </form>
  );
}
