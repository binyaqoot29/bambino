import { loadCategories } from "@/lib/catalog/categories";
import {
  COLOUR_FAMILIES,
  COLOURS,
  DEPARTMENT_ORDER,
  SIZE_LABELS,
} from "@/lib/catalog/taxonomy";
import { AGE_GROUP_LABELS, DEPARTMENT_LABELS } from "@/lib/catalog/types";

/**
 * The picklists the product form offers.
 *
 * All sourced from taxonomy.ts, so the admin can only choose values the
 * storefront can actually render — an invented category would have no page and
 * an invented illustration key would draw nothing.
 */

export async function categoryOptions() {
  return (await loadCategories()).map((c) => ({
    value: c.slug,
    label: `${DEPARTMENT_LABELS[c.department].en} · ${c.name.en}`,
  }));
}

export const artOptions = [
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
].map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
})); /** The palette grouped by family, as the picker shows it. */
export const colourFamilies = COLOUR_FAMILIES.map((family) => ({
  key: family.key,
  label: family.name.en,
  colours: family.colours.map((key) => ({
    value: key,
    label: COLOURS[key].name.en,
    hex: COLOURS[key].hex,
  })),
}));

export const sizeOptions = Object.entries(SIZE_LABELS).map(
  ([value, label]) => ({
    value,
    label: label.en,
  }),
);

export const ageOptions = Object.entries(AGE_GROUP_LABELS).map(
  ([value, label]) => ({ value, label: label.en }),
);

export function departmentOptions() {
  return DEPARTMENT_ORDER.map((value) => ({
    value,
    label: DEPARTMENT_LABELS[value].en,
  }));
}
