/**
 * Integration status — server-only view of external providers.
 *
 * Never claims CONNECTED without real credentials in the environment.
 * Admin and health endpoints should surface these statuses honestly.
 */

export type IntegrationStatus =
  | "connected"
  | "configured"
  | "connection_tested"
  | "not_configured"
  | "disabled"
  | "error"
  | "rate_limited";

export type IntegrationId =
  | "database"
  | "auth"
  | "amazon_associates"
  | "impact"
  | "cj"
  | "shareasale"
  | "rakuten"
  | "daraz"
  | "openai"
  | "smtp"
  | "ga4"
  | "clarity"
  | "google_oauth"
  | "github_oauth";

export interface IntegrationInfo {
  id: IntegrationId;
  name: string;
  category: "commerce" | "ai" | "email" | "analytics" | "auth" | "infra";
  status: IntegrationStatus;
  /** Human-readable detail; never include secrets. */
  detail: string;
  envVars: string[];
}

function has(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Snapshot of integration configuration (no network I/O).
 * Call from server routes / RSC only.
 */
export function getIntegrationStatuses(): IntegrationInfo[] {
  const amazon = has("AMAZON_ASSOCIATE_TAG");
  const impact = has("IMPACT_ACCOUNT_SID") && has("IMPACT_AUTH_TOKEN");
  const cj = has("CJ_API_KEY");
  const shareasale = has("SHAREASALE_AFFILIATE_ID") && has("SHAREASALE_API_TOKEN");
  const rakuten = has("RAKUTEN_API_KEY");
  const daraz = has("DARAZ_AFFILIATE_ID") || has("DARAZ_API_KEY");
  const openai = has("OPENAI_API_KEY");
  const smtp = has("SMTP_HOST") && has("SMTP_USER") && has("SMTP_PASSWORD");
  const ga = has("NEXT_PUBLIC_GA_ID");
  const clarity = has("NEXT_PUBLIC_CLARITY_ID");
  const googleOauth = has("GOOGLE_CLIENT_ID") && has("GOOGLE_CLIENT_SECRET");
  const githubOauth = has("GITHUB_CLIENT_ID") && has("GITHUB_CLIENT_SECRET");
  const auth = has("AUTH_SECRET");
  const database = has("DATABASE_URL");

  return [
    {
      id: "database",
      name: "PostgreSQL",
      category: "infra",
      status: database ? "configured" : "not_configured",
      detail: database ? "DATABASE_URL is set" : "DATABASE_URL missing",
      envVars: ["DATABASE_URL"],
    },
    {
      id: "auth",
      name: "Session signing",
      category: "auth",
      status: auth ? "configured" : "not_configured",
      detail: auth ? "AUTH_SECRET is set" : "AUTH_SECRET required in production",
      envVars: ["AUTH_SECRET"],
    },
    {
      id: "amazon_associates",
      name: "Amazon Associates",
      category: "commerce",
      status: amazon ? "configured" : "not_configured",
      detail: amazon
        ? "Tag configured — live API/feed connectivity still requires a tested adapter"
        : "AMAZON_ASSOCIATE_TAG not set — no Amazon commission attribution",
      envVars: ["AMAZON_ASSOCIATE_TAG"],
    },
    {
      id: "impact",
      name: "Impact",
      category: "commerce",
      status: impact ? "configured" : "not_configured",
      detail: impact ? "Configuration present" : "IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN not set",
      envVars: ["IMPACT_ACCOUNT_SID", "IMPACT_AUTH_TOKEN"],
    },
    {
      id: "cj",
      name: "Commission Junction",
      category: "commerce",
      status: cj ? "configured" : "not_configured",
      detail: cj ? "API key configured" : "CJ_API_KEY not set",
      envVars: ["CJ_API_KEY"],
    },
    {
      id: "shareasale",
      name: "ShareASale",
      category: "commerce",
      status: shareasale ? "configured" : "not_configured",
      detail: shareasale ? "Configuration present" : "SHAREASALE_* not set",
      envVars: ["SHAREASALE_AFFILIATE_ID", "SHAREASALE_API_TOKEN"],
    },
    {
      id: "rakuten",
      name: "Rakuten Advertising",
      category: "commerce",
      status: rakuten ? "configured" : "not_configured",
      detail: rakuten ? "API key configured" : "RAKUTEN_API_KEY not set",
      envVars: ["RAKUTEN_API_KEY"],
    },
    {
      id: "daraz",
      name: "Daraz Pakistan",
      category: "commerce",
      status: daraz ? "configured" : "not_configured",
      detail: daraz
        ? "Daraz configuration present — use official affiliate/feed only"
        : "DARAZ_AFFILIATE_ID / DARAZ_API_KEY not set — no Daraz attribution",
      envVars: ["DARAZ_AFFILIATE_ID", "DARAZ_API_KEY", "DARAZ_API_SECRET", "DARAZ_FEED_URL"],
    },
    {
      id: "openai",
      name: "OpenAI (optional LLM layer)",
      category: "ai",
      status: openai ? "configured" : "not_configured",
      detail: openai
        ? "OPENAI_API_KEY present — optional LLM reasoning can be enabled"
        : "Not configured — retrieval-based assistant works without it",
      envVars: ["OPENAI_API_KEY", "OPENAI_BASE_URL", "OPENAI_MODEL"],
    },
    {
      id: "smtp",
      name: "Transactional email",
      category: "email",
      status: smtp ? "configured" : "not_configured",
      detail: smtp
        ? "SMTP configuration present"
        : "SMTP not configured — signups stored but confirmation mail will not send",
      envVars: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"],
    },
    {
      id: "ga4",
      name: "Google Analytics 4",
      category: "analytics",
      status: ga ? "configured" : "not_configured",
      detail: ga ? "Measurement ID configured" : "NEXT_PUBLIC_GA_ID not set",
      envVars: ["NEXT_PUBLIC_GA_ID"],
    },
    {
      id: "clarity",
      name: "Microsoft Clarity",
      category: "analytics",
      status: clarity ? "configured" : "not_configured",
      detail: clarity ? "Project ID configured" : "NEXT_PUBLIC_CLARITY_ID not set",
      envVars: ["NEXT_PUBLIC_CLARITY_ID"],
    },
    {
      id: "google_oauth",
      name: "Google OAuth",
      category: "auth",
      status: googleOauth ? "configured" : "not_configured",
      detail: googleOauth
        ? "Client configuration present"
        : "Not configured — email/password auth still works",
      envVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    },
    {
      id: "github_oauth",
      name: "GitHub OAuth",
      category: "auth",
      status: githubOauth ? "configured" : "not_configured",
      detail: githubOauth
        ? "Client configuration present"
        : "Not configured — email/password auth still works",
      envVars: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
    },
  ];
}

export function isDemoMode(): boolean {
  // Explicit opt-in only. In production, demo mode requires the flag AND
  // is still shown via the banner so customers are never misled.
  const flag = process.env.NEXT_PUBLIC_DEMO_MODE;
  return flag === "1" || flag === "true";
}

/** True when the deployment should refuse to treat seed data as live. */
export function isProductionCatalogRequired(): boolean {
  return process.env.NODE_ENV === "production" && !isDemoMode();
}
