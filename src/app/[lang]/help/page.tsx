import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { routes } from "@/lib/routes";

/** `/help` on its own lands on the questions people ask most. */
export default async function HelpIndex({ params }: PageProps<"/[lang]/help">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  redirect(routes.help(lang, "faq"));
}
