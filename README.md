# MeowMeow

**Premium affiliate shopping platform.** A curated storefront that reviews products, tracks their price history, and routes shoppers to the best-priced retailer — earning affiliate commission on the click-through rather than selling inventory directly.

Built with Next.js 16 (App Router), React 19, Drizzle ORM and PostgreSQL.

> **v3.1.0.** Multi-merchant offer architecture, enhanced AI retrieval, clean category/brand SEO routes, price freshness helpers, expanded schema (merchants, offers, price alerts, sync logs). See `CHANGELOG.md` and `DEPLOYMENT_CHECKLIST.md`.

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Development](#development)
- [Production build](#production-build)
- [Deploying to Vercel](#deploying-to-vercel)
- [Deploying with Docker](#deploying-with-docker)
- [SEO](#seo)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Security](#security)
- [AI shopping assistant](#ai-shopping-assistant)
- [Affiliate integrations](#affiliate-integrations)
- [Authentication](#authentication)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

MeowMeow is a **discovery and referral** platform, not a merchant. Shoppers browse editor-tested products, compare them side by side, save them to a wishlist or cart, and are then handed off to the retailer with an affiliate link. No payments are processed and no inventory is held — the cart is best understood as a smart shopping list.

The catalog ships with 89 seeded products across 26 categories, plus reviews, blog posts, coupons and 12 weeks of synthetic price history per product.

## Features

**Storefront**
- Homepage with hero, flash sale countdown, trending / best-seller / premium / AI-picked rails, category grid, statistics, testimonials, FAQ and journal preview
- Catalog with faceted filtering (category, collection, brand, price band, rating), sorting, and infinite scroll
- Product pages with zoomable gallery, sticky buy box, 90-day price-history chart, specifications, pros and cons, reviews, related products and recently viewed
- Compare up to four products side by side
- Wishlist and cart, persisted per session
- Search with instant suggestions, voice search, and colour-based visual search
- Blog with tags, reading time and related posts
- Admin dashboard: analytics, products, coupons, users, subscribers and messages

**Platform**
- Light and dark themes, persisted and system-aware, with no flash of wrong theme
- Full design-token system driving colour, elevation and motion
- AI shopping assistant (see [below](#ai-shopping-assistant))
- Rate-limited public write endpoints
- Structured data, sitemap and robots for search engines

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| Icons | Lucide |
| Database | PostgreSQL |
| ORM / migrations | Drizzle ORM + Drizzle Kit |
| Auth | Custom scrypt password hashing + HMAC-signed session cookies |
| Fonts | Self-hosted Sora (display) and Manrope (body), variable woff2 |
| Language | TypeScript (strict) |
| Linting | ESLint with `eslint-config-next` |

## Folder structure

```
.
├── drizzle/                    SQL migrations + snapshots (generated)
├── public/images/              Hero and Open Graph artwork
└── src/
    ├── app/
    │   ├── api/                Route handlers (auth, cart, wishlist, search,
    │   │                       compare, chat, reviews, newsletter, contact,
    │   │                       click tracking, meta, health)
    │   ├── products/           Catalog + dynamic product pages
    │   ├── blog/               Journal index + dynamic posts
    │   ├── admin/ account/     Authenticated areas
    │   ├── cart/ wishlist/ compare/ search/
    │   ├── about/ contact/ privacy/ terms/ login/ signup/
    │   ├── layout.tsx          Root layout, fonts, metadata, providers
    │   ├── globals.css         Design tokens + component layer
    │   ├── loading.tsx         Streaming skeletons (also per-route)
    │   ├── error.tsx           Error boundary
    │   ├── not-found.tsx       404
    │   ├── robots.ts           robots.txt
    │   └── sitemap.ts          sitemap.xml
    ├── components/
    │   ├── layout/             Navbar, Footer, MobileNav
    │   ├── home/               Hero, Sections
    │   ├── product/            Gallery, BuyBox, PriceChart, Reviews, RecentlyViewed
    │   ├── catalog/            Filter + grid
    │   ├── cart/ auth/ admin/
    │   ├── ProductCard.tsx     Catalog card
    │   ├── SmartImage.tsx      Image with branded fallback
    │   ├── NewsletterForm.tsx  Shared signup form
    │   ├── Assistant.tsx       AI shopping assistant
    │   ├── ui.tsx              Badge, RatingStars, EmptyState, skeletons
    │   ├── store.tsx           Cart / wishlist / compare context
    │   └── providers.tsx       Theme context
    ├── db/                     Drizzle schema, client, seed script
    ├── fonts/                  Self-hosted variable fonts
    └── lib/                    auth, session, rate-limit, client-store,
                                category-icons, utils
```

## Installation

Requires **Node.js 20+** and a **PostgreSQL 14+** database.

```bash
npm install
cp .env.example .env       # then fill in DATABASE_URL and AUTH_SECRET
```

## Environment variables

Only two are required; everything else degrades gracefully.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `AUTH_SECRET` | **Yes in production** | Signs session tokens. `openssl rand -base64 48` |
| `NEXT_PUBLIC_APP_URL` | **Strongly recommended** | Public origin. Drives `metadataBase`, every canonical tag, Open Graph URLs, `sitemap.xml` and `robots.txt`. Defaults to the production domain, so **set it on any other deployment** or canonicals will point at the wrong host. |
| `AMAZON_ASSOCIATE_TAG`, `IMPACT_*`, `CJ_API_KEY`, `SHAREASALE_*`, `RAKUTEN_API_KEY` | No | Affiliate attribution |
| `SMTP_*` | No | Newsletter double opt-in delivery |
| `GOOGLE_CLIENT_*`, `GITHUB_CLIENT_*` | No | Social login |
| `NEXT_PUBLIC_ANALYTICS_ID`, `*_SITE_VERIFICATION` | No | Analytics and search console |

In development a fallback `AUTH_SECRET` is used so you can start immediately. **In production the app throws if it is unset** rather than signing sessions with a publicly known constant.

## Database setup

```bash
npm run db:migrate    # apply migrations from ./drizzle
npm run db:seed       # load the demo catalog (89 products, 26 categories)
```

Other commands:

```bash
npm run db:generate   # create a new migration after editing src/db/schema.ts
npm run db:push       # push schema directly (development only)
npm run db:studio     # browse data in Drizzle Studio
```

Use `db:migrate` for anything deployed. `db:push` skips the migration history and is unsafe against production data.

## Development

```bash
npm run dev           # http://localhost:3000
```

Quality gates, all of which must pass before release:

```bash
npm run lint
npm run typecheck
npm run build
```

## Production build

```bash
npm run build
npm run start
```

`DATABASE_URL` must be reachable at build time — several routes are statically prerendered from the database.

## Deploying to Vercel

1. Push the repository to GitHub, GitLab or Bitbucket.
2. Import the project in Vercel. The framework preset, build command (`next build`) and output are detected automatically.
3. Add environment variables under **Settings → Environment Variables**, at minimum `DATABASE_URL`, `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL`. Set them for Production, Preview and Development.
4. Use a **pooled** connection string (Neon, Supabase or PgBouncer). Serverless functions open many short-lived connections and will exhaust a direct Postgres limit.
5. Run migrations against the production database before the first deploy: `DATABASE_URL="<prod-url>" npm run db:migrate`.
6. Deploy, then work through `DEPLOYMENT_CHECKLIST.md`.

The in-memory rate limiter is per-instance. On serverless it still blunts scripted abuse but is not a global quota — swap it for Redis if you need strict limits (see [Security](#security)).

## Deploying with Docker

No Dockerfile ships with the project. If you prefer containers, add `output: "standalone"` to `next.config.ts` and use a multi-stage build:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG DATABASE_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

Pass `DATABASE_URL` as a build argument as well as a runtime variable, since prerendering reads from the database.

## SEO

- Per-route metadata, including `generateMetadata` for products and blog posts
- Canonical URLs; search result pages are `noindex, follow`
- JSON-LD: Organization, WebSite with SearchAction, Product, BreadcrumbList, Review and Article
- Open Graph and Twitter card images (`public/images/og.jpg`, rendered in the brand's own typefaces)
- `sitemap.xml` and `robots.txt` generated from the database at `src/app/sitemap.ts` and `src/app/robots.ts`
- `googleBot` directives for large image previews and unlimited snippets
- Descriptive alt text throughout, semantic headings, one `<h1>` per page

## Accessibility

Targets **WCAG 2.1 AA**.

- Every colour token meets 4.5:1 against its surfaces in both themes. Vivid accents are reserved for fills and large type; a darker text-safe variant is used for small text.
- Visible focus indicator on every interactive element, verified by walking the tab order
- No nested interactive elements — verified by a codebase-wide scan
- Accessible names on all controls, verified against Chrome's accessibility tree
- Skip-to-content link, semantic landmarks, `aria-pressed` on toggles, `role="status"` / `role="alert"` on form feedback
- Touch targets meet the 24×24 CSS-pixel minimum; primary controls are 40px or larger
- `prefers-reduced-motion` disables animation globally

## Performance

- React Server Components by default; client components only where interaction requires them
- Route-level streaming skeletons for the catalog, blog and product pages, shaped to the final layout so no layout shift occurs on swap
- Self-hosted variable fonts with `display: swap` and preload — no third-party font requests
- Lazy image loading with `fetchPriority` hints on above-the-fold artwork; fixed aspect ratios prevent CLS
- Indexed foreign keys and rating column on `products`; parallel queries via `Promise.all`
- `useSyncExternalStore` for client storage, avoiding hydration passes and redundant renders


## Testing

The suite exists because four manual audits each found a serious defect the
previous ones missed — including one (`openGraph.type: "product"`) that rendered
a visually perfect page while silently emitting no title, description or
canonical. Every issue found in those audits is pinned by a named regression
test so it cannot return unnoticed.

| Layer | Location | Runner | Needs |
| --- | --- | --- | --- |
| Unit | `tests/unit` | Vitest (node) | nothing |
| Component | `tests/component` | Vitest + Testing Library (jsdom) | nothing |
| Integration | `tests/integration` | Vitest (node) | running server + database |
| E2E / SEO / a11y / responsive | `tests/e2e` | Playwright | running server + database |

### Running the tests

```bash
npm run test              # unit + component + integration
npm run test:unit         # fastest feedback loop
npm run test:component
npm run test:watch        # re-run on change

# Integration and E2E need the app running:
npm run build && npm run start &
npm run test:integration
npm run test:e2e
```

Integration tests **skip themselves with a warning** if no server is listening,
so `npm run test` stays green on a fresh checkout. Point any suite at another
environment — including a deployed staging URL — with `BASE_URL`:

```bash
BASE_URL=https://staging.example.com npm run test:e2e
TEST_BASE_URL=https://staging.example.com npm run test:integration
```

Run everything, in the same order CI does:

```bash
npm run test:all          # lint → typecheck → tests → build → budgets → e2e
```

### Coverage

```bash
npm run test:coverage     # text summary + HTML in coverage/
```

Read the number in context. API route handlers report 0% because integration
tests exercise them over HTTP in a separate process, which V8 coverage cannot
instrument — they are among the most thoroughly tested code in the repository.
The security-critical modules (`src/lib/validation.ts`, `rate-limit.ts`,
`auth.ts`, `utils.ts`) and the components carrying past regressions
(`ProductCard`, `SmartImage`, `NewsletterForm`) are covered directly and sit
near 100%. Presentational components without their own tests are the honest gap.

### Performance budgets

```bash
npm run build && npm run test:perf
```

Checks total client JS, largest chunk, image and font weight, and duplicate
packages in the production dependency tree. Budgets live at the top of
`tests/scripts/check-budgets.mjs` and are set slightly above current
measurements — tight enough to catch a regression, loose enough to avoid noise.

### Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request in three jobs:

1. **static** — install, lint, typecheck, unit and component tests.
2. **verify** — spins up PostgreSQL, migrates, seeds, builds, checks budgets,
   starts the server, then runs integration, coverage and the full Playwright
   suite. Coverage and the Playwright report upload as artifacts.
3. **audit** — fails on **high or critical advisories in production
   dependencies**; dev-tooling advisories are reported without blocking, since
   they never reach the deployed artifact.

npm dependencies and Playwright browsers are cached separately.

### Debugging a failing test

```bash
npx vitest run tests/unit/auth.test.ts -t "rejects a forged"   # one test
npx playwright test --headed --project=desktop-chromium        # watch it run
npx playwright test --debug -g "canonical"                     # step through
npx playwright show-report                                     # trace, video, screenshots
```

Playwright captures a trace on first retry plus a screenshot and video on
failure. On a machine that cannot download browsers, point it at an existing
Chromium with `CHROMIUM_PATH=/path/to/chromium`.

If an E2E test fails only in CI, download the `playwright-report` artifact from
the run — the trace viewer replays the exact failure with a DOM snapshot at
every step.

## Security process

- **Production dependencies gate the build.** `npm audit --omit=dev
  --audit-level=high` runs in CI and fails on high or critical advisories.
- **Dev-tooling advisories are tracked, not forced.** A major upgrade to fix a
  test runner is a change with its own risk; it is scheduled deliberately
  rather than applied under release pressure. Current known items are listed in
  `CHANGELOG.md`.
- **Report a vulnerability** privately to the maintainers rather than opening a
  public issue.
- **Before every release**, work through `DEPLOYMENT_CHECKLIST.md` — it covers
  secret rotation, the seeded admin credential, and post-deploy smoke tests.

## Release process

1. `npm run test:all` passes locally.
2. CI is green on `main`.
3. `npm audit --omit=dev --audit-level=high` reports nothing.
4. Update `CHANGELOG.md`; bump the version in `package.json`.
5. Deploy to staging, then run `BASE_URL=<staging> npm run test:e2e` against it.
6. Run Lighthouse against staging (see `DEPLOYMENT_CHECKLIST.md` for targets).
7. Tag the release and promote to production.
8. Watch error monitoring for the first hour.

## Security

- Passwords hashed with **scrypt** and a per-user salt; comparison is timing-safe
- Sessions are HMAC-SHA256 signed, `httpOnly`, `sameSite=lax`, and `secure` in production
- `AUTH_SECRET` is resolved lazily and **throws in production if unset**
- Rate limiting on `auth`, `newsletter`, `contact` and `reviews` (`src/lib/rate-limit.ts`), returning `429` with `Retry-After`
- Admin routes resolve the **live** role from the database via `getCurrentUser()` rather than trusting the role embedded in the session token, so demoting or deleting an account revokes access immediately
- Input validation on every write endpoint; all queries are parameterised by Drizzle
- React escapes output by default; no `dangerouslySetInnerHTML` on user-supplied content
- Security headers set in `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, and a CSP covering `frame-ancestors`, `base-uri`, `form-action` and `object-src`
- No secrets in the repository — `.env` is git-ignored and the Drizzle config reads from the environment

**Known follow-up:** the CSP does not yet restrict `script-src`. Next.js injects inline bootstrap scripts, so a correct policy requires per-request nonces via middleware; a blanket `unsafe-inline` policy would look protective without being so. This is deliberate and tracked rather than overlooked.

To make rate limiting global across instances, replace the `Map` in `src/lib/rate-limit.ts` with Redis. Call sites use a single `limit(key, opts)` interface, so only that file changes.

## AI shopping assistant

A floating assistant ("Meow") answering product questions, gift suggestions, comparisons, trending queries and coupon lookups.

It is **retrieval-based and runs entirely server-side against the live catalog** — see `src/app/api/chat/route.ts`. It classifies intent (greeting, recommend, compare, gift, budget, deal, category, help) and answers from real database rows, so it cannot hallucinate a product that does not exist. **No third-party AI API key is required and no chat history is stored.**

To swap in an LLM later, replace the handler in that one route; the client component needs no changes.

## Affiliate integrations

Every product row carries an `affiliateUrl` and a `store`. Outbound clicks route through `/api/click/[slug]`, which records the click before redirecting — this powers the click and revenue analytics in the admin dashboard.

The schema and redirect layer support Amazon Associates, Impact, CJ, ShareASale, Rakuten, ClickBank, PartnerStack and custom links. **Network credentials are not included**; add the keys from `.env.example` and attribution begins. Without them the redirect still works but no commission is tracked.

Affiliate relationships are disclosed in the footer, on product pages and in the FAQ, as required by the FTC and comparable regimes.

## Authentication

Email and password authentication works out of the box: scrypt hashing, HMAC-signed session cookies, a 30-day TTL, and `user` / `admin` roles.

Google and GitHub buttons are present on the login screen but **disabled until a real OAuth flow is implemented**. The server rejects social sign-in with `501`. An earlier implementation minted sessions from a client-supplied email without verification and was removed in rc.2 — do not reinstate it without provider-side token validation. Anonymous visitors receive a session id so cart, wishlist and compare work without an account, and that state carries over on sign-up.

## Troubleshooting

**`DATABASE_URL is required` at build time**
Several routes prerender from the database. Export `DATABASE_URL` in the build environment, not only at runtime.

**`AUTH_SECRET must be set in production`**
Working as intended — the app refuses to sign sessions with a public constant. Generate one with `openssl rand -base64 48`.

**Build fails fetching fonts**
It should not: fonts are self-hosted from `src/fonts`. If you reintroduce `next/font/google`, the build will require network access.

**Product images show a paw-print gradient**
`SmartImage` fell back because the remote image failed to load. The seed data points at Pexels; check network access or replace the URLs. The fallback is intentional and occupies the identical box, so nothing shifts.

**Too many database connections on serverless**
Use a pooled connection string (Neon, Supabase or PgBouncer).

**`429` responses while testing forms**
Rate limiting is active. Limits are per IP per window; wait for `Retry-After` or adjust the values at the call site.

**Cart or wishlist appears empty after signing in**
Those are keyed to the anonymous session cookie. If cookies are blocked, or the browser was switched, the session id changes.

## License

No license file is currently included. Add one before public distribution — without it the work is treated as all-rights-reserved by default.

Third-party dependencies retain their own licenses. The bundled fonts, Sora and Manrope, are licensed under the SIL Open Font License 1.1. Seeded product photography is sourced from Pexels; review the Pexels license before commercial use, and replace the seed imagery with assets you have cleared.


## Background jobs & automation (v3.1)

Jobs are stored in the `jobs` table with locks, retries, and exponential backoff.

Protected worker endpoint:

```bash
curl -X POST https://your-domain.com/api/jobs/run \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"max":5}'
```

Job types: `product_sync`, `price_sync`, `stock_sync`, `price_alerts`, `email_queue`, `social_queue`, `content_queue`, `broken_link_check`, `catalog_cleanup`, `sitemap_refresh`, `analytics_rollup`.

### Feed import (admin)

```bash
curl -X POST https://your-domain.com/api/import \
  -H "Cookie: mm_auth=..." \
  -H "Content-Type: application/json" \
  -d '[{"external_product_id":"SKU1","merchant_slug":"daraz","title":"...","price":49999,"currency":"PKR","affiliate_url":"https://..."}]'
```

CSV is also accepted (`Content-Type: text/csv`).

### Support tickets

`POST /api/support` creates a ticket. Admin can list/reply via `GET`/`PATCH` with an admin session. AI chat escalates unresolved issues to tickets.

### Pakistan-first defaults

Currency **PKR**, merchant country **PK**, locale **en-PK**. Daraz provider slot is available; credentials required for live sync.


## Production release safeguards

- `NEXT_PUBLIC_DEMO_MODE` must be `0`/`false` in production. The seed command refuses production demo seeding unless explicitly overridden.
- Product imports accept only authorized CSV/JSON/XML feeds; the application does not scrape merchant storefronts.
- Provider status is configuration-aware; credentials alone do not create product data or claim a successful live sync.
- Configure `DARAZ_FEED_URL` only when the URL is an authorized affiliate/product feed supplied to your account.
- `CSV_FEED_URL` and `JSON_FEED_URL` are optional server-side feed sources. Keep credentials out of browser-exposed variables.
- Email delivery uses the configured SMTP transport and records queued/sent/failed attempts in `email_queue` and `email_logs`.
- Run a scheduler/worker against `POST /api/jobs/run` with `Authorization: Bearer $CRON_SECRET`; do not expose it publicly without the secret.
