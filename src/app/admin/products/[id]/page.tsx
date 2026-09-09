import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { saveProduct } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { serveFromSnapshot } from "@/lib/cache/snapshot";
import { ProductForm } from "@/admin/ui/ProductForm";
import {
  ageOptions,
  artOptions,
  categoryOptions,
  colourFamilies,
  sizeOptions,
} from "@/admin/ui/form-options";
import { getAllProducts } from "@/lib/catalog/queries";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  // Catalogue and settings come from the KV snapshot here too: the admin's
  // own saves refresh it, and a KV write is visible at once where it was
  // made. Actions never read it — they run in their own requests.
  serveFromSnapshot();

  const { id } = await params;
  const product = (await getAllProducts()).find((p) => p.id === id);
  if (!product) notFound();

  const action = saveProduct.bind(null, product.id);

  return (
    <div>
      <Link
        href="/admin/products"
        className="link-draw text-ink-500 hover:text-ink-900 text-xs"
      >
        ← Products
      </Link>
      <div className="mt-2 mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-ink-900 text-3xl">
          {product.name.en}
        </h1>
        <Link
          href={`/en/p/${product.handle}`}
          target="_blank"
          className="link-draw text-ink-800 hover:text-ink-900 text-xs font-medium"
        >
          View on the shop ↗
        </Link>
      </div>

      <ProductForm
        action={action}
        product={product}
        categories={await categoryOptions()}
        arts={artOptions}
        colourFamilies={colourFamilies}
        sizes={sizeOptions}
        ages={ageOptions}
      />
    </div>
  );
}
