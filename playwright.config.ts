import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke tests. Runs against a production build via `next start`.
 *
 * NOTE: uses the locally-installed Edge/Chrome (channel) instead of downloading
 * Playwright's own Chromium — run `npx playwright install chromium` first if you
 * prefer the bundled browser.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "msedge" },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});