import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { AUTH_COOKIE } from "./utils";

const DEV_SECRET = "meowmeow-dev-secret-change-me";

/**
 * Resolved lazily, at signing/verification time rather than module load, so a
 * missing secret never breaks the build or prerender — it only refuses to mint
 * real sessions. Failing loudly beats silently signing production sessions
 * with a public constant that anyone could use to forge a token.
 */
function getSecret() {
  const value = process.env.AUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production — session tokens cannot be signed securely without it.");
  }
  return DEV_SECRET;
}
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

type SessionPayload = { uid: number; role: string; exp: number };

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(user: { id: number; role: string }) {
  const payload: SessionPayload = { uid: user.id, role: user.role, exp: Date.now() + SESSION_TTL * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = Buffer.from(sign(body));
  const provided = Buffer.from(sig);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Server-side: read the current session user payload from cookies. */
export async function getSessionUser() {
  const store = await cookies();
  return verifySessionToken(store.get(AUTH_COOKIE)?.value);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

/**
 * Resolve the *live* user behind the current session.
 *
 * `getSessionUser` only proves the token was signed by us — the `role` inside
 * it is a 30-day-old snapshot. Authorising from that snapshot meant a demoted
 * admin kept admin access until the token expired, and a deleted user kept it
 * too, so revoking access during an incident was impossible. Anything making
 * an authorisation decision must use this instead, which re-reads the row and
 * returns null when the account no longer exists.
 */
export async function getCurrentUser() {
  const session = await getSessionUser();
  if (!session) return null;

  const row = (
    await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, session.uid))
      .limit(1)
  )[0];

  return row ?? null;
}

/** True only if the signed-in account currently holds the admin role. */
export async function isCurrentUserAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
