import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3100",
    viewport: { width: 1440, height: 1622 },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node tests/e2e/mock-api-server.mjs",
      url: "http://127.0.0.1:3200/health",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
      env: { NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:3200" },
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
