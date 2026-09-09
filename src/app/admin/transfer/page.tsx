/* eslint-disable @next/next/no-html-link-for-pages --
   The export links point at route handlers that return files. A <Link>
   would try to fetch them as pages through the client router. */
import { redirect } from "next/navigation";

import { importInventory, importProducts } from "@/admin/actions";
import { isAuthenticated } from "@/admin/auth";
import { adminDictionary, getAdminLocale } from "@/admin/i18n";
import { BulkPhotos } from "@/admin/ui/BulkPhotos";
import { ImportForm } from "@/admin/ui/ImportForm";
import { getAllProducts } from "@/lib/catalog/queries";

/**
 * Import & export.
 *
 * Three ways in and four ways out, all CSV except the photos. The page is
 * deliberately plain: each block says what the file is, what it needs, and
 * what will happen, because the person using it is standing in a stockroom
 * with a spreadsheet, not reading documentation.
 */
export default async function TransferPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [locale, products] = await Promise.all([
    getAdminLocale(),
    getAllProducts(),
  ]);
  const t = adminDictionary(locale).transfer;

  const exports = [
    { kind: "products", title: t.exportProducts, body: t.exportProductsBody },
    {
      kind: "inventory",
      title: t.exportInventory,
      body: t.exportInventoryBody,
    },
    { kind: "orders", title: t.exportOrders, body: t.exportOrdersBody },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-ink-900 text-3xl">{t.title}</h1>
      <p className="text-ink-500 mt-2 mb-8 text-sm">{t.blurb}</p>

      <section className="rounded-card bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-ink-900 text-xl">{t.exportTitle}</h2>
        <p className="text-ink-500 mt-1 text-[13px]">{t.exportBody}</p>
        <ul className="divide-ink-200/70 mt-5 divide-y">
          {exports.map((item) => (
            <li
              key={item.kind}
              className="flex flex-wrap items-center justify-between gap-3 py-3.5"
            >
              <div>
                <p className="text-ink-900 text-sm font-medium">{item.title}</p>
                <p className="text-ink-500 text-[13px]">{item.body}</p>
              </div>
              <a
                href={`/admin/export/${item.kind}`}
                className="ring-ink-300 hover:bg-ink-900 hover:text-white inline-flex h-10 shrink-0 items-center rounded-full bg-white px-5 text-[13px] font-medium ring-1 transition-colors duration-200"
              >
                {t.download}
              </a>
            </li>
          ))}
          <li className="flex flex-wrap items-center justify-between gap-3 py-3.5">
            <p className="text-ink-700 text-sm">{t.template}</p>
            <a
              href="/admin/export/template"
              className="link-draw text-ink-800 hover:text-ink-900 text-[13px] font-medium"
            >
              {t.download}
            </a>
          </li>
        </ul>
      </section>

      <section className="rounded-card mt-6 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-ink-900 text-xl">
          {t.importProducts}
        </h2>
        <p className="text-ink-500 mt-1 mb-5 text-[13px] leading-relaxed">
          {t.importProductsBody}
        </p>
        <ImportForm
          id="products"
          action={importProducts}
          labels={{
            file: t.file,
            checkOnly: t.checkOnly,
            run: t.run,
            checking: t.checking,
            problemsTitle: t.problemsTitle,
            missingColumns: t.missingColumns,
            line: t.line,
            checked: t.checked,
            done: t.done,
            empty: t.empty,
            tooLarge: t.tooLarge,
          }}
        />
      </section>

      <section className="rounded-card mt-6 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-ink-900 text-xl">
          {t.importInventory}
        </h2>
        <p className="text-ink-500 mt-1 mb-5 text-[13px] leading-relaxed">
          {t.importInventoryBody}
        </p>
        <ImportForm
          id="inventory"
          action={importInventory}
          labels={{
            file: t.file,
            checkOnly: t.checkOnly,
            run: t.run,
            checking: t.checking,
            problemsTitle: t.problemsTitle,
            missingColumns: t.missingColumns,
            line: t.line,
            checked: t.checked,
            done: t.doneInventory,
            empty: t.empty,
            tooLarge: t.tooLarge,
          }}
        />
      </section>

      <section className="rounded-card mt-6 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-ink-900 text-xl">{t.photosTitle}</h2>
        <p className="text-ink-500 mt-1 mb-5 text-[13px] leading-relaxed">
          {t.photosBody}
        </p>
        <BulkPhotos
          handles={products.map((p) => p.handle)}
          labels={{
            pick: t.photosPick,
            matched: t.photosMatched,
            unmatched: t.photosUnmatched,
            upload: t.photosUpload,
            uploading: t.photosUploading,
            done: t.photosDone,
            unknown: t.photosUnknown,
            failed: t.photosFailed,
            remove: t.remove,
            fileColumn: t.fileColumn,
            productColumn: t.productColumn,
          }}
        />
      </section>
    </div>
  );
}
