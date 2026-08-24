import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * `frame-ancestors` (not X-Frame-Options) is the modern clickjacking control;
 * both are sent because some corporate proxies still only honour the legacy
 * header. No Content-Security-Policy `script-src` is set here: Next.js injects
 * inline bootstrap scripts, so a correct policy needs per-request nonces via
 * middleware. Adding a permissive `unsafe-inline` policy would give the
 * appearance of protection without the substance, so it is documented as
 * follow-up work in the README instead.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  // HSTS is only meaningful over TLS; harmless on http during local dev.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
