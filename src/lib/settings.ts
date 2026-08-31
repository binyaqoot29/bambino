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

type I18n = { en: string; ar: string };

/**
 * Delivery terms.
 *
 * These drive real behaviour, not just copy: the free-delivery threshold is
 * what the cart's progress bar counts towards and what the product page
 * promises. They were constants in three files, which meant changing the
 * threshold was a deploy — and an easy one to do incompletely.
 *
 * Money is integer fils throughout, like every other price in the app.
 */
export type ShippingSettings = {
  /** Order total at or above which delivery is free. */
  freeThreshold: number;
  /** Charged below the threshold. */
  flatRate: number;
  codEnabled: boolean;
  /** Surcharge for paying cash on delivery. 0 is free, and reads as free. */
  codFee: number;
  /** Shown on the product page and in the footer's delivery note. */
  deliveryWindow: I18n;
  /** Returns window in days. */
  returnsDays: number;
};

/**
 * Which languages the storefront serves.
 *
 * Arabic can be switched off for a soft launch without removing the
 * translations — they stay in the dictionaries and come back when it's on.
 * English can't be switched off: it's the fallback every other setting assumes.
 */
export type LanguageSettings = {
  arabicEnabled: boolean;
  /** Where a visitor lands when nothing else decides — no cookie, no match. */
  defaultLocale: "en" | "ar";
};

export type SiteSettings = {
  social: SocialLinks;
  shipping: ShippingSettings;
  languages: LanguageSettings;
};

export const SETTINGS_KEYS = {
  social: "social",
  shipping: "shipping",
  languages: "languages",
} as const;

export const DEFAULT_SETTINGS: SiteSettings = {
  // Empty means "not set" — the footers hide a link rather than pointing at a
  // placeholder profile that doesn't exist.
  social: { instagram: "", tiktok: "", whatsapp: "" },

  // The terms the storefront shipped with, now editable rather than compiled in.
  shipping: {
    freeThreshold: 20_000,
    flatRate: 1_500,
    codEnabled: true,
    codFee: 0,
    deliveryWindow: {
      en: "Next-day delivery across Kuwait on orders placed before 4pm",
      ar: "توصيل في اليوم التالي داخل الكويت للطلبات قبل الساعة 4 مساءً",
    },
    returnsDays: 14,
  },

  languages: { arabicEnabled: true, defaultLocale: "en" },
};

/**
 * Parses a dinar amount typed by a person into integer fils.
 *
 * Accepts "20", "20.5", "20.500" and Arabic-Indic digits, since the admin runs
 * in Arabic too. Returns null for anything it can't read, so a typo surfaces as
 * a validation error rather than silently becoming 0 — which would make
 * delivery free for everyone.
 */
export function parseDinars(raw: string): number | null {
  const normalised = raw
    .trim()
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[,\s]/g, "");

  if (
    !/^\d*\.?\d*$/.test(normalised) ||
    normalised === "" ||
    normalised === "."
  ) {
    return null;
  }

  const fils = Math.round(Number(normalised) * 1000);
  return Number.isFinite(fils) && fils >= 0 ? fils : null;
}

/** Fils back to the plain "20.000" a person edits. */
export function formatDinarsInput(fils: number): string {
  return (fils / 1000).toFixed(3);
}

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
