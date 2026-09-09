"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import { sendMessage, type ContactState } from "@/lib/actions/contact";

type Labels = {
  name: string;
  email: string;
  phone: string;
  message: string;
  send: string;
  sending: string;
  sent: string;
  required: string;
  invalidEmail: string;
  needContact: string;
  tooShort: string;
  failed: string;
};

/**
 * One name, one way to reach back, one message. Fields remount per attempt
 * so a rejected submit keeps everything typed (see ContactState.values).
 */
export function ContactForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Labels;
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(
    sendMessage,
    {},
  );
  const kept = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  const errorText = (key: string) => {
    const code = errors[key];
    return code ? labels[code] : null;
  };

  if (state.status === "sent") {
    return (
      <p
        role="status"
        className="bg-canvas text-ink-800 flex items-start gap-3 rounded-2xl p-5 text-[15px] leading-relaxed"
      >
        <span className="bg-success/12 text-success inline-flex size-8 shrink-0 items-center justify-center rounded-full">
          <CheckIcon className="size-4.5" />
        </span>
        {labels.sent}
      </p>
    );
  }

  const field =
    "focus:ring-ink-900 mt-1.5 w-full rounded-xl bg-white px-4 text-[15px] ring-1 transition-[box-shadow] duration-200 focus:outline-none";
  const label = "text-ink-700 block text-[12px] font-medium";

  return (
    <form action={action} key={state.attempt ?? 0} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: hidden from people, filled by bots. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="contact-name" className={label}>
          {labels.name}
        </label>
        <input
          id="contact-name"
          name="name"
          required
          defaultValue={kept.name}
          autoComplete="name"
          className={`${field} h-12 ${errors.name ? "ring-sale ring-2" : "ring-ink-200"}`}
        />
        {errorText("name") ? (
          <p className="text-sale mt-1 text-[12px]">{errorText("name")}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-email" className={label}>
            {labels.email}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            defaultValue={kept.email}
            autoComplete="email"
            dir="ltr"
            className={`${field} h-12 ${errors.email ? "ring-sale ring-2" : "ring-ink-200"}`}
          />
          {errorText("email") ? (
            <p className="text-sale mt-1 text-[12px]">{errorText("email")}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-phone" className={label}>
            {labels.phone}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            defaultValue={kept.phone}
            autoComplete="tel"
            dir="ltr"
            className={`${field} ring-ink-200 h-12`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={label}>
          {labels.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          defaultValue={kept.message}
          className={`${field} py-3 ${errors.message ? "ring-sale ring-2" : "ring-ink-200"}`}
        />
        {errorText("message") ? (
          <p className="text-sale mt-1 text-[12px]">{errorText("message")}</p>
        ) : null}
      </div>

      {state.status === "failed" ? (
        <p role="alert" className="text-sale text-[13px]">
          {labels.failed}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? labels.sending : labels.send}
      </Button>
    </form>
  );
}
