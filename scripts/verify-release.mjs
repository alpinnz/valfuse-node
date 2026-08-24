#!/usr/bin/env node
/**
 * release:verify — dev-side guard for publishing a single monorepo package.
 *
 * Validates that a proposed release tag matches the package version before
 * the tag is pushed to remote. Mirrors the `Verify version matches tag` step
 * in `.github/workflows/publish.yml` so mistakes are caught locally, cheaply.
 *
 * Usage:
 *   npm run release:verify -- v0.4.0-react
 *
 * Exit codes:
 *   0  OK — tag targets a known package and matches its package.json version.
 *   1  Validation failed (printable reason).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PKGS = {
  core: "core",
  form: "form",
  localization: "localization",
  react: "react",
  vue: "vue",
};

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(`✖ release:verify — ${message}`);
  process.exit(1);
}

function main() {
  const tag = process.argv[2];
  if (!tag) fail("missing tag argument; usage: npm run release:verify -- v<semver>-<pkg>");

  // Expected: v<semver>-<pkg>, e.g. v0.4.0-react
  const match = /^v([0-9]+\.[0-9]+\.[0-9]+)-([a-z0-9-]+)$/.exec(tag);
  if (!match) {
    fail(
      `"${tag}" is not in the expected format v<semver>-<pkg> ` +
        "(e.g. v0.4.0-react). Bare tags like v0.3.0 are intentionally rejected."
    );
  }

  const [, tagVersion, pkg] = match;

  const pkgPath = PKGS[pkg];
  if (!pkgPath) {
    fail(`"${pkg}" is not a publishable package. Allowed: ${Object.keys(PKGS).join(", ")}.`);
  }

  const manifestPath = join(ROOT, "packages", pkgPath, "package.json");
  if (!existsSync(manifestPath)) {
    fail(`expected manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.private === true) {
    fail(`@valfuse-node/${pkg} is marked private and cannot be published.`);
  }

  const pkgName = manifest.name;
  const pkgVersion = manifest.version;

  if (tagVersion !== pkgVersion) {
    fail(
      `tag ${tagVersion} does not match ${pkgName} version ${pkgVersion}. ` +
        "Bump packages/<pkg>/package.json first, then create the tag."
    );
  }

  console.log(`✓ release:verify — ${pkgName}@${pkgVersion} matches tag ${tag}. Ready to publish.`);
}

main();
