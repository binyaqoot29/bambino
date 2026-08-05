"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ProductIndex } from "@/lib/catalog/index-client";

const Context = createContext<ProductIndex | null>(null);

export function CatalogProvider({
  index,
  children,
}: {
  index: ProductIndex;
  children: ReactNode;
}) {
  return <Context.Provider value={index}>{children}</Context.Provider>;
}

export function useCatalog() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
