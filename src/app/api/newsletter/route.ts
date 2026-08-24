import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";
import { badRequest, readJson } from "@/lib/validation";

export async function POST(req: Request) {
  const rl = limit(await clientKey("newsletter"), { max: 5, windowMs: 60000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const body = await readJson<{ email?: unknown }>(req);
  if (!body) return badRequest("Invalid request body");
  const email = (typeof body.email === "string" ? body.email : "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email)).limit(1);
  if (!existing[0]) {
    await db.insert(newsletterSubscribers).values({ email });
  }
  return NextResponse.json({ ok: true, message: "You're subscribed. Check your inbox to confirm." });
}
