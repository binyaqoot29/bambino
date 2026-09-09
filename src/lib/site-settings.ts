import { cache } from "react";

import { getDb, schema } from "@/db";
import { snapshot } from "@/lib/cache/snapshot";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEYS,
  type LanguageSettings,
  type ShippingSettings,
  type SiteSettings,
  type SocialLinks,
} from "./settings";

/**
 * Reads site settings, falling back to defaults for anything unset.
 *
 * Cached per request — the footer asks for it on every page, and a missing row
 * should never be an error, just an unset value.
 *
 * Each group is spread over its defaults rather than replacing them, so a
 * setting added after a row was written reads as its default instead of
 * `undefined`. That's what lets a new field ship without a data migration.
 */
/**
 * Defaults are applied *after* the snapshot read as well as before it: a
 * setting added in code (say, a new field) must show its default even when
 * the cached snapshot was written by an older deploy that never knew it.
 */
export const loadSettings = cache(async (): Promise<SiteSettings> => {
  const stored = await snapshot("settings", loadSettingsFromDb);
  return {
    social: { ...DEFAULT_SETTINGS.social, ...stored.social },
    shipping: { ...DEFAULT_SETTINGS.shipping, ...stored.shipping },
    languages: { ...DEFAULT_SETTINGS.languages, ...stored.languages },
  };
});

async function loadSettingsFromDb(): Promise<SiteSettings> {
  const db = await getDb();
  const rows = await db.select().from(schema.settings);
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  const social = byKey.get(SETTINGS_KEYS.social) as
    Partial<SocialLinks> | undefined;
  const shipping = byKey.get(SETTINGS_KEYS.shipping) as
    Partial<ShippingSettings> | undefined;
  const languages = byKey.get(SETTINGS_KEYS.languages) as
    Partial<LanguageSettings> | undefined;

  return {
    social: { ...DEFAULT_SETTINGS.social, ...(social ?? {}) },
    shipping: { ...DEFAULT_SETTINGS.shipping, ...(shipping ?? {}) },
    languages: { ...DEFAULT_SETTINGS.languages, ...(languages ?? {}) },
  };
}

/** Delivery terms alone — the cart and product page only need these. */
export async function loadShipping(): Promise<ShippingSettings> {
  return (await loadSettings()).shipping;
}
