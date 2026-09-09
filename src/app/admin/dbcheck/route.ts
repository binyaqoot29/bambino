import postgres from "postgres";

/**
 * Diagnostic: can this deployment reach the database, and how long does each
 * stage take? Reports host, port and timings only — never the credentials.
 *
 * Gated by the admin password in a header rather than the session cookie so
 * it can be called from a shell while the pages are down.
 */
export const dynamic = "force-dynamic";

function timed<T>(label: string, p: Promise<T>, ms = 9000) {
  const t0 = Date.now();
  return Promise.race([
    p.then((v) => ({ label, ok: true, ms: Date.now() - t0, value: v })),
    new Promise<{ label: string; ok: false; ms: number; error: string }>((r) =>
      setTimeout(() => r({ label, ok: false, ms: Date.now() - t0, error: "timeout" }), ms),
    ),
  ]).catch((e) => ({ label, ok: false, ms: Date.now() - t0, error: String(e) }));
}

export async function GET(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || request.headers.get("x-admin-password") !== expected) {
    return Response.json({ error: "unauthorised" }, { status: 401 });
  }
  const url = process.env.DATABASE_URL;
  if (!url) return Response.json({ error: "DATABASE_URL unset" }, { status: 500 });
  const u = new URL(url);
  const port = Number(u.port || 5432);
  const out: Record<string, unknown> = {
    host: u.hostname,
    port,
    user: u.username.split(".")[0],
    runtime: typeof navigator !== "undefined" ? navigator.userAgent : "node",
  };

  // Stage 1: raw TCP reachability via the Workers socket API.
  out.tcp = await timed(
    "tcp",
    (async () => {
      const mod = (await import(/* webpackIgnore: true */ "cloudflare:sockets" as string)) as {
        connect: (addr: string, opts?: { secureTransport?: string }) => { opened: Promise<unknown>; close: () => Promise<void> };
      };
      const s = mod.connect(`${u.hostname}:${port}`, { secureTransport: "off" });
      await s.opened;
      await s.close();
      return "opened";
    })(),
  );

  // Stage 2: full driver handshake + one query.
  const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 8, idle_timeout: 2 });
  out.query = await timed("query", sql`select 1 as one`.then((r) => r[0]));
  await timed("end", sql.end({ timeout: 2 }), 3000);

  return Response.json(out);
}
