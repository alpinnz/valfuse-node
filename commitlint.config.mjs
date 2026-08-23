/**
 * Commit message rules — enforced by husky + @commitlint/cli.
 *
 * Follows the Conventional Commits specification extended with scopes that
 * actually exist in this monorepo (one package per scope), so history stays
 * consistent across every workspace (core/form/localization/react/vue/examples).
 *
 * Reference:
 *   https://www.conventionalcommits.org/en/v1.0.0/
 *   https://commitlint.js.org/reference/rules.html
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // --- Structure ------------------------------------------------------
    // Header must stay within one readable line.
    "header-max-length": [2, "always", 72],
    // Body lines (when present) should not overflow.
    "body-max-line-length": [2, "always", 100],
    "footer-max-line-length": [2, "always", 100],

    // --- Type -----------------------------------------------------------
    // The allowed type vocabulary — lowercase only.
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],

    // --- Scope ----------------------------------------------------------
    // Scopes must belong to this repository. Empty scope is allowed
    // (a top-level change), but when a scope is used it must be one of these.
    "scope-enum": [
      2,
      "always",
      [
        "core",
        "form",
        "localization",
        "react",
        "vue",
        "examples",
        "react-example",
        "vue-example",
        // Adapters were historically a separate package; kept for
        // backwards-compatible history and references.
        "adapter",
        "repository",
        "release",
        "changelog",
        "eslint",
        "prettier",
        "husky",
        "commitlint",
        "ci",
        "deps",
        "docs",
        "adr",
        "tools",
        "package",
        "cli",
      ],
    ],

    // --- Subject --------------------------------------------------------
    // Subject must not start with a capital letter or end with a period.
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],

    // --- Body / footer --------------------------------------------------
    "body-leading-blank": [2, "always"],
    "body-empty": [0],
    "footer-leading-blank": [2, "always"],
    "footer-empty": [0],

    // --- Custom ---------------------------------------------------------
    // Require a scope only for commits that touch a package's public API.
    // (Kept permissive: scope is optional, but validated when provided.)
    "scope-empty": [0],
  },
};
