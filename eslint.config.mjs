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
  }
);

