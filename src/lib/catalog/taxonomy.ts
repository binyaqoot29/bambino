import type { Category, ColourOption, Department } from "./types";

export const COLOURS: Record<string, ColourOption> = {
  orchid: { key: "orchid", name: { en: "Orchid", ar: "أوركيد" }, hex: "#BD73A8" },
  plum: { key: "plum", name: { en: "Plum", ar: "برقوقي" }, hex: "#661F47" },
  mint: { key: "mint", name: { en: "Mint", ar: "نعناعي" }, hex: "#B7D2DD" },
  cloud: { key: "cloud", name: { en: "Cloud", ar: "سحابي" }, hex: "#D3E1EC" },
  cream: { key: "cream", name: { en: "Cream", ar: "كريمي" }, hex: "#F2EADF" },
  ivory: { key: "ivory", name: { en: "Ivory", ar: "عاجي" }, hex: "#FAF6F0" },
  sage: { key: "sage", name: { en: "Sage", ar: "أخضر مريمي" }, hex: "#BFCBB4" },
  blush: { key: "blush", name: { en: "Blush", ar: "وردي فاتح" }, hex: "#F2D3DD" },
  navy: { key: "navy", name: { en: "Navy", ar: "كحلي" }, hex: "#2F3E58" },
  grey: { key: "grey", name: { en: "Pebble", ar: "رمادي حصوي" }, hex: "#B9B4B8" },
  sun: { key: "sun", name: { en: "Sunbeam", ar: "أصفر شمسي" }, hex: "#F0CB84" },
  clay: { key: "clay", name: { en: "Clay", ar: "طيني" }, hex: "#C98468" },
};

export const BABY_SIZES = [
  "newborn",
  "0-3m",
  "3-6m",
  "6-9m",
  "9-12m",
  "12-18m",
  "18-24m",
] as const;

export const KID_SIZES = ["2-3y", "3-4y", "4-5y", "5-6y"] as const;

export const SHOE_SIZES = ["17", "18", "19", "20", "21", "22"] as const;

export const ONE_SIZE = ["one-size"] as const;

export const SIZE_LABELS: Record<string, { en: string; ar: string }> = {
  newborn: { en: "Newborn", ar: "حديثي الولادة" },
  "0-3m": { en: "0–3m", ar: "0–3 أشهر" },
  "3-6m": { en: "3–6m", ar: "3–6 أشهر" },
  "6-9m": { en: "6–9m", ar: "6–9 أشهر" },
  "9-12m": { en: "9–12m", ar: "9–12 شهراً" },
  "12-18m": { en: "12–18m", ar: "12–18 شهراً" },
  "18-24m": { en: "18–24m", ar: "18–24 شهراً" },
  "2-3y": { en: "2–3y", ar: "2–3 سنوات" },
  "3-4y": { en: "3–4y", ar: "3–4 سنوات" },
  "4-5y": { en: "4–5y", ar: "4–5 سنوات" },
  "5-6y": { en: "5–6y", ar: "5–6 سنوات" },
  "one-size": { en: "One size", ar: "مقاس واحد" },
  "17": { en: "EU 17", ar: "17 أوروبي" },
  "18": { en: "EU 18", ar: "18 أوروبي" },
  "19": { en: "EU 19", ar: "19 أوروبي" },
  "20": { en: "EU 20", ar: "20 أوروبي" },
  "21": { en: "EU 21", ar: "21 أوروبي" },
  "22": { en: "EU 22", ar: "22 أوروبي" },
};

export const DEPARTMENT_ORDER: Department[] = [
  "clothing",
  "travel",
  "nursery",
  "feeding",
  "play",
  "bath",
];

/**
 * Seed categories. The storefront and admin read categories from the
 * database (see catalog/categories.ts) — this is what a fresh database is
 * populated with, and nothing reads it at runtime.
 */
export const SEED_CATEGORIES: Category[] = [
  // --- Clothing ---------------------------------------------------------
  {
    slug: "bodysuits",
    name: { en: "Bodysuits", ar: "بادي سوت" },
    department: "clothing",
    art: "bodysuit",
    blurb: {
      en: "Envelope necks and easy poppers.",
      ar: "فتحات رقبة مرنة وأزرار سهلة.",
    },
  },
  {
    slug: "sleepsuits",
    name: { en: "Sleepsuits & pyjamas", ar: "بيجامات ولباس نوم" },
    department: "clothing",
    art: "sleepsuit",
    blurb: {
      en: "Built for 3am changes.",
      ar: "مصمّمة لتغييرات منتصف الليل.",
    },
  },
  {
    slug: "dresses",
    name: { en: "Dresses", ar: "فساتين" },
    department: "clothing",
    art: "dress",
    blurb: { en: "Twirl-tested, every one.", ar: "مجرّبة للدوران واللعب." },
  },
  {
    slug: "tops",
    name: { en: "Tops & tees", ar: "تيشيرتات وقمصان" },
    department: "clothing",
    art: "tee",
    blurb: { en: "The everyday layer.", ar: "الطبقة اليومية الأساسية." },
  },
  {
    slug: "shoes",
    name: { en: "Shoes & booties", ar: "أحذية وخفاف" },
    department: "clothing",
    art: "booties",
    blurb: { en: "Soft soles, first steps.", ar: "نعال طرية للخطوات الأولى." },
  },

  // --- Prams & travel ---------------------------------------------------
  {
    slug: "prams",
    name: { en: "Prams & strollers", ar: "عربات الأطفال" },
    department: "travel",
    art: "stroller",
    blurb: { en: "Kuwait pavements, handled.", ar: "مناسبة لأرصفة الكويت." },
  },
  {
    slug: "car-seats",
    name: { en: "Car seats", ar: "مقاعد السيارة" },
    department: "travel",
    art: "carseat",
    blurb: { en: "i-Size approved, every one.", ar: "معتمدة وفق i-Size." },
  },
  {
    slug: "changing-bags",
    name: { en: "Changing bags", ar: "حقائب التغيير" },
    department: "travel",
    art: "bag",
    blurb: { en: "Everything, one shoulder.", ar: "كل شيء على كتف واحد." },
  },

  // --- Nursery ----------------------------------------------------------
  {
    slug: "cots",
    name: { en: "Cots & furniture", ar: "أسرّة وأثاث" },
    department: "nursery",
    art: "cot",
    blurb: { en: "Grows from cot to bed.", ar: "تكبر من سرير طفل إلى سرير." },
  },
  {
    slug: "bedding",
    name: { en: "Bedding & sleep", ar: "مفارش ونوم" },
    department: "nursery",
    art: "bedding",
    blurb: { en: "Breathable cotton only.", ar: "قطن يسمح بمرور الهواء." },
  },
  {
    slug: "highchairs",
    name: { en: "Highchairs", ar: "كراسي الطعام" },
    department: "nursery",
    art: "highchair",
    blurb: { en: "Wipe-clean, always.", ar: "سهلة التنظيف دائماً." },
  },

  // --- Feeding ----------------------------------------------------------
  {
    slug: "bottles",
    name: { en: "Bottles & feeding", ar: "رضّاعات ومستلزمات" },
    department: "feeding",
    art: "bottle",
    blurb: { en: "Anti-colic as standard.", ar: "مضادة للمغص كمعيار أساسي." },
  },

  // --- Toys & play ------------------------------------------------------
  {
    slug: "soft-toys",
    name: { en: "Soft toys", ar: "ألعاب قطنية" },
    department: "play",
    art: "teddy",
    blurb: { en: "Washable, huggable.", ar: "قابلة للغسل ومحبوبة." },
  },

  // --- Bath & changing --------------------------------------------------
  {
    slug: "bath-time",
    name: { en: "Bath time", ar: "وقت الاستحمام" },
    department: "bath",
    art: "bath",
    blurb: { en: "Splash-proof everything.", ar: "كل ما يقاوم الماء والرذاذ." },
  },
];

