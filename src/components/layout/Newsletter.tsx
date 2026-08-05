"use client";

import { useState } from "react";

import { BambinoMark } from "@/components/brand/BambinoMark";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Newsletter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [done, setDone] = useState(false);

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="border-mint-300/15 border-b"
    >
      <div className="container-bambino grid items-center gap-8 py-14 lg:grid-cols-[1fr_auto] lg:py-16">
        <div className="flex items-start gap-5">
          <BambinoMark className="text-mint-300/70 hidden h-16 w-auto shrink-0 sm:block" />
          <div>
            <h2
              id="newsletter-heading"
              className="text-2xl font-medium tracking-tight sm:text-3xl"
            >
              {dict.home.newsletterTitle}
            </h2>
            <p className="text-mint-200/80 mt-2 max-w-md text-sm leading-relaxed">
              {dict.home.newsletterBody}
            </p>
          </div>
        </div>

        {done ? (
          <p
            role="status"
            className="text-mint-200 inline-flex items-center gap-2 text-sm"
          >
            <span className="bg-mint-300/20 inline-flex size-8 items-center justify-center rounded-full">
              <CheckIcon className="size-4.5" />
            </span>
            {locale === "ar" ? "شكراً لانضمامك!" : "Thanks for joining!"}
          </p>
        ) : (
          <form
            className="w-full lg:w-auto"
            onSubmit={(event) => {
              event.preventDefault();
              setDone(true);
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row lg:w-[26rem]">
              <label htmlFor="newsletter-email" className="sr-only">
                {dict.home.newsletterPlaceholder}
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                placeholder={dict.home.newsletterPlaceholder}
                className="ring-mint-300/25 placeholder:text-mint-200/50 focus:ring-mint-300 h-12 min-w-0 flex-1 rounded-full bg-white/5 px-5 text-sm text-white ring-1 focus:outline-none"
              />
              <Button type="submit" variant="quiet" size="md">
                {dict.home.newsletterCta}
              </Button>
            </div>
            <p className="text-mint-200/50 mt-3 text-xs">
              {dict.home.newsletterNote}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
