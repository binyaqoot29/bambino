import { redirect } from "next/navigation";

import { resolveLocale } from "@/i18n/resolve-locale";

/**
 * Per request, explicitly. This page sits outside [lang] and doesn't inherit
 * that layout's setting; the redirect depends on a database read and a header,
 * and depending on statement order to make a page dynamic is a trap.
 */
export const dynamic = "force-dynamic";

/** `/` → the visitor's language. See `resolveLocale` for the order. */
export default async function RootPage() {
  redirect(`/${await resolveLocale()}`);
}
