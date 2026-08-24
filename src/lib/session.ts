import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { SESSION_COOKIE } from "./utils";

/**
 * Get-or-create the anonymous session id.
 *
 * Next.js only permits cookie writes inside Server Actions and Route Handlers.
 * A Server Component render (e.g. someone opening /cart directly from a shared
 * link with no cookie yet) would otherwise throw and trip the error boundary,
 * so the write is attempted and allowed to fail: the caller still receives a
 * usable id for this render, and the browser persists a stable one on the next
 * route-handler request (StoreProvider calls /api/meta on mount).
 */
export async function getSessionId() {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sid = randomUUID();
  try {
    store.set(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  } catch {
    // Read-only cookie context (RSC render) — persisted by the next route handler.
  }
  return sid;
}
