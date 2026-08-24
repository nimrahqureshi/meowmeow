/**
 * Support ticket system — create, reply, escalate from AI.
 */

import { db } from "@/db";
import { supportTickets, supportMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { randomBytes } from "crypto";
import { enqueueEmail } from "@/lib/email/queue";

function ticketNumber(): string {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `MM-${y}${m}${day}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createTicket(input: {
  email: string;
  name?: string;
  subject: string;
  body: string;
  userId?: number | null;
  sessionId?: string | null;
  source?: "web" | "ai" | "email";
  priority?: "low" | "normal" | "high" | "urgent";
  aiConversationId?: string | null;
}) {
  const number = ticketNumber();
  const [ticket] = await db
    .insert(supportTickets)
    .values({
      ticketNumber: number,
      userId: input.userId ?? null,
      sessionId: input.sessionId ?? null,
      email: input.email.toLowerCase().trim(),
      name: input.name,
      subject: input.subject.trim(),
      status: "open",
      priority: input.priority ?? "normal",
      source: input.source ?? "web",
      aiConversationId: input.aiConversationId ?? null,
    })
    .returning();

  await db.insert(supportMessages).values({
    ticketId: ticket.id,
    authorType: input.source === "ai" ? "ai" : "customer",
    authorId: input.userId ?? null,
    authorName: input.name ?? input.email,
    body: input.body.trim(),
    isInternal: false,
  });

  // Queue acknowledgement email (will only send when SMTP is fully wired)
  await enqueueEmail(input.email, "support", {
    ticketNumber: number,
    subject: input.subject,
  });

  return ticket;
}

export async function addMessage(
  ticketId: number,
  input: {
    authorType: "customer" | "admin" | "ai" | "system";
    authorId?: number | null;
    authorName?: string;
    body: string;
    isInternal?: boolean;
  }
) {
  const [msg] = await db
    .insert(supportMessages)
    .values({
      ticketId,
      authorType: input.authorType,
      authorId: input.authorId ?? null,
      authorName: input.authorName,
      body: input.body.trim(),
      isInternal: input.isInternal ?? false,
    })
    .returning();

  await db
    .update(supportTickets)
    .set({
      updatedAt: new Date(),
      status: input.authorType === "admin" ? "pending" : "open",
    })
    .where(eq(supportTickets.id, ticketId));

  return msg;
}

export async function getTicketByNumber(ticketNumber: string) {
  const ticket = (
    await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.ticketNumber, ticketNumber))
      .limit(1)
  )[0];
  if (!ticket) return null;
  const messages = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.ticketId, ticket.id))
    .orderBy(supportMessages.createdAt);
  return { ticket, messages };
}

export async function listTickets(status?: string, limit = 50) {
  if (status) {
    return db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.status, status))
      .orderBy(desc(supportTickets.createdAt))
      .limit(limit);
  }
  return db
    .select()
    .from(supportTickets)
    .orderBy(desc(supportTickets.createdAt))
    .limit(limit);
}

export async function updateTicketStatus(
  id: number,
  status: "open" | "pending" | "resolved" | "closed",
  assignedTo?: number | null
) {
  const patch: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };
  if (status === "resolved" || status === "closed") {
    patch.resolvedAt = new Date();
  }
  if (assignedTo !== undefined) patch.assignedTo = assignedTo;

  const [row] = await db
    .update(supportTickets)
    .set(patch)
    .where(eq(supportTickets.id, id))
    .returning();
  return row;
}
