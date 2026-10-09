import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  test: {
    fileParallelism: false,
    projects: [
      {
        test: {
          name: "backend",
          include: ["backend/src/**/*.test.ts"],
          setupFiles: ["./backend/test/setup.ts"],
          env: { DATABASE_URL: "file:./test.db" },
        },
      },
      {
        plugins: [react()],
        test: {
          name: "frontend",
          include: ["frontend/src/**/*.test.tsx"],
          environment: "jsdom",
        },
      },
    ],
  },
});
