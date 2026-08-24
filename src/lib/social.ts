/**
 * Public social profiles — only surfaces URLs that are explicitly configured.
 * Never invents usernames or generic platform homepages.
 *
 * Configure via env, e.g.:
 *   SOCIAL_INSTAGRAM_URL=https://instagram.com/your_real_handle
 *   SOCIAL_X_URL=https://x.com/your_real_handle
 */

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "x"
  | "youtube"
  | "pinterest"
  | "tiktok"
  | "threads"
  | "linkedin"
  | "telegram"
  | "whatsapp";

export interface SocialProfile {
  platform: SocialPlatform;
  label: string;
  href: string;
  /** Simple path for inline SVG icon (footer). Optional. */
  iconPath?: string;
}

const ENV_MAP: { platform: SocialPlatform; label: string; env: string; iconPath?: string }[] = [
  {
    platform: "instagram",
    label: "Instagram",
    env: "SOCIAL_INSTAGRAM_URL",
    iconPath:
      "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.2a6.6 6.6 0 100 13.2 6.6 6.6 0 000-13.2zm0 10.9a4.3 4.3 0 110-8.6 4.3 4.3 0 010 8.6zm6.9-11.2a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z",
  },
  {
    platform: "facebook",
    label: "Facebook",
    env: "SOCIAL_FACEBOOK_URL",
    iconPath:
      "M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z",
  },
  {
    platform: "x",
    label: "X",
    env: "SOCIAL_X_URL",
    iconPath:
      "M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2h6.4l4.4 5.9L18.9 2zm-1.1 18.1h1.7L7.1 3.8H5.3l12.5 16.3z",
  },
  {
    platform: "youtube",
    label: "YouTube",
    env: "SOCIAL_YOUTUBE_URL",
    iconPath:
      "M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.3 31.3 0 0024 12a31.3 31.3 0 00-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z",
  },
  { platform: "pinterest", label: "Pinterest", env: "SOCIAL_PINTEREST_URL" },
  { platform: "tiktok", label: "TikTok", env: "SOCIAL_TIKTOK_URL" },
  { platform: "threads", label: "Threads", env: "SOCIAL_THREADS_URL" },
  { platform: "linkedin", label: "LinkedIn", env: "SOCIAL_LINKEDIN_URL" },
  { platform: "telegram", label: "Telegram", env: "SOCIAL_TELEGRAM_URL" },
  { platform: "whatsapp", label: "WhatsApp", env: "SOCIAL_WHATSAPP_URL" },
];

function isSafeHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Returns only profiles with a real, safe URL in env. Safe to call from server components. */
export function getConfiguredSocialProfiles(): SocialProfile[] {
  const out: SocialProfile[] = [];
  for (const row of ENV_MAP) {
    const raw = process.env[row.env]?.trim();
    if (!raw || !isSafeHttpUrl(raw)) continue;
    // Reject bare platform homepages used as placeholders
    const lower = raw.toLowerCase().replace(/\/+$/, "");
    const bare = [
      "https://instagram.com",
      "https://www.instagram.com",
      "https://facebook.com",
      "https://www.facebook.com",
      "https://x.com",
      "https://twitter.com",
      "https://www.twitter.com",
      "https://youtube.com",
      "https://www.youtube.com",
    ];
    if (bare.includes(lower)) continue;
    out.push({
      platform: row.platform,
      label: row.label,
      href: raw,
      iconPath: row.iconPath,
    });
  }
  return out;
}
