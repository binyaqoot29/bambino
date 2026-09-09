import { isAuthenticated } from "@/admin/auth";
import { getAllProducts } from "@/lib/catalog/queries";
import { csvResponse } from "@/lib/csv";
import { loadOrders } from "@/lib/orders/queries";
import {
  inventoryToCsv,
  ordersToCsv,
  productTemplateCsv,
  productsToCsv,
} from "@/lib/transfer/products";

/**
 * CSV downloads for the admin: the catalogue, the stock sheet, the orders,
 * and an empty product template.
 *
 * Auth is re-checked here rather than relying on the admin layout: a route
 * handler is its own endpoint, and every one of these returns the whole
 * table.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  if (!(await isAuthenticated())) {
    return new Response("Not authorised", { status: 401 });
  }

  const { kind } = await params;
  const stamp = new Date().toISOString().slice(0, 10);

  switch (kind) {
    case "products":
      return csvResponse(
        `bambino-products-${stamp}.csv`,
        productsToCsv(await getAllProducts()),
      );
    case "inventory":
      return csvResponse(
        `bambino-inventory-${stamp}.csv`,
        inventoryToCsv(await getAllProducts()),
      );
    case "orders":
      return csvResponse(
        `bambino-orders-${stamp}.csv`,
        ordersToCsv(await loadOrders()),
      );
    case "template":
      return csvResponse("bambino-products-template.csv", productTemplateCsv());
    default:
      return new Response("Not found", { status: 404 });
  }
}
