import { NextResponse } from "next/server";
import { createTicket, listTickets, getTicketByNumber, addMessage, updateTicketStatus } from "@/lib/support/tickets";
import { getSessionUser } from "@/lib/auth";
import { getSessionId } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = limit(await clientKey("support"), { max: 10, windowMs: 60_000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.subject || !body?.body) {
    return NextResponse.json({ error: "email, subject and body are required" }, { status: 400 });
  }

  const session = await getSessionUser();
  const sessionId = await getSessionId();
  const ticket = await createTicket({
    email: body.email,
    name: body.name,
    subject: body.subject,
    body: body.body,
    userId: session?.uid,
    sessionId: sessionId,
    source: body.source === "ai" ? "ai" : "web",
    priority: body.priority,
    aiConversationId: body.aiConversationId,
  });

  return NextResponse.json({
    ok: true,
    ticketNumber: ticket.ticketNumber,
    id: ticket.id,
    status: ticket.status,
  });
}

export async function GET(req: Request) {
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

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const number = url.searchParams.get("number");
  if (number) {
    const detail = await getTicketByNumber(number);
    if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(detail);
  }

  const tickets = await listTickets(status, 100);
  return NextResponse.json({ tickets });
}

export async function PATCH(req: Request) {
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

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (body.reply) {
    await addMessage(body.id, {
      authorType: "admin",
      authorId: user.id,
      authorName: user.name,
      body: body.reply,
    });
  }

  if (body.status) {
    await updateTicketStatus(body.id, body.status, body.assignedTo);
  }

  return NextResponse.json({ ok: true });
}
