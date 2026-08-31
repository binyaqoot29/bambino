import { getAllProducts } from "@/lib/catalog/queries";
import type { PickableProduct } from "./ui/CollectionForm";

/**
 * The catalogue reduced to what a picker needs.
 *
 * The full product shape carries variants, descriptions and bilingual copy for
 * every row; sending all of it to the browser to render a list of names would
 * be most of the catalogue in the page payload.
 */
export async function pickableProducts(): Promise<PickableProduct[]> {
  const products = await getAllProducts();
  return products.map((product) => ({
    id: product.id,
    name: product.name.en,
    category: product.category,
  }));
}
