import "server-only";

import { eq, inArray } from "drizzle-orm";

import { getDb, schema } from "@/db";
import { freeProductId } from "@/lib/catalog/product-id";
import type { OrderRow } from "@/db/schema";
import { loadCategories } from "@/lib/catalog/categories";
import { COLOURS, SIZE_LABELS } from "@/lib/catalog/taxonomy";
import {
  AGE_GROUP_LABELS,
  type AgeGroup,
  type ArtKey,
  type Product,
} from "@/lib/catalog/types";
import { parseCsv, toCsv } from "@/lib/csv";
import { GOVERNORATE_LABELS } from "@/lib/orders/types";

/**
 * Catalogue in and out as CSV.
 *
 * One format for both directions: what "Export products" writes is exactly
 * what "Import products" reads, so the shop owner can export, edit prices in
 * a spreadsheet, and import the same file back. Rows are matched on
 * `handle`; a handle the shop doesn't have creates a product, one it does
 * updates it. Nothing is ever deleted by an import.
 *
 * Money is written in dinars with three decimals (12.500), the way it is
 * typed in the admin, and converted to fils on the way in. Lists are
 * comma-separated inside one cell; detail bullets use " | " because a bullet
 * can contain a comma.
 */

const ART_KEYS: ArtKey[] = [
  "bodysuit",
  "dress",
  "tee",
  "sleepsuit",
  "stroller",
  "carseat",
  "cot",
  "bedding",
  "bottle",
  "highchair",
  "teddy",
  "booties",
  "bath",
  "bag",
];

const PRODUCT_COLUMNS = [
  "handle",
  "name_en",
  "name_ar",
  "summary_en",
  "summary_ar",
  "description_en",
  "description_ar",
  "details_en",
  "details_ar",
  "care_en",
  "care_ar",
  "category",
  "price",
  "compare_at_price",
  "art",
  "age_groups",
  "colours",
  "sizes",
  "stock",
  "featured",
  "bestseller",
  "rating",
  "review_count",
  "images",
] as const;

const REQUIRED = [
  "handle",
  "name_en",
  "name_ar",
  "summary_en",
  "summary_ar",
  "description_en",
  "description_ar",
  "category",
  "price",
  "art",
  "colours",
  "sizes",
] as const;

const dinars = (fils: number | null | undefined) =>
  fils === null || fils === undefined ? "" : (fils / 1000).toFixed(3);

const list = (values: string[]) => values.join(", ");
const splitList = (value: string) =>
  value
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
const splitLines = (value: string) =>
  value
    .split(/\s*\|\s*|\n/)
    .map((v) => v.trim())
    .filter(Boolean);

const yes = (value: string) => /^(yes|y|true|1)$/i.test(value.trim());

function parseDinars(input: string): number | null {
  const trimmed = input.trim().replace(/[^\d.]/g, "");
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

/* --------------------------------------------------------------------------
 * Export
 * ----------------------------------------------------------------------- */

export function productsToCsv(products: Product[]): string {
  const rows = products.map((p) => [
    p.handle,
    p.name.en,
    p.name.ar,
    p.summary.en,
    p.summary.ar,
    p.description.en,
    p.description.ar,
    p.details.map((d) => d.en).join(" | "),
    p.details.map((d) => d.ar).join(" | "),
    p.care?.en ?? "",
    p.care?.ar ?? "",
    p.category,
    dinars(p.price),
    dinars(p.compareAtPrice),
    p.art,
    list(p.ageGroups),
    list(p.colours.map((c) => c.key)),
    list([...new Set(p.variants.map((v) => v.size))]),
    "",
    p.featured ? "yes" : "no",
    p.bestseller ? "yes" : "no",
    p.rating,
    p.reviewCount,
    list(p.images),
  ]);
  return toCsv([...PRODUCT_COLUMNS], rows);
}

/** An empty sheet with the header and one example row to copy from. */
export function productTemplateCsv(): string {
  return toCsv(
    [...PRODUCT_COLUMNS],
    [
      [
        "cloud-sleepsuit",
        "Cloud sleepsuit",
        "بذلة نوم السحابة",
        "Soft cotton, poppers all the way down",
        "قطن ناعم بأزرار كبّاس حتى الأسفل",
        "A sleepsuit for the first months…",
        "بذلة نوم للأشهر الأولى…",
        "100% cotton | Poppers at the legs",
        "قطن 100% | كبّاسات عند الساقين",
        "Machine wash at 30°",
        "غسيل بالغسالة على 30°",
        "sleepsuits",
        "7.500",
        "9.000",
        "sleepsuit",
        "newborn, 0-6m",
        "cloud, cream",
        "0-3m, 3-6m",
        "5",
        "no",
        "no",
        "4.5",
        "0",
        "",
      ],
    ],
  );
}

export function inventoryToCsv(products: Product[]): string {
  const rows = products.flatMap((p) =>
    p.variants.map((v) => [p.handle, p.name.en, v.colour, v.size, v.stock]),
  );
  return toCsv(["handle", "product", "colour", "size", "stock"], rows);
}

export function ordersToCsv(orders: OrderRow[]): string {
  const rows = orders.map((o) => [
    o.reference,
    o.status,
    o.createdAt,
    o.customerName,
    o.phone,
    o.email ?? "",
    GOVERNORATE_LABELS[o.address.governorate]?.en ?? o.address.governorate,
    o.address.area,
    o.address.block,
    o.address.street,
    o.address.building,
    o.address.extra,
    o.paymentMethod,
    o.paymentStatus,
    dinars(o.subtotal),
    dinars(o.deliveryFee),
    dinars(o.codFee),
    dinars(o.total),
    o.lines
      .map(
        (l) =>
          `${l.quantity}× ${l.name.en} (${l.colour}/${l.size}) @ ${dinars(l.unitPrice)}`,
      )
      .join(" | "),
    o.note ?? "",
    o.staffNote ?? "",
    o.locale,
  ]);
  return toCsv(
    [
      "reference",
      "status",
      "placed_at",
      "customer",
      "phone",
      "email",
      "governorate",
      "area",
      "block",
      "street",
      "building",
      "extra",
      "payment_method",
      "payment_status",
      "subtotal",
      "delivery_fee",
      "cod_fee",
      "total",
      "items",
      "customer_note",
      "staff_note",
      "language",
    ],
    rows,
  );
}

/* --------------------------------------------------------------------------
 * Import — products
 * ----------------------------------------------------------------------- */

export type ImportProblem = { line: number; handle: string; message: string };

type ParsedProduct = {
  handle: string;
  values: Omit<typeof schema.products.$inferInsert, "id" | "createdAt">;
  colours: string[];
  sizes: string[];
  stock: number;
};

export type ProductImportPlan = {
  products: ParsedProduct[];
  problems: ImportProblem[];
  missingColumns: string[];
};

/** Reads and validates a product CSV. Nothing is written. */
export async function planProductImport(
  csv: string,
): Promise<ProductImportPlan> {
  const { header, rows } = parseCsv(csv);
  const missingColumns = REQUIRED.filter((c) => !header.includes(c));
  if (missingColumns.length) {
    return { products: [], problems: [], missingColumns };
  }

  const categories = new Map((await loadCategories()).map((c) => [c.slug, c]));
  // Colours a product defined for itself stay valid on re-import.
  const db = await getDb();
  const own = new Map(
    (
      await db
        .select({
          handle: schema.products.handle,
          customColours: schema.products.customColours,
        })
        .from(schema.products)
    ).map((p) => [
      p.handle,
      new Set((p.customColours ?? []).map((c) => c.key)),
    ]),
  );
  const problems: ImportProblem[] = [];
  const products: ParsedProduct[] = [];
  const seen = new Set<string>();

  rows.forEach((row, index) => {
    const line = index + 2; // 1-based, after the header
    const handle = slugify(row.handle || row.name_en);
    const fail = (message: string) =>
      problems.push({ line, handle: handle || "(blank)", message });

    if (!handle) return fail("handle is blank");
    if (seen.has(handle)) return fail("handle appears twice in the file");
    seen.add(handle);

    for (const key of REQUIRED) {
      if (key !== "handle" && !row[key]) fail(`${key} is blank`);
    }

    const category = categories.get(row.category);
    if (row.category && !category)
      fail(`category "${row.category}" does not exist`);

    const art = row.art as ArtKey;
    if (row.art && !ART_KEYS.includes(art))
      fail(`art "${row.art}" is not one of: ${ART_KEYS.join(", ")}`);

    const price = parseDinars(row.price);
    if (row.price && price === null)
      fail(`price "${row.price}" is not a number like 12.500`);

    let compareAt: number | null = null;
    if (row.compare_at_price) {
      compareAt = parseDinars(row.compare_at_price);
      if (compareAt === null)
        fail(`compare_at_price "${row.compare_at_price}" is not a number`);
      else if (price !== null && compareAt <= price)
        fail("compare_at_price must be higher than price");
    }

    const colours = splitList(row.colours);
    const badColours = colours.filter(
      (c) => !COLOURS[c] && !own.get(handle)?.has(c),
    );
    if (badColours.length)
      fail(
        `unknown colours: ${badColours.join(", ")} (use: ${Object.keys(COLOURS).join(", ")})`,
      );

    const sizes = splitList(row.sizes);
    const badSizes = sizes.filter((s) => !(s in SIZE_LABELS));
    if (badSizes.length)
      fail(
        `unknown sizes: ${badSizes.join(", ")} (use: ${Object.keys(SIZE_LABELS).join(", ")})`,
      );

    const ageGroups = splitList(row.age_groups ?? "") as AgeGroup[];
    const badAges = ageGroups.filter((a) => !(a in AGE_GROUP_LABELS));
    if (badAges.length)
      fail(
        `unknown age groups: ${badAges.join(", ")} (use: ${Object.keys(AGE_GROUP_LABELS).join(", ")})`,
      );

    const detailsEn = splitLines(row.details_en ?? "");
    const detailsAr = splitLines(row.details_ar ?? "");
    if (detailsEn.length !== detailsAr.length)
      fail(
        `details_en has ${detailsEn.length} bullet(s) but details_ar has ${detailsAr.length}`,
      );

    const careEn = row.care_en ?? "";
    const careAr = row.care_ar ?? "";
    if (Boolean(careEn) !== Boolean(careAr))
      fail("care needs both languages, or neither");

    const images = splitList(row.images ?? "")
      .filter(isOwnImage)
      .slice(0, 12);

    if (problems.some((p) => p.line === line)) return;

    products.push({
      handle,
      colours,
      sizes,
      stock: Math.max(0, Math.trunc(Number(row.stock)) || 0),
      values: {
        handle,
        name: { en: row.name_en, ar: row.name_ar },
        summary: { en: row.summary_en, ar: row.summary_ar },
        description: { en: row.description_en, ar: row.description_ar },
        details: detailsEn.map((en, i) => ({ en, ar: detailsAr[i] })),
        care: careEn ? { en: careEn, ar: careAr } : null,
        category: row.category,
        department: category!.department,
        price: price!,
        compareAtPrice: compareAt,
        art,
        images,
        ageGroups,
        rating: Math.min(5, Math.max(0, Number(row.rating) || 0)),
        reviewCount: Math.max(0, Math.trunc(Number(row.review_count)) || 0),
        featured: yes(row.featured ?? ""),
        bestseller: yes(row.bestseller ?? ""),
        updatedAt: new Date(),
      },
    });
  });

  return { products, problems, missingColumns: [] };
}

/**
 * Writes a validated plan. Returns how many rows created and updated.
 *
 * Variants follow the same rule as the product form: every colour × size
 * combination exists after the import, combinations that already existed
 * keep their stock, new ones get the row's `stock`. A colour or size removed
 * from the row removes its variants.
 */
export async function applyProductImport(
  plan: ProductImportPlan,
): Promise<{ created: number; updated: number }> {
  const db = await getDb();
  const handles = plan.products.map((p) => p.handle);
  const existing = handles.length
    ? await db
        .select({ id: schema.products.id, handle: schema.products.handle })
        .from(schema.products)
        .where(inArray(schema.products.handle, handles))
    : [];
  const idByHandle = new Map(existing.map((e) => [e.handle, e.id]));

  let created = 0;
  let updated = 0;

  for (const item of plan.products) {
    let id = idByHandle.get(item.handle);
    if (id) {
      // Keep the shop's photos when the sheet has none: a spreadsheet edit
      // of prices must not strip the photography.
      const [current] = await db
        .select({ images: schema.products.images })
        .from(schema.products)
        .where(eq(schema.products.id, id))
        .limit(1);
      const values = {
        ...item.values,
        images: item.values.images?.length
          ? item.values.images
          : (current?.images ?? []),
      };
      await db
        .update(schema.products)
        .set(values)
        .where(eq(schema.products.id, id));
      updated++;
    } else {
      id = await freeProductId(db, item.handle);
      await db.insert(schema.products).values({ id, ...item.values });
      created++;
    }

    const rows = await db
      .select()
      .from(schema.variants)
      .where(eq(schema.variants.productId, id));
    const previousStock = new Map(
      rows.map((v) => [`${v.colour}::${v.size}`, v.stock]),
    );
    await db.delete(schema.variants).where(eq(schema.variants.productId, id));
    const variants = item.colours.flatMap((colour) =>
      item.sizes.map((size) => ({
        id: `${id}--${colour}--${size}`,
        productId: id!,
        colour,
        size,
        stock: previousStock.get(`${colour}::${size}`) ?? item.stock,
      })),
    );
    if (variants.length) await db.insert(schema.variants).values(variants);
  }

  return { created, updated };
}

/* --------------------------------------------------------------------------
 * Import — inventory
 * ----------------------------------------------------------------------- */

export type InventoryImportPlan = {
  updates: {
    variantId: string;
    handle: string;
    colour: string;
    size: string;
    stock: number;
  }[];
  problems: ImportProblem[];
  missingColumns: string[];
};

export async function planInventoryImport(
  csv: string,
): Promise<InventoryImportPlan> {
  const { header, rows } = parseCsv(csv);
  const missingColumns = ["handle", "colour", "size", "stock"].filter(
    (c) => !header.includes(c),
  );
  if (missingColumns.length)
    return { updates: [], problems: [], missingColumns };

  const db = await getDb();
  const handles = [...new Set(rows.map((r) => r.handle).filter(Boolean))];
  const products = handles.length
    ? await db
        .select({ id: schema.products.id, handle: schema.products.handle })
        .from(schema.products)
        .where(inArray(schema.products.handle, handles))
    : [];
  const idByHandle = new Map(products.map((p) => [p.handle, p.id]));
  const variants = products.length
    ? await db
        .select()
        .from(schema.variants)
        .where(
          inArray(
            schema.variants.productId,
            products.map((p) => p.id),
          ),
        )
    : [];
  const variantId = new Map(
    variants.map((v) => [`${v.productId}::${v.colour}::${v.size}`, v.id]),
  );

  const problems: ImportProblem[] = [];
  const updates: InventoryImportPlan["updates"] = [];

  rows.forEach((row, index) => {
    const line = index + 2;
    const fail = (message: string) =>
      problems.push({ line, handle: row.handle || "(blank)", message });
    const productId = idByHandle.get(row.handle);
    if (!productId) return fail("no product with this handle");
    const id = variantId.get(`${productId}::${row.colour}::${row.size}`);
    if (!id)
      return fail(`no variant ${row.colour} / ${row.size} on this product`);
    const stock = Math.trunc(Number(row.stock));
    if (!Number.isFinite(stock) || stock < 0)
      return fail(`stock "${row.stock}" is not a whole number`);
    updates.push({
      variantId: id,
      handle: row.handle,
      colour: row.colour,
      size: row.size,
      stock,
    });
  });

  return { updates, problems, missingColumns: [] };
}

export async function applyInventoryImport(
  plan: InventoryImportPlan,
): Promise<number> {
  const db = await getDb();
  for (const u of plan.updates) {
    await db
      .update(schema.variants)
      .set({ stock: u.stock })
      .where(eq(schema.variants.id, u.variantId));
  }
  return plan.updates.length;
} /** Appends photos to products by handle. Returns handles it could not find. */
export async function attachPhotosByHandle(
  batches: { handle: string; urls: string[] }[],
): Promise<{ attached: number; unknown: string[] }> {
  const db = await getDb();
  const handles = batches.map((b) => b.handle);
  const rows = handles.length
    ? await db
        .select({
          id: schema.products.id,
          handle: schema.products.handle,
          images: schema.products.images,
        })
        .from(schema.products)
        .where(inArray(schema.products.handle, handles))
    : [];
  const byHandle = new Map(rows.map((r) => [r.handle, r]));

  let attached = 0;
  const unknown: string[] = [];
  for (const batch of batches) {
    const product = byHandle.get(batch.handle);
    const urls = batch.urls.filter(isOwnImage);
    if (!product) {
      unknown.push(batch.handle);
      continue;
    }
    const images = [...new Set([...(product.images ?? []), ...urls])].slice(
      0,
      12,
    );
    await db
      .update(schema.products)
      .set({ images, updatedAt: new Date() })
      .where(eq(schema.products.id, product.id));
    attached += urls.length;
  }
  return { attached, unknown };
}
