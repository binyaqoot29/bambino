import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteProduct } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { ProductArt } from "@/components/product/ProductArt";
import { getAllProducts } from "@/lib/catalog/queries";
import { categoryBySlug } from "@/lib/catalog/taxonomy";
import { inStock } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/money";

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const params = await searchParams;
  const query = String(params.q ?? "").trim().toLowerCase();
  const saved = params.saved ? String(params.saved) : null;
  const deleted = Boolean(params.deleted);

  const all = await getAllProducts();
  const products = query
    ? all.filter((p) =>
        [p.name.en, p.name.ar, p.handle, p.category]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : all;

  const totalStock = (id: string) =>
    all
      .find((p) => p.id === id)!
      .variants.reduce((n, v) => n + v.stock, 0);

  return (
    <div>
      {saved ? (
        <p className="bg-success/10 text-success mb-4 rounded-lg px-4 py-2.5 text-sm font-medium">
          Saved “{saved}”.
        </p>
      ) : null}
      {deleted ? (
        <p className="bg-ink-200 text-ink-700 mb-4 rounded-lg px-4 py-2.5 text-sm font-medium">
          Product deleted.
        </p>
      ) : null}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink-900 text-xl font-bold">Products</h1>
          <p className="text-ink-500 mt-0.5 text-xs tabular-nums">
            {all.length} in the catalogue
            {query ? ` · ${products.length} matching` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form method="get" className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search products…"
              className="ring-ink-300 focus:ring-brand-500 h-9 w-52 rounded-lg bg-white px-3 text-sm ring-1 focus:ring-2 focus:outline-none"
            />
          </form>
          <Link
            href="/admin/products/new"
            className="bg-brand-500 hover:bg-brand-600 inline-flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white"
          >
            Add product
          </Link>
        </div>
      </div>

      <div className="ring-ink-200 overflow-hidden rounded-xl bg-white ring-1">
        <table className="w-full text-sm">
          <thead className="border-ink-200 bg-ink-50 border-b">
            <tr className="text-ink-500 text-left text-[11px] tracking-wide uppercase">
              <th className="px-4 py-2.5 font-semibold">Product</th>
              <th className="px-4 py-2.5 font-semibold">Category</th>
              <th className="px-4 py-2.5 font-semibold">Price</th>
              <th className="px-4 py-2.5 font-semibold">Stock</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-ink-100 divide-y">
            {products.map((product) => {
              const category = categoryBySlug(product.category);
              const stock = totalStock(product.id);
              return (
                <tr key={product.id} className="hover:bg-ink-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductArt
                        art={product.art}
                        seed={product.id}
                        className="size-10 shrink-0 rounded-md"
                      />
                      <div className="min-w-0">
                        <p className="text-ink-900 truncate font-medium">
                          {product.name.en}
                        </p>
                        <p className="text-ink-400 truncate text-xs" dir="rtl">
                          {product.name.ar}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-ink-600 px-4 py-3 text-xs">
                    {category?.name.en ?? product.category}
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums">
                    <span className="text-ink-900 font-medium">
                      {formatPrice(product.price, "en")}
                    </span>
                    {product.compareAtPrice ? (
                      <span className="text-ink-400 ms-1.5 line-through">
                        {formatPrice(product.compareAtPrice, "en")}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums">
                    <span
                      className={
                        inStock(product)
                          ? "text-ink-700"
                          : "text-sale font-semibold"
                      }
                    >
                      {stock}
                    </span>
                    <span className="text-ink-400">
                      {" "}
                      / {product.variants.length} variants
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-brand-600 hover:text-brand-700 text-xs font-semibold"
                    >
                      Edit
                    </Link>
                    <form action={deleteProduct} className="ms-3 inline">
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        className="text-ink-400 hover:text-sale text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products.length === 0 ? (
          <p className="text-ink-500 px-4 py-12 text-center text-sm">
            {query
              ? `Nothing matches “${query}”.`
              : "No products yet — add the first one."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
