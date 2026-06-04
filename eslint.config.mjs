import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      // Auto-generated localization runtime files — do not lint
      "**/src/assets/localizations/localization.ts",
      "**/src/assets/localizations/localization.types.ts",
    ],
  },
  {
    // Disallow console in library code — CLI files use eslint-disable-next-line
    // where console output is intentional and part of the user-facing interface.
    rules: {
      "no-console": "error",
    },
  },
  {
    // Test files legitimately need `any` to exercise untyped inputs and
    // edge cases (e.g. partial rule objects, unknown field names). The
    // strict no-explicit-any rule belongs in production code, not tests.
    files: ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);

