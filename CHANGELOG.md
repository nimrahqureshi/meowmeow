## 3.2.0 — Production hardening

- Added conservative cross-merchant product identity fields and deduplication by GTIN / MPN+brand.
- Added authorized remote CSV/JSON/XML feed ingestion with Daraz feed configuration support.
- Added percentage-drop, any-drop and back-in-stock alert modes.
- Replaced modeled 6% commission UI with honest unavailable state.
- Added dependency-free SMTP queue delivery and delivery logs.
- Hardened job retry semantics and maintenance worker behavior.

# Changelog

All notable changes to MeowMeow. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0] — 2026-08-19

### Added
- Integration status registry (`src/lib/integrations.ts`) — honest CONNECTED / NOT_CONFIGURED states for affiliate, AI, SMTP, OAuth, analytics.
- Expanded `/api/health` — database, catalog counts, demo mode, integration snapshot (no secrets).
- Social profile config (`src/lib/social.ts`) — footer only shows real configured URLs; bare platform homepages rejected.
- Product provider adapter contract + stubs (`src/lib/providers/`) — sync returns skipped/NOT_CONFIGURED without inventing products.
- Price alerts API (`/api/alerts`) — persistence with explicit SMTP notification status.
- Unit tests for social + integrations (73 unit tests total).

### Fixed
- Footer no longer links to generic instagram.com / facebook.com / x.com / youtube.com placeholders.

### Notes
- Catalog population remains an **operations** requirement (`db:migrate` + seed/import on production DATABASE_URL).
- Affiliate earnings and automated feed import require owner credentials — architecture only, not live network calls inventing catalog data.

---


## [2.0.0] — 2026-08-19

### Added — Premium production upgrade

- **Multi-merchant commerce model**: `affiliate_networks`, `merchants`, `product_offers` tables. A product can hold multiple merchant offers with price, availability, affiliate URL, and freshness timestamps.
- **Price alerts** table and architecture for target-price notifications.
- **Sync logs** for merchant feed/API import jobs.
- **Commerce helpers** (`src/lib/commerce.ts`): best-offer selection, price freshness labels, discount math, transparent compare winners, legacy single-offer fallback.
- **Clean SEO routes**: `/category/[slug]`, `/brand/[slug]` with unique metadata, breadcrumbs, JSON-LD.
- **Sitemap** prefers clean category/brand URLs; only published products.
- **AI assistant** hardened retrieval: keyword relevance scoring, published filter, budget extraction, grounded responses only from catalog, safety refusals for medical/legal/financial framing.
- Expanded click tracking (offer, merchant, placement, source page, device, campaign).
- Price history supports offer- and merchant-level rows.
- Migration `0001_true_wolfsbane.sql` generated for schema upgrade.

### Changed

- Product schema: `published`, `metaTitle`, `metaDescription`, `lastPriceCheckedAt`, `updatedAt`; rating default 0 (honest when no reviews).
- Brands: optional description, logo, website.
- Seed populates networks, merchants, and primary offers for each product.
- Version bumped to 2.0.0.

### Notes

- Demo mode (`NEXT_PUBLIC_DEMO_MODE=1`) remains the honest default until real merchant data and affiliate tags are configured.
- External affiliate network credentials are documented in `.env.example`; integrations are architectural — live sync requires owner credentials.
- Full production build requires a reachable PostgreSQL instance (static pages query the DB).

---

## [1.0.0] — 2026-08-10

### Fixed — RC9 cleanup

- **Seeding could still create the documented admin password.** A production
  guard existed (`ALLOW_PRODUCTION_SEED`), but anyone using that override
  still got `admin123`. Seeding now refuses to run when the override is set
  without `SEED_ADMIN_PASSWORD`, and warns in development. Two overlapping
  guards were consolidated into one path rather than left to compete.
- `SEED_ADMIN_PASSWORD` documented in `.env.example`.
- `/affiliate-disclosure` added to the SEO regression suite.

### Verified

Full Playwright suite: **169/169 in a single run** (7.3 min) — the gate that
could not be closed in the two previous passes. Migrations verified against a
clean database (14 tables), and the seed verified idempotent and correctly
refusing the unsafe production path.

### Fixed — build was broken on arrival

- `src/app/layout.tsx` contained a raw HTML comment inside JSX (from a pasted
  Google Analytics snippet). The project did not typecheck or build.
- Analytics IDs were hardcoded, so every fork and preview deployment reported
  into the production property. Moved to `NEXT_PUBLIC_GA_ID` /
  `NEXT_PUBLIC_CLARITY_ID` in a new `Analytics.tsx`, and **gated on cookie
  consent** — the banner asks, so the site now honours the answer.
- `.env.example` was missing from the repository entirely. Recreated with all
  25 variables documented.

### Removed — unverifiable claims

Every statement the data could not support has been deleted or rewritten:
four invented customer testimonials, "200+ hours of testing", "editor-tested",
"48,000+ shoppers", "90-day price history", "best price", and a countdown timer
that implied listings expire at midnight. The homepage now shows live database
counts (products, categories, merchants, tracked clicks) instead of marketing
figures, and the FAQ states plainly that MeowMeow curates rather than tests.

### Added

- `AffiliateDisclosure` component placed beside outbound CTAs — FTC guidance
  asks for disclosure before the link, which a footer line does not satisfy.
- `/affiliate-disclosure` page explaining the business model, that the retailer
  handles orders and returns, and that prices may change.
- `DemoNotice` banner (`NEXT_PUBLIC_DEMO_MODE`) so sample data can never be
  mistaken for live listings.
- `AnnouncementBar` — dismissible, config-driven via `src/lib/site-config.ts`,
  and still for anyone who prefers reduced motion. Replaces a marquee that
  scrolled permanently and could not be closed.
- Primary navigation (Shop / Deals / Best Sellers / Blog) in the header.

### Changed — design system

The dark theme no longer reads pink and violet. Root cause was three-fold: the
brand tokens, four components hardcoding purple gradient panels, and
`.text-gradient` hardcoding cyan and violet stops.

- Dark: charcoal `#0b0a09`, cream `#f2ede4`, muted gold `#d4a24c` (8.55:1)
- Light: ivory `#faf7f2`, charcoal `#1b1714`, deep gold `#8a6217` (5.12:1)
- Hero artwork regenerated in champagne and bronze
- All contrast verified numerically; the first light gold failed AA at 3.63:1
  and was darkened before shipping

### Changed — header, mega menu, footer

- Mega menu gained Escape, click-outside and `aria-controls` / `aria-haspopup`.
  Previously only `onMouseLeave` dismissed it, unreachable by keyboard or touch.
- Mobile drawer now locks body scroll while open.
- Footer restructured into Shop / Discover / Company / Help & legal. Emoji
  removed from navigation labels, and four placeholder links that all pointed
  at `/contact` (Careers, Affiliate program, Help centre, Shipping & returns)
  replaced with destinations that exist.

---

## [1.0.0] — 2026-08-05

### Security — found during independent zero-trust audit

- **CRITICAL — rate limiting was completely bypassable.** `clientKey()` read
  `x-forwarded-for` unconditionally, and that header is attacker-controlled
  unless a trusted proxy overwrites it. Sending a different value per request
  gave each one its own bucket, defeating **every** limit on the site: login
  brute-force protection, newsletter and contact spam controls, review flooding,
  chat/search amplification, and click-fraud limits on affiliate analytics.
  Reproduced with 12 consecutive requests carrying varied headers — all
  accepted, while the unspoofed control was throttled from the sixth. Caller
  identity now prefers unforgeable platform headers, falls back to
  `x-forwarded-for` only when `TRUST_PROXY=1` (and then takes the hop the proxy
  appended rather than the client-controlled first entry), and otherwise uses a
  single shared bucket — stricter, and safe by default. Pinned by an
  integration regression test.
- **Four endpoints returned 500 on malformed JSON** (`newsletter`, `contact`,
  `chat`, `search/color`) — the earlier hardening pass covered only four of the
  eight. All eight now return 400.
- **`/api/search/color` was unthrottled** while scanning and ranking up to 500
  rows per request. Now rate limited like the other expensive reads.

### Fixed — test quality

- Integration tests for auth and reviews shared one rate-limit bucket, so
  earlier traffic could throttle them into failure — flaky by construction.
  They now report and skip when throttled rather than asserting loosely.
- The broken-image assertion polled for 10s, too tight under parallel workers.

### Documented

- `TRUST_PROXY`, `DATABASE_POOL_MAX`, `DATABASE_POOL_IDLE_MS` and
  `DATABASE_CONNECTION_TIMEOUT_MS` added to `.env.example`.


Release engineering pass: the manual audit loop is replaced by an automated
regression suite, and the remaining verified defects are fixed.

### Added — automated regression suite

- **188 tests across four layers**: 67 unit, 45 component, 29 integration and
  47 SEO plus 50 accessibility, 43 responsive and 24 journey checks under
  Playwright. Every critical found in rc.1–rc.5 is pinned by a named test —
  the authentication bypass, the JSON-LD script-tag breakout, broken privilege
  revocation, the nested-anchor hydration failure, the cookie-write-during-render
  error, malformed-input 500s, missing security headers, and the invalid
  OpenGraph type that silently discarded all product-page metadata.
- **GitHub Actions pipeline** (`.github/workflows/ci.yml`) running lint,
  typecheck, unit, component, integration, coverage, build, performance budgets
  and the full Playwright suite against a real PostgreSQL service, with npm and
  Playwright browser caches. Production dependency advisories fail the build.
- **Performance budgets** (`tests/scripts/check-budgets.mjs`) for total client
  JS, largest chunk, image and font weight, and duplicate packages in the
  production tree.

### Fixed — found by the new suite

Writing the tests immediately surfaced nine defects that four manual audits had
missed:

- **Unlabelled form fields** on the contact form (four) and the product review
  form (three) — placeholders are not accessible names. The same failure class
  fixed on the login form in rc.2, in two places never checked.
- **Heading rank skipped on every page in the site**: the footer newsletter
  panel used `<h3>` directly beneath the page `<h1>`.
- **Touch targets below the WCAG 2.5.8 minimum** on the product page — the
  review star selector (20px), "helpful" vote buttons (17px), breadcrumb links
  (16px) and the rating jump link. Hit areas enlarged; no visual change.
- **Missing canonical and `og:url`** on `/blog` and `/about`.

### Security

- **Next.js upgraded to 16.3** and **PostCSS to 8.5.25**, clearing four
  high-severity advisories including middleware bypass, server-side request
  forgery and cache confusion. `npm audit --omit=dev` now reports **zero
  vulnerabilities**.
- Remaining advisories are confined to dev tooling (Vitest and its Vite
  dependency) and require a semver-major upgrade. They are documented rather
  than forced: they never reach the deployed artifact, and a major test-runner
  upgrade carries its own risk that does not belong in a release pass.

---

## [1.0.0-rc.5] — 2026-08-04

Fourth release audit, targeting deployment correctness and search-engine output.

### Fixed

- **CRITICAL for the business model — every product page emitted no metadata at all.** `generateMetadata` declared `openGraph.type: "product"`, which Next.js rejects as an invalid OpenGraph type. The resulting exception discarded the *entire* metadata object, so product pages shipped with no `<title>`, no meta description, no canonical, no Open Graph and no Twitter card. On a site whose revenue depends on organic search and social sharing, the money pages were the ones appearing untitled in search results and sharing as blank cards. The failure was silent — the page rendered normally and only a server-side log line revealed it. Changed to `type: "website"`; product semantics were already carried by the Product JSON-LD, which is what search engines actually consume.
- **`NEXT_PUBLIC_APP_URL` was documented but never read.** The production domain was hardcoded in seventeen places, including `sitemap.ts`, `robots.ts`, `metadataBase` and the JSON-LD graph. Any deployment on another domain — a preview build, staging, or simply a different brand domain — published a sitemap full of URLs it did not own and canonical tags redirecting all search equity to `meowmeow.shop`. Added `SITE_URL` / `absoluteUrl()` in `src/lib/utils.ts` as the single source of truth; verified that setting the variable changes the sitemap, robots directive, canonicals and Open Graph URLs together.
- **Product, blog and catalogue pages had no canonical tag.** The catalogue was the worst case: filter state lives in the query string, so every combination of category, brand, price band and sort order was a separately indexable URL for the same content. Canonicalising collapses those permutations onto the category page, and keyword searches are now `noindex, follow`.

---

## [1.0.0-rc.4] — 2026-08-04

Third release audit, targeting session integrity and the developer setup path.

### Security

- **HIGH — privilege revocation did not work.** Authorisation read the `role` embedded in the session token, which is a snapshot taken at login and valid for thirty days. The database was never consulted. Demoting an administrator left them with full admin access until the token expired, and **deleting the user account entirely did not revoke access either** — the signed token still validated and still claimed `role: "admin"`. Confirmed by logging in, demoting the account, then deleting it, and retaining the dashboard throughout. This made incident response impossible: there was no way to lock out a compromised or departing administrator. Added `getCurrentUser()` / `isCurrentUserAdmin()`, which re-read the live row and return null when the account no longer exists; `/admin` and `/account` now authorise from that. Verified that demotion revokes access immediately, re-promotion restores it, and forged tokens are rejected.
- **Session signature compared with `!==`.** The HMAC was checked with a non-constant-time string comparison, while passwords in the same file were correctly compared with `timingSafeEqual`. Now consistent.

### Fixed

- **`npm run db:seed` failed from a clean checkout.** The seed script never loaded `.env`, so the setup flow documented in the README broke for every new developer even with correct configuration. It now imports `dotenv/config`.
- **The seed was not idempotent.** Running it a second time aborted on unique constraints, and plain `DELETE`s left the identity sequences advanced, breaking the fixed brand and category ids the fixtures rely on. It now truncates with `RESTART IDENTITY CASCADE`; verified across three consecutive runs.

---

## [1.0.0-rc.3] — 2026-08-04

Second release audit, focused on the areas the first pass covered least: input validation on write endpoints, output encoding, throttling of expensive reads, and build reproducibility.

### Security

- **CRITICAL — stored cross-site scripting via product reviews.** `JsonLd` embedded structured data with `JSON.stringify`, which does not escape `<`. Product pages include review author names and bodies in their Product schema, and reviews can be submitted by anyone without authentication. A review body containing `</script>` therefore closed the tag early and everything after it was parsed as HTML. Confirmed by posting `</script><img src=x onerror=...>` and finding it executable in the rendered page — enough to steal a session or drive authenticated admin actions. Fixed by escaping `<`, `>` and `&` as unicode sequences; verified that the payload now round-trips as inert data and that all three JSON-LD blocks still parse as valid JSON for search engines. The root layout was inlining the same unsafe pattern and now uses the shared component.
- **Unthrottled expensive endpoints.** `/api/chat` and `/api/search` each run several catalog queries per unauthenticated request, and `/api/click/[slug]` writes a row per call — meaning affiliate analytics could be inflated at will. All three are now rate limited at ceilings well above normal use.

### Fixed

- **Malformed input returned 500 instead of a validation error** across `/api/cart`, `/api/wishlist` and `/api/reviews`. A non-numeric quantity or rating became `NaN` and reached the database as an integer; a product id that did not exist surfaced as a foreign-key violation. Each now returns `400` or `404` with a usable message. Added `src/lib/validation.ts` so this parsing lives in one place rather than being repeated per route.
- Reviews explicitly ignore any client-supplied `verified` flag — it is earned, not claimed.

### Added

- `engines: node >=20` and `.nvmrc`. Without a pinned runtime a host defaulting to Node 18 fails in confusing ways part-way through the build.

### Verified sound (no change needed)

Affiliate links are plain anchors with `rel="sponsored noopener noreferrer"`, so Next.js never prefetches them and click counts stay honest. Blog content renders through a JSX-returning formatter rather than raw HTML. Cart quantity clamping already handled negative values correctly. `SameSite=Lax` session cookies block cross-site form posts, and no `GET` endpoint mutates state except the deliberately-tracked affiliate redirect.

---

## [1.0.0-rc.2] — 2026-08-04

Principal-engineer release audit. No features added, no UI redesigned. Every change below fixes a verified defect found during the audit.

### Security

- **CRITICAL — unauthenticated admin takeover (auth bypass).** The `social` action on `POST /api/auth` minted a valid session for *any* email address supplied in the request body, with no password and no provider verification. A single unauthenticated `curl` returned an admin session and full access to `/admin`, including customer emails and analytics. Confirmed exploitable against the seeded `admin@meowmeow.shop` account, then fixed: the action now returns `501` until a real OAuth flow verifies identity with the provider. The login buttons state plainly that social sign-in is unavailable rather than silently calling a broken flow.
- **No security headers were sent.** Added `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` and a `Content-Security-Policy` covering `frame-ancestors`, `base-uri`, `form-action` and `object-src`. Disabled the `X-Powered-By` version-disclosure header.
- **Unvalidated input caused 500s on the auth endpoint.** A request missing `email` or `password` threw on `.toLowerCase()` instead of returning a validation error. Bodies are now parsed defensively and rejected with `400`.
- **Affiliate redirect could throw or leave the web.** `/api/click/[slug]` called `new URL()` on unvalidated data — a malformed link produced an unhandled 500. Now validated as well-formed `http(s)` and rejected with `502` otherwise, and the click is only recorded once the destination is known good.

### Fixed

- **Homepage and blog were frozen at build time.** Both were statically prerendered with no revalidation, so product prices, flash-sale discounts and new posts would never update until a redeploy — unacceptable on a site that advertises prices, and a compliance risk with affiliate networks. Added ISR: 10 minutes for the homepage, 1 hour for the journal and sitemap.
- **Memory leak in the navigation bar**, which mounts on every page: the search debounce timer was never disposed, so a pending request could fire and set state after unmount. The `/api/meta` fetch had no cancellation guard either. Both now clean up.

### Removed

- Dead code: `categoryIcon`, `ratingColor` and `slugify` had zero references anywhere in the codebase.

---

## [1.0.0-rc.1] — 2026-08-04

Hardening pass over the existing application. No features were removed, no routes changed, and no APIs were altered. Every change is a fix or an improvement to something already present.

### Fixed

**Critical**

- **Error page for first-time visitors on `/cart`, `/wishlist` and `/account`.** `getSessionId()` wrote a cookie during a Server Component render, which Next.js forbids. Anyone arriving directly from a shared link, bookmark or search result — with no session cookie yet — tripped the error boundary. It went unnoticed because visiting the homepage first sets the cookie through a route handler, where writes are legal. The write is now attempted and allowed to fail, with the id persisted on the next route-handler request.
- **React hydration error #418 on the homepage.** `ProductCard` nested the quick-view link and the add-to-cart button *inside* the image link. Browsers hoist nested anchors out of one another, so the parsed DOM could never match React's tree. The media link, badges and hover actions are now siblings within the media region. Isolated by bisecting each homepage section through a temporary probe route, since the failure never reproduced in development.
- **Production build failed without network access.** `next/font/google` fetches at build time. Sora and Manrope are now self-hosted variable woff2 files loaded through `next/font/local` — also removing all third-party font requests.
- **`AUTH_SECRET` silently fell back to a hardcoded constant in production**, meaning session tokens could have been forged by anyone reading the source. Resolution is now lazy — so builds and prerendering are unaffected — and throws in production when unset.

**Major**

- Hero search button escaped its input: `.btn-shine` set `position: relative`, overriding Tailwind's `absolute` at equal specificity but later in the cascade. Custom helpers moved into `@layer components` so utilities always win.
- Homepage statistics rendered "0K+" — real counts were being divided into zero before display. Replaced with an honest compact formatter over raw values.
- Newsletter forms in the footer and blog posts were server actions that posted to the API over HTTP and discarded the response, so a failure was indistinguishable from a success. Replaced with one shared client component reporting real state.
- Nine ESLint errors under the React Compiler rules — `setState` called synchronously inside effects across seven files, and impure `Date` calls during render in `PriceChart`. Fixed with a `useSyncExternalStore` storage layer and the documented adjust-state-during-render pattern, not suppressions.
- Missing `public/` directory: the hero image and all Open Graph artwork returned 404.
- Horizontal overflow on mobile. Flexbox `min-width: auto` crushed the header menu button to 20px and pushed the action cluster off-screen; the catalog sort `<select>` forced its widest option as a minimum width at 320px.
- `RecentlyViewed` reconstructed entries by scraping `document.title`, storing empty images and zero prices. It now receives the product record.
- Drizzle config contained a hardcoded database connection string; it now reads from the environment.

### Added

- **Migration baseline.** The project previously relied on `drizzle-kit push`, which bypasses migration history and is unsafe against production data. A generated migration plus `db:generate`, `db:migrate`, `db:push`, `db:studio` and `db:seed` scripts. Verified end to end against a clean database.
- **`SmartImage`** — every image in the app now falls back to a branded gradient tinted with the product's own accent colour, in an identically sized box, so a dead CDN link never yields a broken icon or a layout shift.
- **`EmptyState`** — one primitive replacing four bespoke empty screens, with a primary action as a required prop.
- **`NewsletterForm`** — shared signup component with sending, success and error states.
- **`rate-limit`** — fixed-window limiter on `auth`, `newsletter`, `contact` and `reviews`, returning `429` with `Retry-After`.
- **`client-store`** — SSR-safe reactive `localStorage` on `useSyncExternalStore`.
- **`category-icons`** — one Lucide icon per category slug, shared by every surface.
- Route-level streaming skeletons for `/products`, `/blog` and `/products/[slug]`, shaped to the final layout.
- Open Graph image rendered in the project's own typefaces, and a brand hero image.
- `README.md`, `DEPLOYMENT_CHECKLIST.md`, `.env.example` and `.gitignore`.

### Changed — design

- **Complete token system.** Semantic colour tokens (`brand`, `gold`, `success`, `warning`, `danger`, `info`) with text-safe variants, a three-step brand-tinted elevation scale, and a four-step motion scale with a shared easing curve — all defined for both themes.
- **Emoji removed from the interface entirely** (0 occurrences in UI code), replaced by Lucide icons across the navigation marquee, mega menu, mobile drawer, category grid, filter chips, assistant quick actions, price-history verdicts, review badges, empty and error states, and page headings. Testimonial avatars became gradient monograms.
- Normalised to a consistent scale: icon sizes (19 arbitrary values → 9), border radius, transition durations (5 → 4 semantic tokens), control heights, and homepage section rhythm.
- Cards gained a resting elevation and a matching `:focus-within` lift, so keyboard users see the same affordance as mouse users.

### Changed — accessibility

Targets WCAG 2.1 AA.

- **Contrast:** five accent tokens failed 4.5:1 for small text in the light theme. Fixed at the token layer — `--brand` shifted to an AA-compliant tone with `--brand-vivid` retained for fills — correcting all 127 usages at once. Badge and rating colours moved to compliant pairs.
- **Focus:** `outline-none` in four places removed the indicator entirely. A keyboard walk found two stops with no visible focus; now zero of thirty-five.
- **Forms:** login inputs had no accessible name — placeholders do not qualify. Added visually-hidden labels, ids and `autoComplete`. The 16px password reveal became a 36px target with `aria-pressed`.
- Eliminated all nested interactive elements; added `aria-pressed` to toggles, `role="status"` and `role="alert"` to form feedback, and product names to card control labels.
- Verified against Chrome's accessibility tree: zero unnamed controls.

### Changed — SEO

- Metadata added for `/compare`, `/contact` and `/search` via co-located layouts, since client components cannot export it. Search results are `noindex, follow`.
- Canonical URLs, `googleBot` directives for large previews and unlimited snippets, and correct Open Graph dimensions.

### Changed — performance

- Self-hosted fonts eliminate third-party requests and render-blocking DNS.
- Streaming skeletons remove blank shells on data-heavy routes without layout shift.
- `useSyncExternalStore` removes the extra render pass previously caused by reading storage in effects.
- Optimistic wishlist updates with rollback; cancellable fetches guarded against unmount races.

### Security

- scrypt password hashing with timing-safe comparison (retained), plus `secure` flag on the anonymous session cookie in production.
- Rate limiting on all public write endpoints.
- `AUTH_SECRET` enforced in production.
- Credentials removed from the Drizzle config; `.env` git-ignored; `.env.example` documents every variable without secrets.

### Verified

- Lint, typecheck and production build: zero errors
- Hydration: zero errors across 13 routes
- Responsive: zero overflow across 12 routes × 7 viewports (320–1440px)
- Links: 88 internal links crawled, none broken
- Accessibility: zero unnamed controls, zero missing alt text, zero nested interactive elements, one `<h1>` per page
- Keyboard: every tab stop has a visible focus indicator
- Migrations and seed: applied cleanly to a fresh database

### Not included — requires external credentials

Affiliate network keys, SMTP delivery, OAuth client secrets and analytics. Each degrades gracefully: affiliate links resolve without attribution, newsletter signups are stored without confirmation email, social buttons stay inert while email authentication works, and no analytics loads.
