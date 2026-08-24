import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";
import { badRequest, readJson } from "@/lib/validation";

export async function POST(req: Request) {
  const rl = limit(await clientKey("contact"), { max: 5, windowMs: 300000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  const payload = await readJson<{ name?: unknown; email?: unknown; subject?: unknown; body?: unknown }>(req);
  if (!payload) return badRequest("Invalid request body");
  const body = {
    name: typeof payload.name === "string" ? payload.name : "",
    email: typeof payload.email === "string" ? payload.email : "",
    subject: typeof payload.subject === "string" ? payload.subject : "",
    body: typeof payload.body === "string" ? payload.body : "",
  };
  if (!body.name?.trim() || !body.email?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  await db.insert(messages).values({
    name: body.name.trim(),
    email: body.email.trim(),
    subject: body.subject?.trim() || "General inquiry",
    body: body.body.trim(),
  });
  return NextResponse.json({ ok: true, message: "Message sent! Our team replies within 24 hours. 💌" });
}
