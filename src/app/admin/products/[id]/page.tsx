import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { saveProduct } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { ProductForm } from "@/admin/ui/ProductForm";
import {
  ageOptions,
  artOptions,
  categoryOptions,
  colourOptions,
  sizeOptions,
} from "@/admin/ui/form-options";
import { loadProductById } from "@/lib/catalog/repository";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const { id } = await params;
  const product = await loadProductById(id);
  if (!product) notFound();

  const action = saveProduct.bind(null, product.id);

  return (
    <div>
      <Link href="/admin" className="text-ink-500 hover:text-brand-600 text-xs font-medium">
        ← Products
      </Link>
      <div className="mt-2 mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-ink-900 text-xl font-bold">{product.name.en}</h1>
        <Link
          href={`/en/p/${product.handle}`}
          target="_blank"
          className="text-brand-600 hover:text-brand-700 text-xs font-semibold"
        >
          View on the shop ↗
        </Link>
      </div>

      <ProductForm
        action={action}
        product={product}
        categories={await categoryOptions()}
        arts={artOptions}
        colours={colourOptions}
        sizes={sizeOptions}
        ages={ageOptions}
      />
    </div>
  );
}
