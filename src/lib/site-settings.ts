import { cache } from "react";

import { getDb, schema } from "@/db";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEYS,
  type SiteSettings,
  type SocialLinks,
} from "./settings";

/**
 * Reads site settings, falling back to defaults for anything unset.
 *
 * Cached per request — the footer asks for it on every page, and a missing row
 * should never be an error, just an unset value.
 */
export const loadSettings = cache(async (): Promise<SiteSettings> => {
  const db = await getDb();
  const rows = await db.select().from(schema.settings);
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  const social = byKey.get(SETTINGS_KEYS.social) as Partial<SocialLinks> | undefined;

  return {
    social: { ...DEFAULT_SETTINGS.social, ...(social ?? {}) },
  };
});
