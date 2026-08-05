"use client";

import { useEffect, useState } from "react";

import { ReturnIcon, TruckIcon, CardIcon } from "@/components/ui/Icons";

const ICONS = [TruckIcon, ReturnIcon, CardIcon];

/**
 * Rotating announcement strip. All three messages are in the DOM so the whole
 * set is announced once to screen readers, with only one visible at a time.
 */
export function AnnouncementBar({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      5000,
    );
    return () => window.clearInterval(id);
  }, [messages.length]);

  return (
    <div className="bg-brand-900 text-mint-200 text-xs">
      <div className="container-bambino flex h-9 items-center justify-center">
        <ul className="relative grid">
          {messages.map((message, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li
                key={message}
                aria-hidden={i !== index}
                className={`col-start-1 row-start-1 flex items-center justify-center gap-2 transition-opacity duration-500 ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <Icon className="size-4 shrink-0 opacity-80" />
                <span className="text-center">{message}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
