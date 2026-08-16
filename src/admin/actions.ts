"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { count, eq } from "drizzle-orm";

import { getDb, schema } from "@/db";
import { findCategory } from "@/lib/catalog/categories";
import { COLOURS, DEPARTMENT_ORDER, SIZE_LABELS } from "@/lib/catalog/taxonomy";
import type { AgeGroup, ArtKey, Department } from "@/lib/catalog/types";
import {
  SETTINGS_KEYS,
  normaliseSocial,
  type SocialLinks,
} from "@/lib/settings";
import { ADMIN_LOCALE_COOKIE } from "./i18n";
import {
  createSession,
  destroySession,
  isAuthenticated,
  verifyPassword,
} from "./auth";

/* --------------------------------------------------------------------------
 * Auth
 * ----------------------------------------------------------------------- */

export async function login(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!(await verifyPassword(password))) {
    return { error: "Incorrect password" };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* --------------------------------------------------------------------------
 * Products
 * ----------------------------------------------------------------------- */

/**
 * Every mutation re-checks the session itself. Route-level protection can be
 * bypassed by calling a Server Action directly — the action is its own
 * endpoint — so authorisation belongs here, not only in a layout.
 */
async function requireAdmin() {
  if (!(await isAuthenticated())) {
    throw new Error("Not authorised");
  }
}

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string> };

const AGE_VALUES: AgeGroup[] = [
  "newborn",
  "0-6m",
  "6-12m",
  "1-2y",
  "2-4y",
  "4-6y",
];

/** "12.500" (what a human types) → 12500 fils (what we store). */
function parsePrice(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 1000);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseForm(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const detailsEn = text("detailsEn").split("\n").map((l) => l.trim()).filter(Boolean);
  const detailsAr = text("detailsAr").split("\n").map((l) => l.trim()).filter(Boolean);

  return {
    handle: text("handle"),
    nameEn: text("nameEn"),
    nameAr: text("nameAr"),
    summaryEn: text("summaryEn"),
    summaryAr: text("summaryAr"),
    descriptionEn: text("descriptionEn"),
    descriptionAr: text("descriptionAr"),
    careEn: text("careEn"),
    careAr: text("careAr"),
    detailsEn,
    detailsAr,
    category: text("category"),
    art: text("art") as ArtKey,
    price: text("price"),
    compareAtPrice: text("compareAtPrice"),
    ageGroups: formData.getAll("ageGroups").map(String) as AgeGroup[],
    colours: formData.getAll("colours").map(String),
    sizes: formData.getAll("sizes").map(String),
    stock: text("stock"),
    featured: formData.get("featured") === "on",
    bestseller: formData.get("bestseller") === "on",
    rating: text("rating"),
    reviewCount: text("reviewCount"),
  };
}

function validate(
  input: ReturnType<typeof parseForm>,
  categoryExists: boolean,
) {
  const fieldErrors: Record<string, string> = {};

  if (!input.nameEn) fieldErrors.nameEn = "Required";
  // Arabic is not optional — a half-translated product renders blank on /ar.
  if (!input.nameAr) fieldErrors.nameAr = "Required — the Arabic site shows this";
  if (!input.summaryEn) fieldErrors.summaryEn = "Required";
  if (!input.summaryAr) fieldErrors.summaryAr = "Required — the Arabic site shows this";
  if (!input.descriptionEn) fieldErrors.descriptionEn = "Required";
  if (!input.descriptionAr) fieldErrors.descriptionAr = "Required — the Arabic site shows this";

  if (!categoryExists) fieldErrors.category = "Pick a category";
  if (!input.art) fieldErrors.art = "Pick an illustration";

  const price = parsePrice(input.price);
  if (price === null) fieldErrors.price = "Enter a price like 12.500";

  if (input.compareAtPrice) {
    const compare = parsePrice(input.compareAtPrice);
    if (compare === null) fieldErrors.compareAtPrice = "Enter a price like 19.500";
    else if (price !== null && compare <= price) {
      fieldErrors.compareAtPrice = "Must be higher than the price to show as a discount";
    }
  }

  if (input.detailsEn.length !== input.detailsAr.length) {
    fieldErrors.detailsAr = `Needs ${input.detailsEn.length} line(s) to match English, has ${input.detailsAr.length}`;
  }
  if (Boolean(input.careEn) !== Boolean(input.careAr)) {
    fieldErrors.careAr = "Fill both languages, or neither";
  }

  if (input.colours.length === 0) fieldErrors.colours = "Pick at least one colour";
  if (input.sizes.length === 0) fieldErrors.sizes = "Pick at least one size";
  if (input.ageGroups.length === 0) fieldErrors.ageGroups = "Pick at least one age";

  return { fieldErrors, price };
}

async function writeVariants(
  db: Awaited<ReturnType<typeof getDb>>,
  productId: string,
  colours: string[],
  sizes: string[],
  stock: number,
) {
  const existing = await db
    .select()
    .from(schema.variants)
    .where(eq(schema.variants.productId, productId));
  const previousStock = new Map(
    existing.map((v) => [`${v.colour}::${v.size}`, v.stock]),
  );

  await db.delete(schema.variants).where(eq(schema.variants.productId, productId));

  const rows = colours.flatMap((colour) =>
    sizes.map((size) => ({
      id: `${productId}--${colour}--${size}`,
      productId,
      colour,
      size,
      // Keep stock for combinations that already existed, so editing a
      // product's colours doesn't silently zero the rest of its inventory.
      stock: previousStock.get(`${colour}::${size}`) ?? stock,
    })),
  );
  if (rows.length) await db.insert(schema.variants).values(rows);
}

export async function saveProduct(
  productId: string | null,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const input = parseForm(formData);
  const category = await findCategory(input.category);
  const { fieldErrors, price } = validate(input, Boolean(category));
  if (Object.keys(fieldErrors).length) {
    return { error: "Please fix the highlighted fields", fieldErrors };
  }

  const db = await getDb();
  const handle = slugify(input.handle || input.nameEn);

  const clash = await db
    .select({ id: schema.products.id })
    .from(schema.products)
    .where(eq(schema.products.handle, handle))
    .limit(1);
  if (clash.length && clash[0].id !== productId) {
    return {
      error: "That web address is already used by another product",
      fieldErrors: { handle: "Already taken" },
    };
  }

  const values = {
    handle,
    name: { en: input.nameEn, ar: input.nameAr },
    summary: { en: input.summaryEn, ar: input.summaryAr },
    description: { en: input.descriptionEn, ar: input.descriptionAr },
    details: input.detailsEn.map((en, i) => ({ en, ar: input.detailsAr[i] })),
    care: input.careEn ? { en: input.careEn, ar: input.careAr } : null,
    category: input.category,
    department: category!.department,
    price: price!,
    compareAtPrice: input.compareAtPrice
      ? parsePrice(input.compareAtPrice)
      : null,
    art: input.art,
    ageGroups: input.ageGroups.filter((a) => AGE_VALUES.includes(a)),
    rating: Number(input.rating) || 0,
    reviewCount: Number(input.reviewCount) || 0,
    featured: input.featured,
    bestseller: input.bestseller,
    updatedAt: new Date(),
  };

  const stock = Math.max(0, Number(input.stock) || 0);
  const colours = input.colours.filter((c) => COLOURS[c]);
  const sizes = input.sizes.filter((s) => s in SIZE_LABELS);

  let id = productId;
  if (id) {
    await db.update(schema.products).set(values).where(eq(schema.products.id, id));
  } else {
    id = handle;
    await db.insert(schema.products).values({ id, ...values });
  }

  await writeVariants(db, id, colours, sizes, stock);

  revalidatePath("/", "layout");
  redirect(`/admin?saved=${encodeURIComponent(handle)}`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const db = await getDb();
  // Variants go with it via ON DELETE CASCADE.
  await db.delete(schema.products).where(eq(schema.products.id, id));

  revalidatePath("/", "layout");
  redirect("/admin?deleted=1");
}

export async function setStock(formData: FormData) {
  await requireAdmin();

  const variantId = String(formData.get("variantId") ?? "");
  const stock = Math.max(0, Number(formData.get("stock")) || 0);
  if (!variantId) return;

  const db = await getDb();
  await db
    .update(schema.variants)
    .set({ stock })
    .where(eq(schema.variants.id, variantId));

  revalidatePath("/", "layout");
}

/* --------------------------------------------------------------------------
 * Categories
 * ----------------------------------------------------------------------- */

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function saveCategory(
  originalSlug: string | null,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const text = (k: string) => String(formData.get(k) ?? "").trim();
  const nameEn = text("nameEn");
  const nameAr = text("nameAr");
  const blurbEn = text("blurbEn");
  const blurbAr = text("blurbAr");
  const department = text("department") as Department;
  const art = text("art") as ArtKey;
  const slug = slugify(text("slug") || nameEn);
  const position = Number(text("position")) || 0;

  const fieldErrors: Record<string, string> = {};
  if (!nameEn) fieldErrors.nameEn = "Required";
  if (!nameAr) fieldErrors.nameAr = "Required — the Arabic site shows this";
  if (!DEPARTMENT_ORDER.includes(department)) {
    fieldErrors.department = "Pick a department";
  }
  if (!art) fieldErrors.art = "Pick an illustration";
  if (!slug) fieldErrors.slug = "Required";
  if (Boolean(blurbEn) !== Boolean(blurbAr)) {
    fieldErrors.blurbAr = "Fill both languages, or neither";
  }

  if (Object.keys(fieldErrors).length) {
    return { error: "Please fix the highlighted fields", fieldErrors };
  }

  const db = await getDb();

  const clash = await db
    .select({ slug: schema.categories.slug })
    .from(schema.categories)
    .where(eq(schema.categories.slug, slug))
    .limit(1);
  if (clash.length && slug !== originalSlug) {
    return {
      error: "That web address is already used by another category",
      fieldErrors: { slug: "Already taken" },
    };
  }

  const values = {
    name: { en: nameEn, ar: nameAr },
    blurb: blurbEn ? { en: blurbEn, ar: blurbAr } : null,
    department,
    art,
    position,
  };

  if (originalSlug) {
    await db
      .update(schema.categories)
      .set({ slug, ...values })
      .where(eq(schema.categories.slug, originalSlug));

    // Products reference a category by slug, so a rename has to carry them
    // with it or they'd point at a category that no longer exists.
    if (slug !== originalSlug) {
      await db
        .update(schema.products)
        .set({ category: slug })
        .where(eq(schema.products.category, originalSlug));
    }
    // A category can move department; its products must follow.
    await db
      .update(schema.products)
      .set({ department })
      .where(eq(schema.products.category, slug));
  } else {
    await db.insert(schema.categories).values({ slug, ...values });
  }

  revalidatePath("/", "layout");
  redirect("/admin/categories?saved=1");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();

  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  const db = await getDb();
  const [used] = await db
    .select({ n: count() })
    .from(schema.products)
    .where(eq(schema.products.category, slug));

  // Refuse rather than cascade: deleting a category shouldn't quietly delete
  // the shop owner's products with it.
  if (used.n > 0) {
    redirect(`/admin/categories?blocked=${encodeURIComponent(slug)}`);
  }

  await db.delete(schema.categories).where(eq(schema.categories.slug, slug));

  revalidatePath("/", "layout");
  redirect("/admin/categories?deleted=1");
}

/* --------------------------------------------------------------------------
 * Settings
 * ----------------------------------------------------------------------- */

export async function saveSettings(formData: FormData) {
  await requireAdmin();

  const social: SocialLinks = {
    instagram: normaliseSocial("instagram", String(formData.get("instagram") ?? "")),
    tiktok: normaliseSocial("tiktok", String(formData.get("tiktok") ?? "")),
    whatsapp: normaliseSocial("whatsapp", String(formData.get("whatsapp") ?? "")),
  };

  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key: SETTINGS_KEYS.social, value: social })
    .onConflictDoUpdate({
      target: schema.settings.key,
      set: { value: social },
    });

  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

/* --------------------------------------------------------------------------
 * Admin language
 * ----------------------------------------------------------------------- */

export async function setAdminLocale(formData: FormData) {
  const next = String(formData.get("locale") ?? "en") === "ar" ? "ar" : "en";
  (await cookies()).set(ADMIN_LOCALE_COOKIE, next, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(String(formData.get("returnTo") ?? "/admin"));
}
