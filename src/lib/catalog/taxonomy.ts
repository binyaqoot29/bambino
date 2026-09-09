import type { Category, ColourOption, Department } from "./types";

/**
 * The shop's colour vocabulary, grouped by family for the product editor.
 *
 * Sixty-odd named colours cover what children's clothing and nursery goods
 * actually come in; a product can still add its own (see
 * `customColours` on the products table) for a shade that is nowhere here.
 * Keys are stable — they live in variant rows and filter URLs — so a colour
 * may be renamed but never re-keyed.
 */
export const COLOURS: Record<string, ColourOption> = {
  white: { key: "white", name: { en: "White", ar: "أبيض" }, hex: "#FFFFFF" },
  ivory: { key: "ivory", name: { en: "Ivory", ar: "عاجي" }, hex: "#FAF6F0" },
  cream: { key: "cream", name: { en: "Cream", ar: "كريمي" }, hex: "#F2EADF" },
  oat: { key: "oat", name: { en: "Oat", ar: "شوفاني" }, hex: "#E6DCCB" },
  beige: { key: "beige", name: { en: "Beige", ar: "بيج" }, hex: "#E3D5C0" },
  sand: { key: "sand", name: { en: "Sand", ar: "رملي" }, hex: "#D9C7A7" },
  stone: { key: "stone", name: { en: "Stone", ar: "حجري" }, hex: "#C9C0B4" },
  silver: { key: "silver", name: { en: "Silver", ar: "فضي" }, hex: "#D0D3D8" },
  grey: {
    key: "grey",
    name: { en: "Pebble", ar: "رمادي حصوي" },
    hex: "#B9B4B8",
  },
  slate: {
    key: "slate",
    name: { en: "Slate", ar: "رمادي أردوازي" },
    hex: "#6E7681",
  },
  charcoal: {
    key: "charcoal",
    name: { en: "Charcoal", ar: "فحمي" },
    hex: "#4A4A4F",
  },
  black: { key: "black", name: { en: "Black", ar: "أسود" }, hex: "#1A1A1A" },
  blush: {
    key: "blush",
    name: { en: "Blush", ar: "وردي فاتح" },
    hex: "#F2D3DD",
  },
  pink: { key: "pink", name: { en: "Pink", ar: "زهري" }, hex: "#F4A6C8" },
  rose: { key: "rose", name: { en: "Rose", ar: "وردي" }, hex: "#E8A2B4" },
  "dusty-rose": {
    key: "dusty-rose",
    name: { en: "Dusty rose", ar: "وردي باهت" },
    hex: "#C99AA3",
  },
  fuchsia: {
    key: "fuchsia",
    name: { en: "Fuchsia", ar: "فوشيا" },
    hex: "#D63384",
  },
  orchid: {
    key: "orchid",
    name: { en: "Orchid", ar: "أوركيد" },
    hex: "#BD73A8",
  },
  mauve: { key: "mauve", name: { en: "Mauve", ar: "موف" }, hex: "#B08BA6" },
  lilac: { key: "lilac", name: { en: "Lilac", ar: "ليلكي" }, hex: "#C9B6E4" },
  lavender: {
    key: "lavender",
    name: { en: "Lavender", ar: "لافندر" },
    hex: "#B4A7D6",
  },
  periwinkle: {
    key: "periwinkle",
    name: { en: "Periwinkle", ar: "بنفسجي سماوي" },
    hex: "#9FA8DA",
  },
  violet: {
    key: "violet",
    name: { en: "Violet", ar: "بنفسجي" },
    hex: "#8B5FBF",
  },
  plum: { key: "plum", name: { en: "Plum", ar: "برقوقي" }, hex: "#661F47" },
  aubergine: {
    key: "aubergine",
    name: { en: "Aubergine", ar: "باذنجاني" },
    hex: "#4B1E3A",
  },
  peach: { key: "peach", name: { en: "Peach", ar: "خوخي" }, hex: "#F7C4A5" },
  apricot: {
    key: "apricot",
    name: { en: "Apricot", ar: "مشمشي" },
    hex: "#F2B880",
  },
  coral: { key: "coral", name: { en: "Coral", ar: "مرجاني" }, hex: "#F08A76" },
  orange: {
    key: "orange",
    name: { en: "Orange", ar: "برتقالي" },
    hex: "#F28C28",
  },
  rust: { key: "rust", name: { en: "Rust", ar: "صدئي" }, hex: "#B5532F" },
  clay: { key: "clay", name: { en: "Clay", ar: "طيني" }, hex: "#C98468" },
  red: { key: "red", name: { en: "Red", ar: "أحمر" }, hex: "#C8102E" },
  cherry: { key: "cherry", name: { en: "Cherry", ar: "كرزي" }, hex: "#9E1B32" },
  burgundy: {
    key: "burgundy",
    name: { en: "Burgundy", ar: "نبيذي" },
    hex: "#6E1423",
  },
  lemon: { key: "lemon", name: { en: "Lemon", ar: "ليموني" }, hex: "#F6E27A" },
  sun: { key: "sun", name: { en: "Sunbeam", ar: "أصفر شمسي" }, hex: "#F0CB84" },
  mustard: {
    key: "mustard",
    name: { en: "Mustard", ar: "خردلي" },
    hex: "#D4A017",
  },
  gold: { key: "gold", name: { en: "Gold", ar: "ذهبي" }, hex: "#C9A227" },
  mint: { key: "mint", name: { en: "Mint", ar: "نعناعي" }, hex: "#B7D2DD" },
  pistachio: {
    key: "pistachio",
    name: { en: "Pistachio", ar: "فستقي" },
    hex: "#C5E0B4",
  },
  sage: { key: "sage", name: { en: "Sage", ar: "أخضر مريمي" }, hex: "#BFCBB4" },
  lime: {
    key: "lime",
    name: { en: "Lime", ar: "أخضر ليموني" },
    hex: "#A4C639",
  },
  olive: { key: "olive", name: { en: "Olive", ar: "زيتوني" }, hex: "#7C8A4B" },
  green: { key: "green", name: { en: "Green", ar: "أخضر" }, hex: "#3E8E5A" },
  emerald: {
    key: "emerald",
    name: { en: "Emerald", ar: "زمردي" },
    hex: "#1F7A5C",
  },
  forest: {
    key: "forest",
    name: { en: "Forest", ar: "أخضر غامق" },
    hex: "#2F5D3A",
  },
  teal: { key: "teal", name: { en: "Teal", ar: "أزرق مخضر" }, hex: "#2E8B8B" },
  cloud: { key: "cloud", name: { en: "Cloud", ar: "سحابي" }, hex: "#D3E1EC" },
  "baby-blue": {
    key: "baby-blue",
    name: { en: "Baby blue", ar: "أزرق فاتح" },
    hex: "#BFD7F2",
  },
  sky: { key: "sky", name: { en: "Sky", ar: "سماوي" }, hex: "#A7CDEB" },
  aqua: { key: "aqua", name: { en: "Aqua", ar: "أكوا" }, hex: "#7FD1D1" },
  turquoise: {
    key: "turquoise",
    name: { en: "Turquoise", ar: "تركوازي" },
    hex: "#40C4C4",
  },
  denim: { key: "denim", name: { en: "Denim", ar: "دنيم" }, hex: "#4F6D9A" },
  blue: { key: "blue", name: { en: "Blue", ar: "أزرق" }, hex: "#2F6FCF" },
  royal: {
    key: "royal",
    name: { en: "Royal blue", ar: "أزرق ملكي" },
    hex: "#2846A6",
  },
  navy: { key: "navy", name: { en: "Navy", ar: "كحلي" }, hex: "#2F3E58" },
  tan: { key: "tan", name: { en: "Tan", ar: "أسمر فاتح" }, hex: "#D2B48C" },
  camel: { key: "camel", name: { en: "Camel", ar: "جملي" }, hex: "#C19A6B" },
  caramel: {
    key: "caramel",
    name: { en: "Caramel", ar: "كراميل" },
    hex: "#C68E5A",
  },
  taupe: { key: "taupe", name: { en: "Taupe", ar: "توب" }, hex: "#8C7B6E" },
  mocha: { key: "mocha", name: { en: "Mocha", ar: "موكا" }, hex: "#7B5B4A" },
  chocolate: {
    key: "chocolate",
    name: { en: "Chocolate", ar: "شوكولاتة" },
    hex: "#5B3A29",
  },
};

/** Family order and membership for the picker. */
export const COLOUR_FAMILIES: {
  key: string;
  name: { en: string; ar: string };
  colours: string[];
}[] = [
  {
    key: "neutrals",
    name: { en: "Neutrals", ar: "محايد" },
    colours: [
      "white",
      "ivory",
      "cream",
      "oat",
      "beige",
      "sand",
      "stone",
      "silver",
      "grey",
      "slate",
      "charcoal",
      "black",
    ],
  },
  {
    key: "pinks",
    name: { en: "Pinks", ar: "وردي" },
    colours: [
      "blush",
      "pink",
      "rose",
      "dusty-rose",
      "fuchsia",
      "orchid",
      "mauve",
    ],
  },
  {
    key: "purples",
    name: { en: "Purples", ar: "بنفسجي" },
    colours: ["lilac", "lavender", "periwinkle", "violet", "plum", "aubergine"],
  },
  {
    key: "reds",
    name: { en: "Reds & oranges", ar: "أحمر وبرتقالي" },
    colours: [
      "peach",
      "apricot",
      "coral",
      "orange",
      "rust",
      "clay",
      "red",
      "cherry",
      "burgundy",
    ],
  },
  {
    key: "yellows",
    name: { en: "Yellows", ar: "أصفر" },
    colours: ["lemon", "sun", "mustard", "gold"],
  },
  {
    key: "greens",
    name: { en: "Greens", ar: "أخضر" },
    colours: [
      "mint",
      "pistachio",
      "sage",
      "lime",
      "olive",
      "green",
      "emerald",
      "forest",
      "teal",
    ],
  },
  {
    key: "blues",
    name: { en: "Blues", ar: "أزرق" },
    colours: [
      "cloud",
      "baby-blue",
      "sky",
      "aqua",
      "turquoise",
      "denim",
      "blue",
      "royal",
      "navy",
    ],
  },
  {
    key: "browns",
    name: { en: "Browns", ar: "بني" },
    colours: ["tan", "camel", "caramel", "taupe", "mocha", "chocolate"],
  },
];

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
