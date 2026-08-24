import { expect, test, type Page } from "@playwright/test";

/**
 * SEO regression suite.
 *
 * REGRESSION (rc.5) — CRITICAL: `openGraph.type: "product"` is rejected by
 * Next, and the resulting exception discarded the *entire* metadata object for
 * every product page. Pages rendered perfectly while shipping no title, no
 * description, no canonical and no social card. Nothing visible was wrong,
 * which is exactly why it survived four manual audits — so it is pinned here.
 */

/**
 * Next streams metadata for dynamically rendered routes, so a tag can land
 * fractionally after `page.goto` resolves — especially when several workers
 * share one server. Polling removes that race; without it these assertions are
 * flaky under parallelism, and a flaky suite is one people learn to ignore.
 */
async function content(page: Page, selector: string) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "attached", timeout: 10_000 }).catch(() => {});
  return locator.getAttribute("content");
}

async function attr(page: Page, selector: string, name: string) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "attached", timeout: 10_000 }).catch(() => {});
  return locator.getAttribute(name);
}

const PAGES = [
  { name: "home", path: "/" },
  { name: "catalogue", path: "/products" },
  { name: "product", path: "/products/aurora-silk-wrap-dress-1" },
  { name: "blog index", path: "/blog" },
  { name: "blog post", path: "/blog/how-we-pick-every-product-on-meowmeow" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
  { name: "affiliate disclosure", path: "/affiliate-disclosure" },
];

test.describe("metadata", () => {
  for (const { name, path } of PAGES) {
    test(`${name} has a non-empty title`, async ({ page }) => {
      await page.goto(path);
      await expect.poll(() => page.title().then((t) => t.trim().length), { timeout: 10_000 }).toBeGreaterThan(3);
    });

    test(`${name} has a meta description`, async ({ page }) => {
      await page.goto(path);
      const description = await content(page, 'meta[name="description"]');
      expect(description?.trim().length ?? 0, `${path} has no meta description`).toBeGreaterThan(20);
    });

    test(`${name} has a canonical URL`, async ({ page }) => {
      await page.goto(path);
      const canonical = await attr(page, 'link[rel="canonical"]', "href");
      expect(canonical, `${path} has no canonical link`).toBeTruthy();
      expect(canonical).toMatch(/^https?:\/\//);
    });

    test(`${name} has Open Graph title and URL`, async ({ page }) => {
      await page.goto(path);
      expect(await content(page, 'meta[property="og:title"]')).toBeTruthy();
      expect(await content(page, 'meta[property="og:url"]')).toMatch(/^https?:\/\//);
    });

    test(`${name} has a Twitter card`, async ({ page }) => {
      await page.goto(path);
      expect(await content(page, 'meta[name="twitter:card"]')).toBeTruthy();
    });
  }
});

test.describe("canonical correctness", () => {
  test("canonicals use the configured deployment origin, not a hardcoded domain", async ({ page, baseURL }) => {
    await page.goto("/products/aurora-silk-wrap-dress-1");
    const canonical = await attr(page, 'link[rel="canonical"]', "href");
    const expectedOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL ?? baseURL!).origin;
    expect(new URL(canonical!).origin).toBe(expectedOrigin);
  });

  test("the product canonical points at the product's own path", async ({ page }) => {
    await page.goto("/products/aurora-silk-wrap-dress-1");
    const canonical = await attr(page, 'link[rel="canonical"]', "href");
    expect(new URL(canonical!).pathname).toBe("/products/aurora-silk-wrap-dress-1");
  });

  /**
   * REGRESSION (rc.5): catalogue filter state lives in the query string, so
   * every combination was a separately indexable duplicate of the same page.
   */
  test("catalogue filter permutations collapse onto one canonical", async ({ page }) => {
    await page.goto("/products?category=jewelry&brand=Apex%20Fit&sort=price-asc&min=10&max=900");
    const canonical = await attr(page, 'link[rel="canonical"]', "href");
    const url = new URL(canonical!);

    expect(url.pathname).toBe("/products");
    expect(url.searchParams.get("category")).toBe("jewelry");
    expect(url.searchParams.has("sort")).toBe(false);
    expect(url.searchParams.has("brand")).toBe(false);
  });

  test("keyword search results are noindex, follow", async ({ page }) => {
    await page.goto("/products?q=silk");
    const robots = await content(page, 'meta[name="robots"]');
    expect(robots).toContain("noindex");
    expect(robots).toContain("follow");
  });
});

test.describe("structured data", () => {
  const jsonLd = (page: Page) =>
    page.locator('script[type="application/ld+json"]').allTextContents();

  test("home exposes valid Organization and WebSite schema", async ({ page }) => {
    await page.goto("/");
    const blocks = await jsonLd(page);
    expect(blocks.length).toBeGreaterThan(0);

    const parsed = blocks.map((b) => JSON.parse(b));
    const types = parsed.map((d) => d["@type"]);
    expect(types).toContain("Organization");
  });

  test("product page exposes valid Product and BreadcrumbList schema", async ({ page }) => {
    await page.goto("/products/aurora-silk-wrap-dress-1");
    const parsed = (await jsonLd(page)).map((b) => JSON.parse(b));
    const types = parsed.map((d) => d["@type"]);

    expect(types).toContain("Product");
    expect(types).toContain("BreadcrumbList");

    const product = parsed.find((d) => d["@type"] === "Product")!;
    expect(product.name).toBeTruthy();
    expect(product.offers?.price).toBeDefined();
  });

  test("every JSON-LD block parses as valid JSON", async ({ page }) => {
    for (const path of ["/", "/products/aurora-silk-wrap-dress-1", "/blog/how-we-pick-every-product-on-meowmeow"]) {
      await page.goto(path);
      for (const block of await jsonLd(page)) {
        expect(() => JSON.parse(block), `invalid JSON-LD on ${path}`).not.toThrow();
      }
    }
  });

  /**
   * REGRESSION (rc.3) — CRITICAL: JSON.stringify does not escape `<`, so a
   * review body containing `</script>` closed the tag early and everything
   * after it executed as HTML. Reviews are publicly submittable.
   */
  test("JSON-LD cannot break out of its script tag", async ({ page }) => {
    await page.goto("/products/aurora-silk-wrap-dress-1");
    const html = await page.content();

    const blocks = html.split('<script type="application/ld+json">').slice(1);
    for (const block of blocks) {
      const body = block.split("</script>")[0];
      expect(body).not.toContain("<");
      expect(body).not.toContain(">");
    }
  });
});

test.describe("crawler files", () => {
  test("robots.txt is served and points at the sitemap on this origin", async ({ request, baseURL }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);

    const body = await res.text();
    expect(body.toLowerCase()).toContain("sitemap:");

    const origin = new URL(process.env.NEXT_PUBLIC_APP_URL ?? baseURL!).origin;
    expect(body).toContain(origin);
  });

  test("robots.txt does not disallow the whole site", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).not.toMatch(/Disallow:\s*\/\s*$/m);
  });

  test("sitemap.xml is valid XML listing product and blog URLs", async ({ request, baseURL }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);

    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/products/");
    expect(body).toContain("/blog/");

    const origin = new URL(process.env.NEXT_PUBLIC_APP_URL ?? baseURL!).origin;
    expect(body).toContain(origin);
  });

  test("the web manifest is served", async ({ request }) => {
    expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
  });
});
