"use server";

import { revalidatePath } from "next/cache";

import { invalidateSnapshots } from "@/lib/cache/snapshot";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { count, eq } from "drizzle-orm";

import { getDb, schema } from "@/db";
import { findCategory } from "@/lib/catalog/categories";
import { COLOURS, DEPARTMENT_ORDER, SIZE_LABELS } from "@/lib/catalog/taxonomy";
import type {
  AgeGroup,
  ArtKey,
  ColourOption,
  Department,
} from "@/lib/catalog/types";
import { isCollectionRule } from "@/lib/catalog/collection-rules";
import { freeProductId } from "@/lib/catalog/product-id";
import { restoreOrderStock } from "@/lib/orders/place";
import { deleteMessage, markMessageRead } from "@/lib/messages";
import {
  applyInventoryImport,
  applyProductImport,
  attachPhotosByHandle,
  planInventoryImport,
  planProductImport,
  type ImportProblem,
} from "@/lib/transfer/products";
import { deleteImage } from "@/lib/uploads/store";
import { isOrderStatus } from "@/lib/orders/types";
import {
  SETTINGS_KEYS,
  normaliseSocial,
  parseDinars,
  type LanguageSettings,
  type ShippingSettings,
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

/**
 * Every write the shop can see ends here: Next drops its router cache for the
 * storefront, and the KV snapshot is marked stale so the next visitor reads
 * the database once and re-fills it.
 */
async function storefrontChanged() {
  revalidatePath("/", "layout");
  await invalidateSnapshots();
}

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

/**
 * What a form gets back when a submit is rejected.
 *
 * React clears a form's fields after a Server Action returns, so a validation
 * error would otherwise throw away everything that was typed — the shop owner
 * fixes one blank and retypes the other thirty. The action echoes every
 * posted value back in `values`, and `attempt` increments so the form can
 * remount its fields (`key={attempt}`) and pick those values up as defaults.
 */
type FormEcho = {
  values?: Record<string, string | string[]>;
  attempt?: number;
};

/** Multi-value fields, always echoed as arrays even when one box is ticked. */
const LIST_FIELDS = new Set([
  "colours",
  "sizes",
  "ageGroups",
  "image",
  "membership",
]);

function echo(prev: FormEcho, formData: FormData): Required<FormEcho> {
  const values: Record<string, string | string[]> = {};
  for (const [key, raw] of formData.entries()) {
    if (typeof raw !== "string") continue; // files are never echoed
    if (LIST_FIELDS.has(key)) {
      const list = (values[key] as string[] | undefined) ?? [];
      list.push(raw);
      values[key] = list;
    } else {
      values[key] = raw;
    }
  }
  return { values, attempt: (prev.attempt ?? 0) + 1 };
}

export type ProductFormState = FormEcho & {
  error?: string;
  fieldErrors?: Record<string, string>;
};

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

/**
 * The product's own colours, posted by the picker as JSON. Each becomes a
 * palette-shaped entry with a "c-" key derived from its English name, so a
 * custom "Dusty teal" is `c-dusty-teal` everywhere a colour key is used.
 */
function parseCustomColours(raw: string): ColourOption[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: ColourOption[] = [];
  for (const item of parsed.slice(0, 24)) {
    if (!item || typeof item !== "object") continue;
    const { en, ar, hex } = item as Record<string, unknown>;
    const nameEn = String(en ?? "")
      .trim()
      .slice(0, 40);
    const nameAr = String(ar ?? "")
      .trim()
      .slice(0, 40);
    const colour = String(hex ?? "").trim();
    if (!nameEn || !/^#[0-9a-fA-F]{6}$/.test(colour)) continue;
    const key = `c-${slugify(nameEn)}`;
    if (key === "c-" || out.some((c) => c.key === key)) continue;
    out.push({
      key,
      name: { en: nameEn, ar: nameAr || nameEn },
      hex: colour.toUpperCase(),
    });
  }
  return out;
}

function parseForm(formData: FormData) {
  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const detailsEn = text("detailsEn")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const detailsAr = text("detailsAr")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

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
    customColours: parseCustomColours(
      String(formData.get("customColours") ?? ""),
    ),
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
  if (!input.nameAr)
    fieldErrors.nameAr = "Required — the Arabic site shows this";
  if (!input.summaryEn) fieldErrors.summaryEn = "Required";
  if (!input.summaryAr)
    fieldErrors.summaryAr = "Required — the Arabic site shows this";
  if (!input.descriptionEn) fieldErrors.descriptionEn = "Required";
  if (!input.descriptionAr)
    fieldErrors.descriptionAr = "Required — the Arabic site shows this";

  if (!categoryExists) fieldErrors.category = "Pick a category";
  if (!input.art) fieldErrors.art = "Pick an illustration";

  const price = parsePrice(input.price);
  if (price === null) fieldErrors.price = "Enter a price like 12.500";

  if (input.compareAtPrice) {
    const compare = parsePrice(input.compareAtPrice);
    if (compare === null)
      fieldErrors.compareAtPrice = "Enter a price like 19.500";
    else if (price !== null && compare <= price) {
      fieldErrors.compareAtPrice =
        "Must be higher than the price to show as a discount";
    }
  }

  if (input.detailsEn.length !== input.detailsAr.length) {
    fieldErrors.detailsAr = `Needs ${input.detailsEn.length} line(s) to match English, has ${input.detailsAr.length}`;
  }
  if (Boolean(input.careEn) !== Boolean(input.careAr)) {
    fieldErrors.careAr = "Fill both languages, or neither";
  }

  if (input.colours.length === 0)
    fieldErrors.colours = "Pick at least one colour";
  if (input.sizes.length === 0) fieldErrors.sizes = "Pick at least one size";
  if (input.ageGroups.length === 0)
    fieldErrors.ageGroups = "Pick at least one age";

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

  await db
    .delete(schema.variants)
    .where(eq(schema.variants.productId, productId));

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

/**
 * Is this a URL the shop itself issued?
 *
 * The image list is posted by the browser as plain strings, so without this an
 * edited request could point a product's photo anywhere on the internet and the
 * shop would serve it to every visitor — someone else's bandwidth, or worse,
 * someone else's content under Bambino's name.
 */
function isOwnImage(url: string): boolean {
  if (url.startsWith("/uploads/products/")) return true;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname.startsWith(
        "/storage/v1/object/public/product-images/products/",
      )
    );
  } catch {
    return false;
  }
}

export async function saveProduct(
  productId: string | null,
  prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const kept = echo(prev, formData);
  const input = parseForm(formData);
  const category = await findCategory(input.category);
  const { fieldErrors, price } = validate(input, Boolean(category));
  if (Object.keys(fieldErrors).length) {
    return { error: "Please fix the highlighted fields", fieldErrors, ...kept };
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
      ...kept,
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
    /**
     * Only URLs this shop actually issued.
     *
     * The field is a list of strings posted by the browser, so without this an
     * edited request could point a product's photo at any address on the
     * internet — and the shop would render it to every visitor.
     */
    images: formData
      .getAll("image")
      .map((v) => String(v))
      .filter(isOwnImage)
      .slice(0, 12),
    ageGroups: input.ageGroups.filter((a) => AGE_VALUES.includes(a)),
    customColours: input.customColours,
    rating: Number(input.rating) || 0,
    reviewCount: Number(input.reviewCount) || 0,
    featured: input.featured,
    bestseller: input.bestseller,
    updatedAt: new Date(),
  };

  const stock = Math.max(0, Number(input.stock) || 0);
  const own = new Set(input.customColours.map((c) => c.key));
  const colours = input.colours.filter((c) => COLOURS[c] || own.has(c));
  const sizes = input.sizes.filter((s) => s in SIZE_LABELS);

  let id = productId;
  let previousImages: string[] = [];
  if (id) {
    const [current] = await db
      .select({ images: schema.products.images })
      .from(schema.products)
      .where(eq(schema.products.id, id))
      .limit(1);
    previousImages = current?.images ?? [];

    await db
      .update(schema.products)
      .set(values)
      .where(eq(schema.products.id, id));
  } else {
    id = await freeProductId(db, handle);
    await db.insert(schema.products).values({ id, ...values });
  }

  await writeVariants(db, id, colours, sizes, stock);

  // Release photos that were removed or replaced. This runs only after the
  // write succeeded: a save that fails halfway must never delete a file the
  // product still points at. Without this, every dropped photo stayed in
  // storage forever — a leak nobody notices until the bucket is full of ghosts.
  await releaseImages(
    previousImages.filter((url) => !values.images.includes(url)),
  );

  await storefrontChanged();
  redirect(`/admin/products?saved=${encodeURIComponent(handle)}`);
}

/**
 * Best-effort, in parallel. `deleteImage` swallows its own errors, so a storage
 * blip costs a stray file at worst — never a failed product edit.
 */
async function releaseImages(urls: string[]) {
  if (urls.length) await Promise.all(urls.map((url) => deleteImage(url)));
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const db = await getDb();
  const [current] = await db
    .select({ images: schema.products.images })
    .from(schema.products)
    .where(eq(schema.products.id, id))
    .limit(1);

  // Variants go with it via ON DELETE CASCADE. Photos don't live in the
  // database, so they're released explicitly — after the row is gone.
  await db.delete(schema.products).where(eq(schema.products.id, id));
  await releaseImages(current?.images ?? []);

  await storefrontChanged();
  redirect("/admin/products?deleted=1");
} /* --------------------------------------------------------------------------
 * Categories
 * ----------------------------------------------------------------------- */

export type CategoryFormState = FormEcho & {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function saveCategory(
  originalSlug: string | null,
  prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();
  const kept = echo(prev, formData);

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
    return { error: "Please fix the highlighted fields", fieldErrors, ...kept };
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
      ...kept,
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

  await storefrontChanged();
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

  await storefrontChanged();
  redirect("/admin/categories?deleted=1");
}

/* --------------------------------------------------------------------------
 * Orders
 * ----------------------------------------------------------------------- */

/**
 * Moves an order along.
 *
 * Cancelling is the one transition with a side effect: the items go back on the
 * shelf. It's guarded against running twice — cancelling an already-cancelled
 * order would restock it a second time and quietly inflate inventory.
 */
export async function setOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !isOrderStatus(status)) return;

  const db = await getDb();
  const [order] = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, id))
    .limit(1);
  if (!order || order.status === status) return;

  // Cancelling is terminal. Moving back out of it would put the order live
  // again without re-taking the stock that cancelling returned to the shelf,
  // and the shop would oversell. The screen says cancelling can't be undone;
  // this is what makes that true rather than a hope.
  if (order.status === "cancelled") return;

  // The restock and the status change commit together: stock put back for
  // an order that then failed to cancel would be sold twice.
  const restocking = status === "cancelled";
  await db.transaction(async (tx) => {
    if (restocking) await restoreOrderStock(id, tx as unknown as typeof db);
    await tx
      .update(schema.orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.orders.id, id));
  });

  await storefrontChanged();
  redirect(`/admin/orders/${id}?${restocking ? "restocked" : "status"}=1`);
}

export async function setOrderPaid(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const paid = formData.get("paid") === "1";

  const db = await getDb();
  await db
    .update(schema.orders)
    .set({ paymentStatus: paid ? "paid" : "unpaid", updatedAt: new Date() })
    .where(eq(schema.orders.id, id));

  redirect(`/admin/orders/${id}?status=1`);
}

export async function saveOrderNote(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const note = String(formData.get("staffNote") ?? "").trim();

  const db = await getDb();
  await db
    .update(schema.orders)
    .set({ staffNote: note || null, updatedAt: new Date() })
    .where(eq(schema.orders.id, id));

  redirect(`/admin/orders/${id}?note=1`);
}

/* --------------------------------------------------------------------------
 * Inventory
 * ----------------------------------------------------------------------- */

/**
 * Saves several stock levels at once.
 *
 * The inventory screen shows a page of variants and the shop owner counts a
 * shelf and types in a column of numbers. One form and one round trip matches
 * how the job is actually done; saving each row separately would mean a
 * navigation between every number.
 *
 * Only changed rows are written — the form posts the value it rendered with
 * alongside the new one, so an untouched field costs nothing.
 */
export async function setStockBulk(formData: FormData) {
  await requireAdmin();

  const db = await getDb();
  const updates: { id: string; stock: number }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("stock:")) continue;
    const id = key.slice("stock:".length);

    const next = Math.max(0, Math.trunc(Number(value)) || 0);
    const before = Number(formData.get(`was:${id}`));
    if (Number.isFinite(before) && before === next) continue;

    updates.push({ id, stock: next });
  }

  for (const update of updates) {
    await db
      .update(schema.variants)
      .set({ stock: update.stock })
      .where(eq(schema.variants.id, update.id));
  }

  await storefrontChanged();
  redirect(`/admin/inventory?saved=${updates.length}${queryTail(formData)}`);
}

/** Carries the current search and filter back through a redirect. */
function queryTail(formData: FormData): string {
  const params = new URLSearchParams();
  const q = String(formData.get("q") ?? "").trim();
  const filter = String(formData.get("filter") ?? "").trim();
  if (q) params.set("q", q);
  if (filter && filter !== "all") params.set("filter", filter);
  const tail = params.toString();
  return tail ? `&${tail}` : "";
}

/* --------------------------------------------------------------------------
 * Collections
 * ----------------------------------------------------------------------- */

export type CollectionFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function saveCollection(
  _prev: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  await requireAdmin();

  const original = String(formData.get("originalSlug") ?? "").trim();
  const isNew = !original;

  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  const blurbEn = String(formData.get("blurbEn") ?? "").trim();
  const blurbAr = String(formData.get("blurbAr") ?? "").trim();
  const ruleRaw = String(formData.get("rule") ?? "").trim();
  const visible = formData.get("visible") === "on";
  const position = Math.max(
    0,
    Math.trunc(Number(formData.get("position")) || 0),
  );

  const fieldErrors: Record<string, string> = {};
  if (!slug) fieldErrors.slug = "required";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    fieldErrors.slug = "invalid";
  if (!nameEn) fieldErrors.nameEn = "required";
  if (!nameAr) fieldErrors.nameAr = "required";

  const db = await getDb();

  if (!fieldErrors.slug && slug !== original) {
    const [clash] = await db
      .select({ slug: schema.collections.slug })
      .from(schema.collections)
      .where(eq(schema.collections.slug, slug))
      .limit(1);
    if (clash) fieldErrors.slug = "taken";
  }

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  // An empty rule means curated. Anything else must be a rule the code knows
  // how to evaluate, or the collection would silently show nothing.
  const rule = ruleRaw && isCollectionRule(ruleRaw) ? ruleRaw : null;

  const values = {
    slug,
    name: { en: nameEn, ar: nameAr },
    blurb: blurbEn || blurbAr ? { en: blurbEn, ar: blurbAr } : null,
    rule,
    position,
    visible,
  };

  if (isNew) {
    await db.insert(schema.collections).values(values);
  } else {
    // Membership rows point at the slug by foreign key, so they go before a
    // rename can happen; they are written back below in the form's order.
    // (A collection that switched from curated to automatic keeps none:
    // the rule decides membership and a stored list would only mislead.)
    await db
      .delete(schema.collectionProducts)
      .where(eq(schema.collectionProducts.collectionSlug, original));
    await db
      .update(schema.collections)
      .set(values)
      .where(eq(schema.collections.slug, original));
  }

  // Curated membership, in the order the form listed it. Replacing wholesale is
  // simpler than diffing and the lists are small.
  if (!rule) {
    const ids = formData
      .getAll("member")
      .map((v) => String(v))
      .filter(Boolean);

    if (ids.length) {
      await db.insert(schema.collectionProducts).values(
        ids.map((productId, index) => ({
          collectionSlug: slug,
          productId,
          position: index,
        })),
      );
    }
  }

  await storefrontChanged();
  redirect(`/admin/collections?${isNew ? "created" : "saved"}=1`);
}

export async function deleteCollection(formData: FormData) {
  await requireAdmin();

  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  const db = await getDb();
  // Membership rows cascade. The products themselves are untouched — a
  // collection is a view onto the catalogue, not a container for it.
  await db.delete(schema.collections).where(eq(schema.collections.slug, slug));

  await storefrontChanged();
  redirect("/admin/collections?deleted=1");
}

/* --------------------------------------------------------------------------
 * Customers
 * ----------------------------------------------------------------------- */

export async function setSubscribed(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const subscribed = formData.get("subscribed") === "1";

  const db = await getDb();
  await db
    .update(schema.subscribers)
    .set({ unsubscribedAt: subscribed ? null : new Date() })
    .where(eq(schema.subscribers.id, id));

  redirect("/admin/customers?done=1");
}

export async function deleteSubscriber(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const db = await getDb();
  await db.delete(schema.subscribers).where(eq(schema.subscribers.id, id));

  redirect("/admin/customers?deleted=1");
}

/* --------------------------------------------------------------------------
 * Shipping and delivery
 * ----------------------------------------------------------------------- */

export type ShippingFormState = {
  fieldErrors?: Record<string, string>;
};

export async function saveShipping(
  _prev: ShippingFormState,
  formData: FormData,
): Promise<ShippingFormState> {
  await requireAdmin();

  const fieldErrors: Record<string, string> = {};

  // parseDinars returns null rather than 0 for unreadable input. That matters:
  // a typo silently becoming 0 would make delivery free on every order.
  const freeThreshold = parseDinars(
    String(formData.get("freeThreshold") ?? ""),
  );
  const flatRate = parseDinars(String(formData.get("flatRate") ?? ""));
  const codFee = parseDinars(String(formData.get("codFee") ?? ""));

  if (freeThreshold === null) fieldErrors.freeThreshold = "amount";
  if (flatRate === null) fieldErrors.flatRate = "amount";
  if (codFee === null) fieldErrors.codFee = "amount";

  const returnsDays = Number(formData.get("returnsDays"));
  if (!Number.isInteger(returnsDays) || returnsDays < 0 || returnsDays > 365) {
    fieldErrors.returnsDays = "days";
  }

  const deliveryEn = String(formData.get("deliveryEn") ?? "").trim();
  const deliveryAr = String(formData.get("deliveryAr") ?? "").trim();
  if (!deliveryEn) fieldErrors.deliveryEn = "required";
  if (!deliveryAr) fieldErrors.deliveryAr = "required";

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const shipping: ShippingSettings = {
    freeThreshold: freeThreshold!,
    flatRate: flatRate!,
    codEnabled: formData.get("codEnabled") === "on",
    codFee: codFee!,
    deliveryWindow: { en: deliveryEn, ar: deliveryAr },
    returnsDays,
  };

  await writeSetting(SETTINGS_KEYS.shipping, shipping);
  redirect("/admin/shipping?saved=1");
}

/* --------------------------------------------------------------------------
 * Languages
 * ----------------------------------------------------------------------- */

export async function saveLanguages(formData: FormData) {
  await requireAdmin();

  const arabicEnabled = formData.get("arabicEnabled") === "on";
  const requested = String(formData.get("defaultLocale") ?? "en");

  const languages: LanguageSettings = {
    arabicEnabled,
    // Arabic can't be the default while it's switched off — that would send
    // every visitor to a language the shop isn't serving.
    defaultLocale: requested === "ar" && arabicEnabled ? "ar" : "en",
  };

  await writeSetting(SETTINGS_KEYS.languages, languages);
  redirect("/admin/languages?saved=1");
}

/* --------------------------------------------------------------------------
 * Settings
 * ----------------------------------------------------------------------- */

/** Upsert for one settings group. */
async function writeSetting(key: string, value: unknown) {
  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value } });

  await storefrontChanged();
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();

  const social: SocialLinks = {
    instagram: normaliseSocial(
      "instagram",
      String(formData.get("instagram") ?? ""),
    ),
    tiktok: normaliseSocial("tiktok", String(formData.get("tiktok") ?? "")),
    whatsapp: normaliseSocial(
      "whatsapp",
      String(formData.get("whatsapp") ?? ""),
    ),
    email: normaliseSocial("email", String(formData.get("email") ?? "")),
  };

  await writeSetting(SETTINGS_KEYS.social, social);
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
  // Only back into the admin: the field is posted by the browser, and a
  // redirect to an arbitrary address would make this an open redirect.
  const returnTo = String(formData.get("returnTo") ?? "");
  redirect(
    returnTo.startsWith("/admin") && !returnTo.startsWith("/admin//")
      ? returnTo
      : "/admin",
  );
}

/* --------------------------------------------------------------------------
 * Import & export
 * ----------------------------------------------------------------------- */

export type ImportState = {
  kind?: "products" | "inventory";
  /** Rows the file contained, before any problem check. */
  rows?: number;
  checkedOnly?: boolean;
  created?: number;
  updated?: number;
  problems?: ImportProblem[];
  missingColumns?: string[];
  error?: string;
};

/** 2MB of CSV is tens of thousands of rows; anything bigger is a mistake. */
const MAX_CSV_BYTES = 2 * 1024 * 1024;

async function readCsv(
  formData: FormData,
): Promise<string | { error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "empty" };
  if (file.size > MAX_CSV_BYTES) return { error: "size" };
  return file.text();
}

/**
 * Product CSV in. Validates every row first and writes nothing unless the
 * whole file is clean: a half-imported sheet is worse than a rejected one.
 * "Check only" runs the same validation and stops.
 */
export async function importProducts(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdmin();
  const csv = await readCsv(formData);
  if (typeof csv !== "string") return { kind: "products", error: csv.error };

  const plan = await planProductImport(csv);
  const rows =
    plan.products.length + new Set(plan.problems.map((p) => p.line)).size;
  const checkedOnly = formData.get("check") === "on";
  if (plan.missingColumns.length || plan.problems.length || checkedOnly) {
    return {
      kind: "products",
      rows,
      checkedOnly,
      problems: plan.problems,
      missingColumns: plan.missingColumns,
    };
  }

  const result = await applyProductImport(plan);
  await storefrontChanged();
  return { kind: "products", rows, ...result, problems: [] };
}

export async function importInventory(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdmin();
  const csv = await readCsv(formData);
  if (typeof csv !== "string") return { kind: "inventory", error: csv.error };

  const plan = await planInventoryImport(csv);
  const rows = plan.updates.length + plan.problems.length;
  const checkedOnly = formData.get("check") === "on";
  if (plan.missingColumns.length || plan.problems.length || checkedOnly) {
    return {
      kind: "inventory",
      rows,
      checkedOnly,
      problems: plan.problems,
      missingColumns: plan.missingColumns,
    };
  }

  const updated = await applyInventoryImport(plan);
  await storefrontChanged();
  return { kind: "inventory", rows, updated, problems: [] };
}

/**
 * Bulk photos: the browser has already uploaded each file through
 * /admin/upload and matched it to a handle by filename; this attaches the
 * resulting URLs. Only URLs this shop issued are kept, as everywhere else.
 */
export async function attachPhotos(
  batches: { handle: string; urls: string[] }[],
): Promise<{ attached: number; unknown: string[] }> {
  await requireAdmin();
  const clean = batches
    .filter((b) => typeof b.handle === "string" && Array.isArray(b.urls))
    .map((b) => ({
      handle: b.handle.trim(),
      urls: b.urls.map(String).slice(0, 12),
    }))
    .slice(0, 500);
  const result = await attachPhotosByHandle(clean);
  if (result.attached) await storefrontChanged();
  return result;
}

/* --------------------------------------------------------------------------
 * Inbox
 * ----------------------------------------------------------------------- */

export async function setMessageRead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await markMessageRead(id, String(formData.get("read")) === "1");
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteMessage(id);
  redirect("/admin/messages?deleted=1");
}
