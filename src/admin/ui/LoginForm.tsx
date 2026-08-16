"use client";

import { useActionState } from "react";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { login } from "@/admin/actions";
import type { AdminDictionary } from "@/admin/i18n";

export function LoginForm({ t }: { t: AdminDictionary }) {
  const [state, action, pending] = useActionState(login, { error: undefined } as {
    error?: string;
  });

  return (
    <div className="ring-ink-200 mx-auto max-w-sm rounded-xl bg-white p-8 ring-1">
      <BambinoMark className="text-brand-500 mx-auto h-12 w-auto" />
      <h1 className="text-ink-900 mt-5 text-center text-lg font-bold">
        {t.signIn}
      </h1>
      <p className="text-ink-500 mt-1 text-center text-xs">
        {t.signInBlurb}
      </p>

      <form action={action} className="mt-6">
        <label
          htmlFor="password"
          className="text-ink-700 block text-xs font-semibold"
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
          className="ring-ink-300 focus:ring-brand-500 mt-1.5 h-11 w-full rounded-lg px-3 text-sm ring-1 focus:ring-2 focus:outline-none"
        />

        {state?.error ? (
          <p role="alert" className="text-sale mt-2 text-xs font-medium">
            {t.wrongPassword}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="bg-brand-500 hover:bg-brand-600 mt-5 h-11 w-full rounded-lg text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? t.signingIn : t.signIn}
        </button>
      </form>
    </div>
  );
}
