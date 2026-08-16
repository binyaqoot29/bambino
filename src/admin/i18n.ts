import { cookies } from "next/headers";

import type { Locale } from "@/i18n/config";

/**
 * The admin has its own language, separate from the storefront's.
 *
 * They're different audiences: a shopper's language comes from their browser,
 * while the person running the shop picks once and keeps it. Sharing one cookie
 * would mean previewing the Arabic shop flipped the admin too.
 */

export const ADMIN_LOCALE_COOKIE = "bambino_admin_locale";

const EN = {
  dir: "ltr" as "ltr" | "rtl",
  brand: "Admin",
  viewShop: "View shop",
  signOut: "Sign out",
  signIn: "Sign in",
  signingIn: "Signing in…",
  password: "Password",
  signInBlurb: "Manage the Bambino catalogue",
  wrongPassword: "Incorrect password",
  notConfigured: "Admin not configured",
  notConfiguredBody:
    "Set ADMIN_PASSWORD before the admin panel can be used. Until it's set the panel stays locked — it never falls back to an open state.",
  notConfiguredWhere:
    "Locally, add it to .env.local. In production, set it on the hosting project.",

  nav: { products: "Products", categories: "Categories", settings: "Settings" },

  products: {
    title: "Products",
    inCatalogue: "in the catalogue",
    matching: "matching",
    search: "Search products…",
    add: "Add product",
    edit: "Edit",
    delete: "Delete",
    product: "Product",
    category: "Category",
    price: "Price",
    stock: "Stock",
    variants: "variants",
    none: "No products yet — add the first one.",
    noMatch: "Nothing matches",
    saved: "Saved",
    deleted: "Product deleted.",
    viewOnShop: "View on the shop",
    back: "Products",
    addTitle: "Add product",
  },

  categories: {
    title: "Categories",
    count: "categories",
    add: "Add category",
    addTitle: "Add category",
    editTitle: "Edit category",
    name: "Name",
    blurb: "Short line",
    blurbHint: "Optional. Shown under the category on tiles and menus.",
    department: "Department",
    departmentHint: "Fixed list — departments define the top-level navigation.",
    art: "Illustration",
    slug: "Web address",
    slugHint: "Leave blank to build it from the English name.",
    slugWarning:
      "Changing this changes the category's URL. Existing links will break, and products move with it automatically.",
    position: "Order",
    positionHint: "Lower numbers come first within a department.",
    products: "products",
    inUse: "In use",
    deleteBlocked:
      "Move or delete its products first — a category with products can't be removed.",
    saved: "Category saved.",
    deleted: "Category deleted.",
  },

  settings: {
    title: "Settings",
    social: "Social links",
    socialBlurb:
      "Shown in the shop footer. Leave one blank to hide that icon. A full URL, an @handle or a phone number all work.",
    instagram: "Instagram",
    tiktok: "TikTok",
    whatsapp: "WhatsApp",
    whatsappHint: "Include the country code, e.g. 965 5000 0000",
    saved: "Settings saved.",
    preview: "Will link to",
    notSet: "Hidden — nothing set",
  },

  form: {
    save: "Save changes",
    create: "Create",
    cancel: "Cancel",
    saving: "Saving…",
    fixFields: "Please fix the highlighted fields",
    required: "Required",
    requiredArabic: "Required — the Arabic site shows this",
    english: "English",
    arabic: "العربية",
  },
};

const AR: typeof EN = {
  dir: "rtl",
  brand: "لوحة التحكم",
  viewShop: "عرض المتجر",
  signOut: "تسجيل الخروج",
  signIn: "تسجيل الدخول",
  signingIn: "جارٍ تسجيل الدخول…",
  password: "كلمة المرور",
  signInBlurb: "إدارة كتالوج بامبينو",
  wrongPassword: "كلمة المرور غير صحيحة",
  notConfigured: "لوحة التحكم غير مهيّأة",
  notConfiguredBody:
    "يجب ضبط ADMIN_PASSWORD قبل استخدام لوحة التحكم. تبقى اللوحة مقفلة حتى يتم ضبطها — ولا تُفتح تلقائياً في أي حال.",
  notConfiguredWhere:
    "محلياً، أضفها إلى ملف .env.local. في الإنتاج، اضبطها على مشروع الاستضافة.",

  nav: { products: "المنتجات", categories: "الأقسام", settings: "الإعدادات" },

  products: {
    title: "المنتجات",
    inCatalogue: "في الكتالوج",
    matching: "مطابق",
    search: "ابحث في المنتجات…",
    add: "إضافة منتج",
    edit: "تعديل",
    delete: "حذف",
    product: "المنتج",
    category: "القسم",
    price: "السعر",
    stock: "المخزون",
    variants: "خيارات",
    none: "لا توجد منتجات بعد — أضف الأول.",
    noMatch: "لا توجد نتائج مطابقة",
    saved: "تم الحفظ",
    deleted: "تم حذف المنتج.",
    viewOnShop: "عرض في المتجر",
    back: "المنتجات",
    addTitle: "إضافة منتج",
  },

  categories: {
    title: "الأقسام",
    count: "قسم",
    add: "إضافة قسم",
    addTitle: "إضافة قسم",
    editTitle: "تعديل القسم",
    name: "الاسم",
    blurb: "سطر تعريفي",
    blurbHint: "اختياري. يظهر تحت اسم القسم في البطاقات والقوائم.",
    department: "الإدارة",
    departmentHint: "قائمة ثابتة — الإدارات تحدّد التنقّل الرئيسي.",
    art: "الرسم التوضيحي",
    slug: "الرابط",
    slugHint: "اتركه فارغاً ليُشتق من الاسم الإنجليزي.",
    slugWarning:
      "تغيير هذا يغيّر رابط القسم. الروابط الحالية ستتوقف، وتنتقل المنتجات معه تلقائياً.",
    position: "الترتيب",
    positionHint: "الأرقام الأصغر تظهر أولاً داخل الإدارة.",
    products: "منتج",
    inUse: "قيد الاستخدام",
    deleteBlocked:
      "انقل منتجاته أو احذفها أولاً — لا يمكن حذف قسم يحتوي على منتجات.",
    saved: "تم حفظ القسم.",
    deleted: "تم حذف القسم.",
  },

  settings: {
    title: "الإعدادات",
    social: "روابط التواصل",
    socialBlurb:
      "تظهر في تذييل المتجر. اترك أي حقل فارغاً لإخفاء أيقونته. يمكن إدخال رابط كامل أو معرّف يبدأ بـ @ أو رقم هاتف.",
    instagram: "إنستغرام",
    tiktok: "تيك توك",
    whatsapp: "واتساب",
    whatsappHint: "أدخل رمز الدولة، مثال: 965 5000 0000",
    saved: "تم حفظ الإعدادات.",
    preview: "سيفتح على",
    notSet: "مخفي — لم يتم ضبطه",
  },

  form: {
    save: "حفظ التغييرات",
    create: "إنشاء",
    cancel: "إلغاء",
    saving: "جارٍ الحفظ…",
    fixFields: "يرجى تصحيح الحقول المميّزة",
    required: "مطلوب",
    requiredArabic: "مطلوب — يظهر في الموقع العربي",
    english: "English",
    arabic: "العربية",
  },
};

export type AdminDictionary = typeof EN;

const DICTIONARIES: Record<Locale, AdminDictionary> = { en: EN, ar: AR };

export async function getAdminLocale(): Promise<Locale> {
  const value = (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;
  return value === "ar" ? "ar" : "en";
}

export function adminDictionary(locale: Locale): AdminDictionary {
  return DICTIONARIES[locale];
}
