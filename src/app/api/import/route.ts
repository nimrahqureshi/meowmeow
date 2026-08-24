import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getSessionId } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { importFeedRows, parseCsv, type FeedRow } from "@/lib/sync/import";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";

/**
 * Authorized feed import (admin only).
 * Accepts JSON array of product rows or text/csv.
 * Never invents products — only upserts validated rows.
 */
export async function POST(req: Request) {
  const rl = limit(await clientKey("import"), { max: 10, windowMs: 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const session = await getSessionUser();
  const sessionId = await getSessionId();
  if (!session?.uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = (
    await db.select().from(users).where(eq(users.id, session.uid)).limit(1)
  )[0];
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") || "";
  let rows: FeedRow[] = [];

  try {
    if (contentType.includes("application/json")) {
      const body = await req.json();
      rows = Array.isArray(body) ? body : body.products || body.rows || [];
    } else if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
      const text = await req.text();
      rows = parseCsv(text);
    } else {
      // Try JSON first
      const body = await req.json().catch(() => null);
      if (body) rows = Array.isArray(body) ? body : body.products || body.rows || [];
      else return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!rows.length) {
    return NextResponse.json({ error: "No rows to import" }, { status: 400 });
  }
  if (rows.length > 5000) {
    return NextResponse.json({ error: "Max 5000 rows per request" }, { status: 400 });
  }

  const stats = await importFeedRows(rows, "admin_import");
  return NextResponse.json({ ok: true, stats });
}
