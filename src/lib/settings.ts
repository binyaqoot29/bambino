/**
 * Editable site settings.
 *
 * Kept deliberately small. Anything the shop owner should be able to change
 * without a deploy goes here; anything the code branches on does not.
 */

export type SocialLinks = {
  instagram: string;
  tiktok: string;
  whatsapp: string;
};

export type SiteSettings = {
  social: SocialLinks;
};

export const SETTINGS_KEYS = { social: "social" } as const;

export const DEFAULT_SETTINGS: SiteSettings = {
  // Empty means "not set" — the footers hide a link rather than pointing at a
  // placeholder profile that doesn't exist.
  social: { instagram: "", tiktok: "", whatsapp: "" },
};

/**
 * Accepts what a person actually pastes — a full URL, a bare @handle, or a
 * phone number — and returns something a browser can open, or "" to hide it.
 */
export function normaliseSocial(
  platform: keyof SocialLinks,
  raw: string,
): string {
  const value = raw.trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) return value;

  const handle = value.replace(/^@/, "");

  switch (platform) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "tiktok":
      return `https://tiktok.com/@${handle}`;
    case "whatsapp": {
      // wa.me wants digits only — no +, spaces or dashes.
      const digits = value.replace(/[^\d]/g, "");
      return digits ? `https://wa.me/${digits}` : "";
    }
  }
}
