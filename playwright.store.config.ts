import { defineConfig, devices } from "@playwright/test";

// Run against the separately started, concept-only local preview.
export default defineConfig({
  testDir: "./tests/store",
  workers: 1,
  timeout: 60_000,
  fullyParallel: false,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3041", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], defaultBrowserType: "chromium" },
    },
  ],
});
