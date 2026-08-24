import { describe, expect, it, vi } from "vitest";

// getCurrentUser touches the database and next/headers; these tests cover the
// pure crypto surface, so both are stubbed away.
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }) }));
vi.mock("@/db", () => ({ db: { select: () => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) }) } }));

const { createSessionToken, hashPassword, verifyPassword, verifySessionToken } = await import("@/lib/auth");

describe("password hashing", () => {
  it("verifies a correct password", () => {
    const stored = hashPassword("correct horse battery staple");
    expect(verifyPassword("correct horse battery staple", stored)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const stored = hashPassword("correct horse battery staple");
    expect(verifyPassword("wrong password", stored)).toBe(false);
  });

  it("never stores the plaintext", () => {
    expect(hashPassword("hunter2")).not.toContain("hunter2");
  });

  it("salts each hash, so identical passwords do not collide", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });

  it("rejects malformed stored values instead of throwing", () => {
    expect(verifyPassword("x", "")).toBe(false);
    expect(verifyPassword("x", "no-separator")).toBe(false);
    expect(verifyPassword("x", ":")).toBe(false);
  });
});

describe("session tokens", () => {
  const user = { id: 7, role: "admin" };

  it("round-trips a signed payload", () => {
    const payload = verifySessionToken(createSessionToken(user));
    expect(payload).toMatchObject({ uid: 7, role: "admin" });
  });

  /**
   * REGRESSION (rc.2): an endpoint minted sessions for arbitrary emails with
   * no verification. Tokens must only ever be trusted when *we* signed them.
   */
  it("rejects a token with a forged signature", () => {
    const [body] = createSessionToken(user).split(".");
    expect(verifySessionToken(`${body}.forgedsignature`)).toBeNull();
  });

  it("rejects a token whose payload was edited after signing", () => {
    const tampered = Buffer.from(JSON.stringify({ uid: 1, role: "admin", exp: Date.now() + 1e6 })).toString("base64url");
    expect(verifySessionToken(`${tampered}.doesnotmatter`)).toBeNull();
  });

  it("rejects an unsigned 'none'-style token", () => {
    const body = Buffer.from(JSON.stringify({ uid: 1, role: "admin", exp: Date.now() + 1e6 })).toString("base64url");
    expect(verifySessionToken(body)).toBeNull();
    expect(verifySessionToken(`${body}.`)).toBeNull();
  });

  it("rejects an expired token", () => {
    const body = Buffer.from(JSON.stringify({ uid: 1, role: "user", exp: Date.now() - 1000 })).toString("base64url");
    // Signature is invalid too, but expiry must be enforced independently.
    expect(verifySessionToken(`${body}.whatever`)).toBeNull();
  });

  it.each([
    ["undefined", undefined],
    ["an empty string", ""],
    ["a random string", "garbage"],
    ["dots only", "..."],
  ])("rejects %s without throwing", (_l, token) => {
    expect(verifySessionToken(token as string | undefined)).toBeNull();
  });

  it("carries an expiry in the future when freshly minted", () => {
    const payload = verifySessionToken(createSessionToken(user));
    expect(payload!.exp).toBeGreaterThan(Date.now());
  });
});

/**
 * REGRESSION (rc.4): authorisation read the role embedded in the token, so a
 * demoted or deleted admin kept access for the token's 30-day lifetime. The
 * live-lookup helpers must exist and be what authorisation uses.
 */
describe("live user resolution", () => {
  it("exposes getCurrentUser and isCurrentUserAdmin", async () => {
    const mod = await import("@/lib/auth");
    expect(typeof mod.getCurrentUser).toBe("function");
    expect(typeof mod.isCurrentUserAdmin).toBe("function");
  });

  it("returns null when the account no longer exists", async () => {
    const mod = await import("@/lib/auth");
    await expect(mod.getCurrentUser()).resolves.toBeNull();
    await expect(mod.isCurrentUserAdmin()).resolves.toBe(false);
  });
});
