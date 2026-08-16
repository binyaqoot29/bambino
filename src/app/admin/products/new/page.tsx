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
      <Link href="/admin" className="text-ink-500 hover:text-brand-600 text-xs font-medium">
        ← Products
      </Link>
      <h1 className="text-ink-900 mt-2 mb-5 text-xl font-bold">Add product</h1>

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
