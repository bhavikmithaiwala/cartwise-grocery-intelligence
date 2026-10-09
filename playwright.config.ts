import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:5173", headless: true },
  timeout: 120000,
  reporter: "list",
  webServer: {
    command: "npm run db:migrate && npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { DATABASE_URL: "file:./e2e.db", APP_ORIGIN: "http://127.0.0.1:5173" },
  },
});
