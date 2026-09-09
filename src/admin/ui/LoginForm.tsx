"use client";

import { useActionState } from "react";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { login } from "@/admin/actions";
import type { AdminDictionary } from "@/admin/i18n";

export function LoginForm({ t }: { t: AdminDictionary }) {
  const [state, action, pending] = useActionState(login, {
    error: undefined,
  } as {
    error?: string;
  });

  return (
    <div className="rounded-card mx-auto max-w-sm bg-white p-10 shadow-[var(--shadow-lift)]">
      <BambinoMark className="text-brand-500 mx-auto h-14 w-auto" />
      <h1 className="font-display text-ink-900 mt-6 text-center text-3xl">
        {t.signIn}
      </h1>
      <p className="text-ink-500 mt-2 text-center text-[13px]">
        {t.signInBlurb}
      </p>

      <form action={action} className="mt-8">
        <label
          htmlFor="password"
          className="text-ink-700 block text-[12px] font-medium"
        >
          {t.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          required
          className="ring-ink-300 focus:ring-ink-900 mt-2 h-12 w-full rounded-full px-4 text-sm ring-1 transition-[box-shadow] duration-200 focus:outline-none"
        />

        {state?.error ? (
          <p role="alert" className="text-sale mt-3 text-xs">
            {t.wrongPassword}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="bg-brand-900 hover:bg-brand-800 mt-6 h-12 w-full rounded-full text-[13px] font-medium tracking-[0.06em] text-white uppercase transition-colors duration-200 disabled:opacity-40 [html[lang=ar]_&]:tracking-normal [html[lang=ar]_&]:normal-case"
        >
          {pending ? t.signingIn : t.signIn}
        </button>
      </form>
    </div>
  );
}
