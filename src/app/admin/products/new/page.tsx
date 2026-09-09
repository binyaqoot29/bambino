import Link from "next/link";
import { redirect } from "next/navigation";

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

export default async function NewProductPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  // Bind the id up front so the form action's signature stays (state, formData).
  const action = saveProduct.bind(null, null);

  return (
    <div>
      <Link
        href="/admin"
        className="link-draw text-ink-500 hover:text-ink-900 text-xs"
      >
        ← Products
      </Link>
      <h1 className="font-display text-ink-900 mt-2 mb-6 text-3xl">
        Add product
      </h1>

      <ProductForm
        action={action}
        categories={await categoryOptions()}
        arts={artOptions}
        colours={colourOptions}
        sizes={sizeOptions}
        ages={ageOptions}
      />
    </div>
  );
}
