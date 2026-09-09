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
  ]).catch((e) => ({
    label,
    ok: false,
    ms: Date.now() - t0,
    error: String(e),
    cause: describe((e as { cause?: unknown })?.cause),
  }));
}

/** Postgres errors carry the useful part in code/message; keep those only. */
function describe(c: unknown) {
  if (!c || typeof c !== "object") return c === undefined ? undefined : String(c);
  const o = c as Record<string, unknown>;
  return { name: o.name, code: o.code, message: o.message, errno: o.errno, syscall: o.syscall, address: o.address };
}

export async function GET(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || request.headers.get("x-admin-password") !== expected) {
    return Response.json({ error: "unauthorised" }, { status: 401 });
  }
  try {
    return await run();
  } catch (e) {
    const msg = String(e instanceof Error ? e.stack ?? e.message : e);
    console.error("dbcheck failed", msg);
    return Response.json({ error: "threw", message: msg.slice(0, 2000) }, { status: 500 });
  }
}

async function run() {
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

  // Stage 2: full driver handshake + one query.
  const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 8, idle_timeout: 2 });
  out.query = await timed("query", sql`select 1 as one`.then((r) => r[0]));
  // The pages run several queries per request, some in parallel and one in a
  // transaction. Exercise each shape so a pooler that chokes on one shows it.
  out.sequential = await timed(
    "sequential",
    (async () => {
      const t: number[] = [];
      for (let i = 0; i < 3; i++) {
        const t0 = Date.now();
        await sql`select count(*)::int as n from products`;
        t.push(Date.now() - t0);
      }
      return t;
    })(),
  );
  // Fresh single connection: does a transaction work on its own?
  const one = postgres(url, { prepare: false, max: 1, connect_timeout: 8, idle_timeout: 2 });
  out.transactionAlone = await timed(
    "transaction-max1",
    one.begin(async (tx) => {
      const a = await tx`select count(*)::int as n from variants`;
      const b = await tx`select count(*)::int as n from orders`;
      return [a[0].n, b[0].n];
    }),
  );
  await timed("end1", one.end({ timeout: 2 }), 3000);
  // Small pool: parallel queries get their own connections instead of being
  // pipelined on one, which Supavisor's transaction mode does not support.
  const pool = postgres(url, { prepare: false, max: 5, connect_timeout: 8, idle_timeout: 2 });
  out.parallelPool = await timed(
    "parallel-max5",
    Promise.all([
      pool`select count(*)::int as n from categories`,
      pool`select count(*)::int as n from settings`,
      pool`select count(*)::int as n from collections`,
      pool`select count(*)::int as n from subscribers`,
    ]).then((r) => r.map((x) => x[0].n)),
  );
  out.transactionPool = await timed(
    "transaction-max5",
    pool.begin(async (tx) => {
      const a = await tx`select count(*)::int as n from variants`;
      const b = await tx`select count(*)::int as n from orders`;
      return [a[0].n, b[0].n];
    }),
  );
  out.mixedPool = await timed(
    "mixed-max5",
    Promise.all([
      pool`select count(*)::int as n from products`,
      pool.begin(async (tx) => (await tx`select 2 as n`)[0].n),
      pool`select count(*)::int as n from categories`,
    ]),
  );
  await timed("endPool", pool.end({ timeout: 2 }), 3000);
  out.drizzleBurst = await timed(
    "drizzle-8-parallel",
    (async () => {
      const { getDb } = await import("@/db/client");
      const { rowsOf } = await import("@/db/rows");
      const { sql: dsql } = await import("drizzle-orm");
      const db = await getDb();
      const t0 = Date.now();
      const r = await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          db.execute(dsql`select ${i}::int as i, count(*)::int as n from products`),
        ),
      );
      return { ms: Date.now() - t0, rows: r.map((x) => rowsOf<{ i: number }>(x)[0]?.i) };
    })(),
  );
  out.viaDrizzle = await timed(
    "drizzle",
    (async () => {
      const { getDb } = await import("@/db/client");
      const { rowsOf } = await import("@/db/rows");
      const { sql: dsql } = await import("drizzle-orm");
      const db = await getDb();
      const r = rowsOf<{ n: number }>(await db.execute(dsql`select count(*)::int as n from products`));
      return r[0]?.n;
    })(),
  );
  await timed("end", sql.end({ timeout: 2 }), 3000);

  return Response.json(out);
}
