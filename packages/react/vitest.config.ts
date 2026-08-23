import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/__tests__/**/*.test.tsx", "src/__tests__/**/*.test.ts"],
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/__tests__/**"],
      thresholds: {
        lines: 55,
        functions: 40,
        branches: 40,
        statements: 55,
      },
    },
  },
});
