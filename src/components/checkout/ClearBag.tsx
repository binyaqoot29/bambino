"use client";

import { useEffect } from "react";

import { useBag } from "@/components/cart/store";

const KEY = "bambino.lastOrder";

/**
 * Empties the bag once the order exists.
 *
 * It happens here rather than in the checkout action because the action
 * redirects — the form unmounts before it could clear anything, and the bag
 * lives in the browser where the server can't reach it.
 *
 * Guarded by the order reference so that revisiting or refreshing a
 * confirmation page doesn't wipe a bag the shopper has since refilled.
 */
export function ClearBag({ reference }: { reference: string }) {
  const { clear } = useBag();

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY) === reference) return;
      window.localStorage.setItem(KEY, reference);
    } catch {
      // Storage unavailable (private window): clearing once is still right,
      // it just won't be remembered.
    }
    clear();
  }, [reference, clear]);

  return null;
}
