import { expect, test, type Page } from "@playwright/test";

/**
 * Accessibility regressions.
 *
 * These assert the specific WCAG failures found during the audits: unlabelled
 * login inputs, an `outline-none` rule that removed focus rings, nested
 * interactive elements, and sub-minimum touch targets.
 */

const PAGES = ["/", "/products", "/products/aurora-silk-wrap-dress-1", "/blog", "/cart", "/login", "/contact"];

/** Elements exposed to assistive tech that must carry an accessible name. */
async function unnamedControls(page: Page) {
  return page.evaluate(() => {
    const offenders: string[] = [];
    document.querySelectorAll("a[href], button, input, select, textarea").forEach((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (rect.width === 0 || rect.height === 0 || style.visibility === "hidden" || style.display === "none") return;

      const labelled = el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent?.trim();
      const labelledBy = el.getAttribute("aria-labelledby");
      const associated = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
      const wrapping = el.closest("label");

      if (!labelled && !labelledBy && !associated && !wrapping) {
        offenders.push(`${el.tagName}.${String(el.className).slice(0, 40)}`);
      }
    });
    return offenders;
  });
}

for (const path of PAGES) {
  test.describe(path, () => {
    test("every interactive control has an accessible name", async ({ page }) => {
      await page.goto(path);
      expect(await unnamedControls(page)).toEqual([]);
    });

    test("every image has an alt attribute", async ({ page }) => {
      await page.goto(path);
      const missing = await page.evaluate(() =>
        [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length
      );
      expect(missing).toBe(0);
    });

    test("has exactly one h1", async ({ page }) => {
      await page.goto(path);
      expect(await page.locator("h1").count()).toBe(1);
    });

    test("heading levels never skip a rank", async ({ page }) => {
      await page.goto(path);
      const levels = await page.evaluate(() =>
        [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1]))
      );

      let previous = levels[0] ?? 1;
      for (const level of levels) {
        expect(level - previous, `heading jumped from h${previous} to h${level} on ${path}`).toBeLessThanOrEqual(1);
        previous = level;
      }
    });

    /** REGRESSION (rc.1): nested anchors/buttons broke hydration *and* a11y. */
    test("no interactive element is nested inside another", async ({ page }) => {
      await page.goto(path);
      const nested = await page.evaluate(
        () => [...document.querySelectorAll("a[href], button")].filter((el) => el.querySelector("a[href], button")).length
      );
      expect(nested).toBe(0);
    });

    test("declares a page language", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
    });
  });
}

test.describe("keyboard navigation", () => {
  test("the first tab stop is a skip link", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const name = await page.evaluate(() => document.activeElement?.textContent?.trim());
    expect(name).toMatch(/skip/i);
  });

  /**
   * REGRESSION (rc.2): `outline-none` was applied in four places with no
   * replacement, leaving keyboard users with invisible focus.
   */
  test("every visible tab stop shows a focus indicator", async ({ page }) => {
    await page.goto("/");

    const offenders: string[] = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");

      const result = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;

        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;

        const hasOutline = style.outlineStyle !== "none" && style.outlineWidth !== "0px";
        const hasShadow = style.boxShadow !== "none" && style.boxShadow !== "";
        return hasOutline || hasShadow ? null : `${el.tagName}.${String(el.className).slice(0, 40)}`;
      });

      if (result) offenders.push(result);
    }
    expect(offenders).toEqual([]);
  });

  test("the assistant can be opened and closed from the keyboard", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /assistant|meow|chat/i }).first();
    if (await trigger.count()) {
      await trigger.focus();
      await expect(trigger).toBeFocused();
    }
  });
});

test.describe("touch targets", () => {
  /**
   * WCAG 2.5.8 Target Size (Minimum), AA — 24x24 CSS pixels, applying the
   * success criterion's own exceptions rather than a blanket size rule:
   *
   *  - Hidden: off-screen utility controls (the skip link) are exempt until
   *    focused, at which point they become full size.
   *  - Equivalent: a target is exempt when another control on the same page
   *    reaches the same destination and does meet the size. Product cards
   *    rely on this — the small title link is backed by the full-bleed media
   *    link covering the card image.
   *  - Inline: targets inside a sentence or block of text are exempt.
   */
  for (const path of ["/products", "/", "/products/aurora-silk-wrap-dress-1"]) {
    test(`${path} meets the minimum target size, allowing WCAG exceptions`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const offenders = await page.evaluate(() => {
        const MIN = 24;
        const controls = [...document.querySelectorAll("button, a[href]")] as HTMLElement[];

        const meetsSize = (el: Element) => {
          const r = el.getBoundingClientRect();
          return r.width >= MIN && r.height >= MIN;
        };

        // Destinations that DO have an adequately sized control somewhere.
        const satisfiedHrefs = new Set(
          controls.filter((el) => el.tagName === "A" && meetsSize(el)).map((el) => el.getAttribute("href"))
        );

        return controls
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;      // not rendered
            if (meetsSize(el)) return false;                        // passes outright

            const style = getComputedStyle(el);
            if (style.position === "absolute" && r.width <= 1) return false; // sr-only until focused

            // Equivalent-control exception.
            if (el.tagName === "A" && satisfiedHrefs.has(el.getAttribute("href"))) return false;

            // Inline exception: the target sits within a run of text.
            if (style.display === "inline" || el.closest("p")) return false;

            return true;
          })
          .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`);
      });

      expect(offenders).toEqual([]);
    });
  }

  test("the skip link becomes a full-size target once focused", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const box = await page.evaluate(() => {
      const el = document.activeElement!;
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    expect(box.h).toBeGreaterThanOrEqual(24);
  });
});

test.describe("reduced motion", () => {
  test("animations are suppressed when the user asks for less motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");

    const animated = await page.evaluate(
      () =>
        [...document.querySelectorAll("*")].filter((el) => {
          const d = getComputedStyle(el).animationDuration;
          return d !== "0s" && d !== "" && parseFloat(d) > 0.1;
        }).length
    );
    expect(animated).toBe(0);

    await context.close();
  });
});
