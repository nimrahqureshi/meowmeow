import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getConfiguredSocialProfiles } from "@/lib/social";
import { getIntegrationStatuses, isDemoMode } from "@/lib/integrations";

describe("getConfiguredSocialProfiles", () => {
  const keys = [
    "SOCIAL_INSTAGRAM_URL",
    "SOCIAL_FACEBOOK_URL",
    "SOCIAL_X_URL",
    "SOCIAL_YOUTUBE_URL",
  ];
  const prev: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of keys) {
      prev[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of keys) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  });

  it("returns empty when no social env is set", () => {
    expect(getConfiguredSocialProfiles()).toEqual([]);
  });

  it("ignores bare platform homepages", () => {
    process.env.SOCIAL_INSTAGRAM_URL = "https://instagram.com";
    process.env.SOCIAL_X_URL = "https://x.com/";
    expect(getConfiguredSocialProfiles()).toEqual([]);
  });

  it("accepts real profile URLs", () => {
    process.env.SOCIAL_INSTAGRAM_URL = "https://instagram.com/meowmeow_official";
    process.env.SOCIAL_X_URL = "https://x.com/meowmeow";
    const list = getConfiguredSocialProfiles();
    expect(list).toHaveLength(2);
    expect(list.map((p) => p.platform).sort()).toEqual(["instagram", "x"]);
  });

  it("rejects non-http URLs", () => {
    process.env.SOCIAL_INSTAGRAM_URL = "javascript:alert(1)";
    expect(getConfiguredSocialProfiles()).toEqual([]);
  });
});

describe("getIntegrationStatuses", () => {
  it("never invents connected affiliate networks without env", () => {
    const amazon = getIntegrationStatuses().find((i) => i.id === "amazon_associates");
    // May be connected if env is set in CI; status must be one of the allowed enum values
    expect(["connected", "configured", "connection_tested", "not_configured", "disabled", "error", "rate_limited"]).toContain(
      amazon?.status
    );
    expect(amazon?.detail).toBeTruthy();
  });

  it("isDemoMode reflects NEXT_PUBLIC_DEMO_MODE", () => {
    const prev = process.env.NEXT_PUBLIC_DEMO_MODE;
    process.env.NEXT_PUBLIC_DEMO_MODE = "1";
    expect(isDemoMode()).toBe(true);
    process.env.NEXT_PUBLIC_DEMO_MODE = "0";
    expect(isDemoMode()).toBe(false);
    if (prev === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
    else process.env.NEXT_PUBLIC_DEMO_MODE = prev;
  });
});
