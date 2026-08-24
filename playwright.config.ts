import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

/**
 * End-to-end, SEO and accessibility suites.
 *
 * By default Playwright builds and starts the app itself. Point the run at an
 * already-running instance (or a deployed staging URL) with BASE_URL, and skip
 * the managed server with PLAYWRIGHT_NO_SERVER=1.
 *
 * CHROMIUM_PATH lets a sandboxed or air-gapped CI use a preinstalled browser
 * instead of Playwright's downloaded one.
 */
const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const useManagedServer = !process.env.PLAYWRIGHT_NO_SERVER && !process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...(process.env.CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } } : {}),
  },

  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],

  ...(useManagedServer
    ? {
        webServer: {
          command: "npm run build && npm run start",
          url: "http://127.0.0.1:3000/api/health",
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      }
    : {}),
});
