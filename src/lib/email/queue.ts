import { db } from "@/db";
import { emailQueue, emailLogs, newsletterSubscribers } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { connect as tcpConnect, Socket } from "node:net";
import { connect as tlsConnect } from "node:tls";

export type EmailTemplate =
  | "welcome" | "verification" | "reset_password" | "price_drop" | "back_in_stock"
  | "wishlist" | "newsletter" | "support" | "recommendations";

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM);
}
function esc(v: unknown) {
  return String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function render(template: string, payload: Record<string, unknown>) {
  const title = String(payload.subject || template.replace(/_/g," "));
  const body = String(payload.body || `This is a MeowMeow ${template.replace(/_/g," ")} notification.`);
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto"><h2>${esc(title)}</h2><p>${esc(body).replace(/\n/g,"<br>")}</p><p>— MeowMeow</p></div>`;
}

async function smtpSend(to: string, subject: string, html: string) {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;
  let socket: any;

  const open = () => new Promise<any>((resolve, reject) => {
    const s = secure
  ? tlsConnect({ host, port, servername: host })
  : tcpConnect({ host, port });
    const timer = setTimeout(() => { s.destroy(); reject(new Error("SMTP connection timeout")); }, 15000);
    const done = () => clearTimeout(timer);
    s.once("error", (e: Error) => { done(); reject(e); });
    s.once("connect", () => { done(); resolve(s); });
    if (secure) s.once("secureConnect", () => { done(); resolve(s); });
  });

  socket = await open();
  let buffer = "";
  const readReply = () => new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error("SMTP response timeout")); }, 15000);
    const onData = (d: Buffer) => {
      buffer += d.toString("utf8");
      const lines = buffer.split(/\r?\n/);
      const terminal = lines.find((line) => /^\d{3} /.test(line));
      if (terminal) { cleanup(); resolve(buffer.trim()); buffer = ""; }
    };
    const onError = (e: Error) => { cleanup(); reject(e); };
    const cleanup = () => { clearTimeout(timer); socket.off("data", onData); socket.off("error", onError); };
    socket.on("data", onData); socket.on("error", onError);
  });
  const command = async (cmd: string, expected: number[]) => {
    socket.write(cmd + "\r\n");
    const r = await readReply();
    const code = Number(r.slice(0, 3));
    if (!expected.includes(code)) throw new Error(`SMTP ${code}: ${r.slice(4, 300)}`);
    return r;
  };

  try {
    const greeting = await readReply();
    if (Number(greeting.slice(0, 3)) >= 400) throw new Error(greeting);

    let caps = await command("EHLO meowmeow.local", [250]);
    if (!secure) {
      if (!/STARTTLS/i.test(caps)) throw new Error("SMTP server does not advertise STARTTLS");
      await command("STARTTLS", [220]);
      socket = await new Promise<any>((resolve, reject) => {
        const tlsSocket = tlsConnect({ socket, servername: host });
        tlsSocket.once("secureConnect", () => resolve(tlsSocket));
        tlsSocket.once("error", reject);
      });
      buffer = "";
      caps = await command("EHLO meowmeow.local", [250]);
    }

    if (/AUTH\s+LOGIN/i.test(caps)) {
      await command("AUTH LOGIN", [334]);
      await command(Buffer.from(process.env.SMTP_USER!).toString("base64"), [334]);
      await command(Buffer.from(process.env.SMTP_PASSWORD!).toString("base64"), [235]);
    } else if (/AUTH\s+PLAIN/i.test(caps)) {
      const plain = Buffer.from(`\0${process.env.SMTP_USER}\0${process.env.SMTP_PASSWORD}`).toString("base64");
      await command(`AUTH PLAIN ${plain}`, [235]);
    } else {
      throw new Error("SMTP server does not advertise AUTH LOGIN or AUTH PLAIN");
    }

    await command(`MAIL FROM:<${process.env.SMTP_USER}>`, [250]);
    await command(`RCPT TO:<${to}>`, [250, 251]);
    await command("DATA", [354]);
    const from = process.env.SMTP_FROM!;
    const message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject.replace(/[\r\n]/g, " ")}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "",
      html.replace(/^\./gm, ".."),
      ".",
    ].join("\r\n");
    socket.write(message + "\r\n");
    await readReply();
    await command("QUIT", [221]);
    return { providerMessageId: undefined };
  } finally {
    socket.destroy();
  }
}
export async function enqueueEmail(toAddress: string, template: EmailTemplate, payload: Record<string, unknown> = {}, scheduledFor = new Date()) {
  const subject = String(payload.subject || `MeowMeow ${template.replace(/_/g," ")}`);
  const [row] = await db.insert(emailQueue).values({toAddress: toAddress.toLowerCase().trim(), template, subject, payload, scheduledFor}).returning();
  return row;
}

export async function processEmailQueue(limit = 20) {
  const pending = await db.select().from(emailQueue).where(and(eq(emailQueue.status,"queued"), lte(emailQueue.scheduledFor,new Date()))).limit(limit);
  let sent=0, failed=0;
  for (const item of pending) {
    if(!smtpConfigured()) {
      await db.update(emailQueue).set({status:"failed",attempts:item.attempts+1,lastError:"SMTP not configured"}).where(eq(emailQueue.id,item.id));
      await db.insert(emailLogs).values({queueId:item.id,toAddress:item.toAddress,template:item.template,status:"failed",providerResponse:"SMTP not configured"});
      failed++; continue;
    }
    try {
      const html=render(item.template,item.payload || {});
      const result=await smtpSend(item.toAddress,item.subject,html);
      await db.update(emailQueue).set({status:"sent",attempts:item.attempts+1,sentAt:new Date(),providerMessageId:result.providerMessageId ?? null,lastError:null}).where(eq(emailQueue.id,item.id));
      await db.insert(emailLogs).values({queueId:item.id,toAddress:item.toAddress,template:item.template,status:"sent",providerResponse:"SMTP accepted message"});
      sent++;
    } catch(error) {
      const msg=error instanceof Error?error.message:"Unknown SMTP error";
      const attempts=item.attempts+1;
      const status=attempts>=3?"failed":"queued";
      await db.update(emailQueue).set({status,attempts,lastError:msg,scheduledFor:new Date(Date.now()+Math.min(3600000,30000*2**item.attempts))}).where(eq(emailQueue.id,item.id));
      await db.insert(emailLogs).values({queueId:item.id,toAddress:item.toAddress,template:item.template,status:"failed",providerResponse:msg.slice(0,500)});
      failed++;
    }
  }
  return {processed:pending.length,sent,failed};
}
export async function isSubscribed(email:string){ const row=(await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email,email.toLowerCase().trim())).limit(1))[0]; return Boolean(row); }
