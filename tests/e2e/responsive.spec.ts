import { expect, test } from "@playwright/test";

/**
 * REGRESSION (rc.1/rc.2): flexbox `min-width: auto` crushed the header menu
 * button and pushed the action cluster off-screen; the catalogue sort select
 * forced its widest option as a minimum width at 320px.
 */

const WIDTHS = [320, 375, 390, 768, 1024, 1280, 1440];
const PAGES = ["/", "/products", "/products/aurora-silk-wrap-dress-1", "/blog", "/cart", "/compare"];

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    for (const path of PAGES) {
      test(`${path} does not overflow horizontally`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await page.waitForLoadState("networkidle");

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${path} overflows by ${overflow}px at ${width}px`).toBeLessThanOrEqual(1);
      });
    }
  });
}

test.describe("mobile navigation", () => {
  test("the bottom navigation is reachable on a phone viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("nav").last()).toBeVisible();
  });
});
