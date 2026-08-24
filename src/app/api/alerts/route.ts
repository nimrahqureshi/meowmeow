import { NextResponse } from "next/server";
import { db } from "@/db";
import { priceAlerts, products } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";
import { badRequest, readJson } from "@/lib/validation";
import { getSessionUser, getCurrentUser } from "@/lib/auth";

/**
 * Price alerts API.
 * Creates/lists alerts. Email delivery only when SMTP is configured;
 * persistence always works. Never claims a notification was sent when it was not.
 */

export async function GET(req: Request) {
  const rl = limit(await clientKey("alerts"), { max: 30, windowMs: 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId")?.trim() || null;
  const user = await getSessionUser().catch(() => null);

  if (!user && !sessionId) {
    return NextResponse.json({ error: "Authentication or sessionId required" }, { status: 401 });
  }

  const rows = user
    ? await db
        .select()
        .from(priceAlerts)
        .where(and(eq(priceAlerts.userId, user.uid), eq(priceAlerts.active, true)))
        .orderBy(desc(priceAlerts.createdAt))
        .limit(50)
    : await db
        .select()
        .from(priceAlerts)
        .where(and(eq(priceAlerts.sessionId, sessionId!), eq(priceAlerts.active, true)))
        .orderBy(desc(priceAlerts.createdAt))
        .limit(50);

  return NextResponse.json({ alerts: rows });
}

export async function POST(req: Request) {
  const rl = limit(await clientKey("alerts-write"), { max: 10, windowMs: 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const body = await readJson<{
    productId?: unknown;
    targetPrice?: unknown;
    email?: unknown;
    sessionId?: unknown;
  }>(req);
  if (!body) return badRequest("Invalid JSON");

  const productId = typeof body.productId === "number" ? body.productId : Number(body.productId);
  const targetPrice = typeof body.targetPrice === "number" ? body.targetPrice : Number(body.targetPrice);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : null;

  if (!Number.isFinite(productId) || productId <= 0) return badRequest("productId required");
  if (!Number.isFinite(targetPrice) || targetPrice <= 0) return badRequest("targetPrice must be a positive number");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest("Invalid email");

  const session = await getSessionUser().catch(() => null);
  const user = await getCurrentUser().catch(() => null);
  if (!session && !user && !sessionId && !email) {
    return badRequest("Provide email, sessionId, or sign in");
  }

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product || !product.published) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const [row] = await db
    .insert(priceAlerts)
    .values({
      userId: user?.id ?? session?.uid ?? null,
      sessionId: sessionId,
      email: email || user?.email || null,
      productId,
      targetPrice,
      currency: "USD",
      active: true,
    })
    .returning();

  const smtpConfigured = Boolean(
    process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASSWORD?.trim()
  );

  return NextResponse.json({
    alert: row,
    notification: {
      channel: "email",
      status: smtpConfigured ? "queued_when_triggered" : "not_configured",
      detail: smtpConfigured
        ? "When the target price is reached, email can be sent via configured SMTP."
        : "SMTP is NOT_CONFIGURED — alert is stored; email will not send until SMTP is set.",
    },
  });
}

export async function DELETE(req: Request) {
  const rl = limit(await clientKey("alerts-write"), { max: 20, windowMs: 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!Number.isFinite(id) || id <= 0) return badRequest("id required");

  const user = await getSessionUser().catch(() => null);
  const sessionId = url.searchParams.get("sessionId")?.trim();

  if (user) {
    await db
      .update(priceAlerts)
      .set({ active: false })
      .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, user.uid)));
  } else if (sessionId) {
    await db
      .update(priceAlerts)
      .set({ active: false })
      .where(and(eq(priceAlerts.id, id), eq(priceAlerts.sessionId, sessionId)));
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
