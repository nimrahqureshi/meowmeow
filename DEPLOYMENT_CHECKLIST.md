# Deployment checklist

Work top to bottom. Items marked **Required** block launch; the rest can follow after go-live.

---

## Live deployment diagnosis (meowmeow-deals.vercel.app — observed 2026-08-19)

These are **observed** conditions on the public deployment, not theoretical risks.

| Finding | Severity | Status |
|---------|----------|--------|
| Catalog returns **0 products** (`/products`, category pages, `/api/search`) | Blocker | **Configuration / data** — production DB has categories & brands in sitemap but no product rows (or products not returned). Seed/import must be run against production `DATABASE_URL`. |
| `sitemap.xml` and `robots.txt` used `http://localhost:3000` | Blocker for SEO | **Configuration** — `NEXT_PUBLIC_APP_URL` was unset. Code now also falls back to `VERCEL_URL` when present (after this redeploy). Still set `NEXT_PUBLIC_APP_URL=https://meowmeow-deals.vercel.app` (or custom domain) explicitly. |
| Homepage chips reference products/reviews not in the catalog | Trust | Align homepage with real data or keep demo mode explicit. |
| Blog index has no articles | Content gap | Seed blog posts or publish real guides. |
| Affiliate network credentials | Not live | Env tags empty → links do not earn commission. **Configuration-required**, not a code claim of live integrations. |

### Required recovery steps for that deployment

1. In Vercel → Project → Settings → Environment Variables (Production):
   - `NEXT_PUBLIC_APP_URL` = `https://meowmeow-deals.vercel.app` (or final domain, no trailing slash)
   - `DATABASE_URL` = pooled production Postgres
   - `AUTH_SECRET` = unique production secret
2. Apply migrations: `DATABASE_URL="<prod>" npm run db:migrate`
3. Load catalog: `DATABASE_URL="<prod>" npm run db:seed` **or** import real products
4. Redeploy
5. Verify:
   - `curl -s https://meowmeow-deals.vercel.app/api/search?q=a | head`
   - `curl -s https://meowmeow-deals.vercel.app/sitemap.xml | head`
   - `/products` shows product cards

Until steps 2–3 succeed, **do not describe the deployment as a working shopping platform**.


---

## 1. Pre-flight

- [ ] **Required** — `npm run test:all` passes locally (lint, typecheck, tests, build, budgets, E2E)
- [ ] **Required** — CI is green on the commit being released
- [ ] **Required** — `npm audit --omit=dev --audit-level=high` reports nothing
- [ ] Coverage reviewed for unexpected drops (`npm run test:coverage`)
- [ ] Performance budgets met (`npm run test:perf`)
- [ ] After deploying to staging, `BASE_URL=<staging> npm run test:e2e` passes against it
- [ ] `.env` is git-ignored and no secrets are committed (`git log -p | grep -i secret`)
- [ ] `CHANGELOG.md` reflects what is shipping
- [ ] A license file has been added, or all-rights-reserved is the intent
- [ ] Seed imagery replaced with assets cleared for commercial use, or the Pexels license reviewed

## 2. Database

- [ ] **Required** — PostgreSQL 14+ provisioned (Neon, Supabase, RDS or equivalent)
- [ ] **Required** — Using a **pooled** connection string if deploying serverless
- [ ] **Required** — Migrations applied: `DATABASE_URL="<prod>" npm run db:migrate`
- [ ] Table count verified (expect 14 in `public`)
- [ ] Catalog loaded — either `npm run db:seed` for the demo data or your own import
- [ ] Automated backups enabled with a tested restore
- [ ] Connection limits reviewed against expected concurrency
- [ ] SSL enforced on the database connection

## 3. Environment variables

Set for **Production**, **Preview** and **Development** targets.

- [ ] **Required** — `DATABASE_URL`
- [ ] **Required** — `AUTH_SECRET`, generated with `openssl rand -base64 48` and unique per environment
- [ ] `NEXT_PUBLIC_APP_URL` set to the canonical origin, no trailing slash
- [ ] Confirmed `AUTH_SECRET` is *not* the development fallback
- [ ] Build environment can reach `DATABASE_URL` (prerendering reads from it)

## 4. Vercel setup

- [ ] Repository connected; framework preset detected as Next.js
- [ ] Node version pinned to 20+
- [ ] Environment variables added (section 3)
- [ ] Production branch set to `main`
- [ ] Deploy protection configured for preview environments if the catalog is confidential
- [ ] First deploy succeeds and the deployment log is free of warnings
- [ ] Function region placed near the database region to reduce latency

## 5. Domain, SSL and DNS

- [ ] Custom domain added and DNS records propagated
- [ ] **Required** — HTTPS certificate issued and valid
- [ ] HTTP redirects to HTTPS
- [ ] Apex and `www` resolve to one canonical host, the other redirecting
- [ ] `NEXT_PUBLIC_APP_URL` matches the canonical host exactly
- [ ] HSTS considered once you are confident in the certificate chain

## 6. OAuth *(optional — buttons stay inert until configured)*

- [ ] Google OAuth client created; `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` set
- [ ] GitHub OAuth app created; `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` set
- [ ] Authorised redirect URIs registered for production **and** preview origins
- [ ] Consent screen branding and scopes reviewed (email and profile only)
- [ ] Sign-in and sign-out tested end to end for both providers

## 7. SMTP *(optional — signups are stored regardless)*

- [ ] Provider chosen (Resend, Postmark, SES or similar)
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` set
- [ ] SPF, DKIM and DMARC records published for the sending domain
- [ ] Double opt-in confirmation email delivers and the link works
- [ ] Unsubscribe path in place — required by CAN-SPAM and GDPR
- [ ] Deliverability spot-checked against Gmail and Outlook

## 8. Affiliate networks *(optional — links work, attribution does not)*

- [ ] Amazon Associates approved; `AMAZON_ASSOCIATE_TAG` set
- [ ] Impact / CJ / ShareASale / Rakuten credentials set as applicable
- [ ] Product `affiliateUrl` values updated to tagged deep links
- [ ] A live click verified as attributed in the network dashboard
- [ ] `/api/click/[slug]` recording clicks — confirm counts rise in the admin dashboard
- [ ] **Required if monetising** — affiliate disclosure visible in the footer, on product pages and in the FAQ
- [ ] Each network's terms reviewed for required disclosure wording

## 9. Analytics *(optional)*

- [ ] Provider chosen and `NEXT_PUBLIC_ANALYTICS_ID` set
- [ ] Cookie consent banner reflects what actually loads
- [ ] Conversion event defined for affiliate click-through
- [ ] Real-time traffic confirmed after deploy

## 10. Search engines

- [ ] `https://<domain>/robots.txt` returns 200 and does not disallow the whole site
- [ ] `https://<domain>/sitemap.xml` returns 200 and lists product and blog URLs with the production host
- [ ] Google Search Console property created and verified (`GOOGLE_SITE_VERIFICATION` or DNS)
- [ ] Sitemap submitted in Search Console
- [ ] Bing Webmaster Tools verified and sitemap submitted (or imported from Google)
- [ ] Rich Results Test passes for a product page and a blog post
- [ ] Canonical tags render the production origin, not `localhost`
- [ ] Open Graph preview checked in the Facebook Sharing Debugger and X Card Validator

## 11. Lighthouse and Core Web Vitals

Run against the **production** URL, mobile preset, in an incognito window.

- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 95
- [ ] SEO ≥ 95
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Re-run on `/`, `/products` and a product detail page
- [ ] Field data monitored in Search Console after two weeks of traffic

## 12. Post-deployment smoke tests

Run on the live domain, in a clean browser profile.

**Rendering**
- [ ] Homepage loads with hero, rails and footer
- [ ] `/products` loads; filters, sorting and infinite scroll work
- [ ] A product page loads with gallery, buy box and price chart
- [ ] `/blog` and one post load
- [ ] A 404 URL renders the styled not-found page

**Fresh-visitor paths** *(clean profile, no cookies — this class of bug was fixed in RC1)*
- [ ] `/cart` opened directly renders the empty state, not an error
- [ ] `/wishlist` opened directly renders the empty state
- [ ] `/compare` opened directly renders the empty state

**Interaction**
- [ ] Add to cart, then quantity change and remove
- [ ] Wishlist toggle persists across reload
- [ ] Compare two products side by side
- [ ] Search returns results; suggestions appear while typing
- [ ] AI assistant opens and answers a gift question
- [ ] Newsletter signup shows a success message; a repeat submission is rate limited
- [ ] Contact form submits and appears in the admin dashboard
- [ ] Affiliate button opens the retailer and the click is recorded

**Accounts**
- [ ] Sign-up creates an account and signs in
- [ ] Sign-out clears the session
- [ ] `/admin` redirects anonymous visitors to `/login`
- [ ] An admin user reaches the dashboard and sees live figures

**Cross-cutting**
- [ ] Dark and light themes both render correctly and persist across reload
- [ ] Layouts hold at 320px, 768px and 1440px with no horizontal scroll
- [ ] Keyboard-only pass through the homepage shows a visible focus ring at every stop
- [ ] Browser console is free of errors on every page visited
- [ ] `/api/health` returns `{"ok":true}`

## 13. Operations

- [ ] Error monitoring wired up (Sentry or equivalent)
- [ ] Uptime check against `/api/health`
- [ ] Log retention and alerting configured
- [ ] Rollback procedure understood — Vercel instant rollback or a pinned deployment
- [ ] Owner assigned for the first 48 hours after launch
