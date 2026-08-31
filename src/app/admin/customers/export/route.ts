import { isAuthenticated } from "@/admin/auth";
import { loadSubscribers, toCsv } from "@/lib/subscribers";

/**
 * Subscriber CSV, for whatever the shop actually sends mail from.
 *
 * Auth is re-checked here rather than relying on the admin layout: a route
 * handler is its own endpoint, so a layout redirect protects the page but not
 * this URL, and this one returns the whole list.
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return new Response("Not authorised", { status: 401 });
  }

  const csv = toCsv(await loadSubscribers());

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="bambino-subscribers.csv"',
      // A mailing list is not something to leave in a shared cache.
      "cache-control": "no-store",
    },
  });
}
