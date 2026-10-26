import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig(base, {
  workers: 1,
  outputDir: "test-results/delivery",
  reporter: [["list"], ["json", { outputFile: "test-results/delivery-report.json" }]],
  use: { baseURL: "http://127.0.0.1:3100" },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", testMatch: "delivery.spec.ts", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", testMatch: "delivery.spec.ts", use: { ...devices["Desktop Safari"] } },
  ],
});
