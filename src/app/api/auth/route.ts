import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, verifyPassword, createSessionToken, getSessionUser, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { clientKey, limit, tooMany } from "@/lib/rate-limit";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ user: null });
  const user = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, avatar: users.avatar }).from(users).where(eq(users.id, session.uid)).limit(1);
  return NextResponse.json({ user: user[0] ?? null });
}

export async function POST(req: Request) {
  const rl = limit(await clientKey("auth"), { max: 8, windowMs: 60000 });
  if (!rl.ok) return tooMany(rl.retryAfter);

  let body: { action?: string; name?: string; email?: string; password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (body.action === "login") {
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user[0] || !verifyPassword(password, user[0].passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    await setSessionCookie(createSessionToken(user[0]));
    return NextResponse.json({ ok: true, user: { id: user[0].id, name: user[0].name, email: user[0].email, role: user[0].role, avatar: user[0].avatar } });
  }

  if (body.action === "signup") {
    if (!body.name || !email || password.length < 8) {
      return NextResponse.json({ error: "Name required, valid email required, password must be 8+ characters" }, { status: 400 });
    }
    const existing = await db.select().from(users).where(or(eq(users.email, email))).limit(1);
    if (existing[0]) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    const created = await db
      .insert(users)
      .values({ name: body.name.trim(), email, passwordHash: hashPassword(password) })
      .returning();
    await setSessionCookie(createSessionToken(created[0]));
    return NextResponse.json({ ok: true, user: { id: created[0].id, name: created[0].name, email: created[0].email, role: created[0].role } });
  }

  if (body.action === "social") {
    // SECURITY: this endpoint previously minted a session for any address the
    // caller supplied, with no password and no provider verification — a single
    // unauthenticated request could take over any account, including an admin.
    // It stays disabled until a real OAuth flow verifies the identity with the
    // provider (see GOOGLE_CLIENT_* / GITHUB_CLIENT_* in .env.example).
    return NextResponse.json(
      { error: "Social sign-in isn't available yet. Please use your email and password." },
      { status: 501 }
    );
  }

  if (body.action === "logout") {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
