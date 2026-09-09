"use client";

import { useActionState } from "react";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import {
  subscribeToNewsletter,
  type NewsletterState,
} from "@/lib/actions/newsletter";

/**
 * Footer signup on plum: a serif invitation, one field, one button.
 *
 * "Already subscribed" is shown as success on purpose: distinguishing it would
 * let anyone test whether a given address is on the list.
 */
export function Newsletter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(
    subscribeToNewsletter,
    {},
  );

  const done = state.status === "added" || state.status === "already";
  const invalid = state.status === "invalid";

  return (
    <section aria-labelledby="newsletter-heading">
      <div className="container-bambino grid items-center gap-10 py-16 lg:grid-cols-[1fr_auto] lg:py-24">
        <div className="flex items-start gap-6">
          <BambinoMark className="hidden h-16 w-auto shrink-0 text-white/70 sm:block" />
          <div>
            <h2
              id="newsletter-heading"
              className="font-display text-3xl leading-tight sm:text-4xl"
            >
              {dict.home.newsletterTitle}
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">
              {dict.home.newsletterBody}
            </p>
          </div>
        </div>

        {done ? (
          <p
            role="status"
            className="inline-flex items-center gap-3 text-sm text-white/90"
          >
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-white/15">
              <CheckIcon className="size-4.5" />
            </span>
            {dict.home.newsletterThanks}
          </p>
        ) : (
          <form action={action} className="w-full lg:w-auto">
            <input type="hidden" name="locale" value={locale} />
            <div className="flex flex-col gap-3 sm:flex-row lg:w-[28rem]">
              <label htmlFor="newsletter-email" className="sr-only">
                {dict.home.newsletterPlaceholder}
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                dir="ltr"
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? "newsletter-error" : undefined}
                placeholder={dict.home.newsletterPlaceholder}
                className={`h-12 min-w-0 flex-1 rounded-full bg-white/8 px-5 text-sm text-white ring-1 transition-[background-color,box-shadow] duration-300 placeholder:text-white/40 focus:bg-white/12 focus:outline-none ${
                  invalid
                    ? "ring-2 ring-white/70"
                    : "ring-white/20 focus:ring-white/50"
                }`}
              />
              <Button
                type="submit"
                variant="light"
                size="md"
                disabled={pending}
              >
                {dict.home.newsletterCta}
              </Button>
            </div>
            <p
              id={invalid ? "newsletter-error" : undefined}
              className={`mt-3 text-xs ${invalid ? "text-white" : "text-white/45"}`}
            >
              {invalid ? dict.home.newsletterInvalid : dict.home.newsletterNote}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
