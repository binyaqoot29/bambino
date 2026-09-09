import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { resolveLocale } from "@/i18n/resolve-locale";

export const dynamic = "force-dynamic";

/**
 * A locale-less deeper link — `/c/prams`, `/collections/sale` — sent to the
 * same path under the visitor's language, query string intact.
 *
 * This replaced `src/proxy.ts`. Next 16's proxy is Node-runtime by design (the
 * `runtime` option is forbidden there), which on Cloudflare Workers is an
 * experimental, unsupported path — for a redirect that needs nothing Node.
 * A page can do the same job on any host, and can read the database, so it
 * honours the Arabic-enabled setting where middleware never could.
 *
 * Single-segment paths like `/about` never reach here: `[lang]` claims them
 * first, so the locale layout handles that case. And a path that already
 * starts with a locale is a genuine 404, not something to redirect — without
 * that guard, `/en/nonexistent` would become `/en/en/nonexistent`.
 */
export default async function LocaleLessPath({
  params,
  searchParams,
}: PageProps<"/[...path]">) {
  const [{ path }, query] = await Promise.all([params, searchParams]);

  if (path.length === 0 || isLocale(path[0])) notFound();

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const v of Array.isArray(value) ? value : value ? [value] : []) {
      search.append(key, v);
    }
  }
  const tail = search.toString();

  redirect(`/${await resolveLocale()}/${path.join("/")}${tail ? `?${tail}` : ""}`);
}
