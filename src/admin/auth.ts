import "server-only";

import { cookies } from "next/headers";

/**
 * Admin authentication.
 *
 * A single shared password, held in ADMIN_PASSWORD, exchanged for a signed
 * cookie. Deliberately not a user system: there's one shop owner, no roles to
 * model, and no password reset flow worth maintaining. If more than one person
 * ever needs access with an audit trail, this is the seam to replace.
 *
 * The cookie holds an HMAC of an expiry timestamp — not the password — so a
 * stolen cookie expires on its own and never reveals the secret. Signing uses
 * ADMIN_SESSION_SECRET, or falls back to the password itself so a minimal
 * setup still works.
 */

const COOKIE = "bambino_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // a working day

function secret() {
  const value =
    process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!value) {
    throw new Error(
      "ADMIN_PASSWORD is not set — the admin panel is unavailable. See README, 'Admin panel'.",
    );
  }
  return value;
}

export function adminIsConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return Buffer.from(signature).toString("base64url");
}

/** Constant-time compare, so a wrong password can't be found byte by byte. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPassword(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

export async function createSession() {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expires);
  const token = `${payload}.${await sign(payload)}`;

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAuthenticated() {
  if (!adminIsConfigured()) return false;

  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expires = Number(payload);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  try {
    return safeEqual(signature, await sign(payload));
  } catch {
    return false;
  }
}
