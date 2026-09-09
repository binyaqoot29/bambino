import { isAuthenticated } from "@/admin/auth";
import { MAX_BYTES, saveImage } from "@/lib/uploads/store";

/**
 * Receives a product photo from the admin.
 *
 * A route handler rather than a Server Action because this carries a file:
 * actions are for mutations described by fields, and multipart uploads want a
 * plain endpoint with its own limits and error codes.
 *
 * Auth is checked here in full. A route handler is its own entry point — the
 * admin layout's redirect protects the pages, not this URL, and an open upload
 * endpoint is somewhere to park anything.
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "unauthorised" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "malformed" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "missing" }, { status: 400 });
  }

  const result = await saveImage(file);
  if (!result.ok) {
    return Response.json(
      { error: result.reason, maxBytes: MAX_BYTES },
      { status: result.reason === "failed" ? 500 : 415 },
    );
  }

  return Response.json({ url: result.url });
}
