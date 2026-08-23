import { describe, it, expect } from "vitest";
import { buildCoverageJson } from "../../coverage/build-coverage-json";
import { buildCoverageHtml } from "../../coverage/build-coverage-html";
import type { RuntimeManifest } from "../../types/manifest";

function makeManifest(overrides: Partial<RuntimeManifest> = {}): RuntimeManifest {
  return {
    base_locale: "en",
    fallback_locale: "en",
    locales: ["en", "id"],
    entries: [
      { key: "errors.timeout", placeholders: [] },
      { key: "greeting", placeholders: [] },
    ],
    messages: {
      en: { "errors.timeout": "Request timed out", greeting: "Hello" },
      id: { "errors.timeout": "Request timed out", greeting: "" },
    },
    ...overrides,
  };
}

describe("buildCoverageJson", () => {
  it("counts empty or absent message values as missing", () => {
    const coverage = buildCoverageJson(makeManifest());

    expect(coverage.totalKeys).toBe(2);

    const en = coverage.locales.find((l) => l.locale === "en");
    expect(en?.translated).toBe(2);
    expect(en?.missing).toBe(0);
    expect(en?.percent).toBe(100);

    const id = coverage.locales.find((l) => l.locale === "id");
    expect(id?.translated).toBe(1);
    expect(id?.missing).toBe(1);
    expect(id?.percent).toBe(50);

    expect(coverage.missingKeys.id).toEqual(["greeting"]);
  });

  it("returns 0 for a manifest with no keys", () => {
    const coverage = buildCoverageJson(
      makeManifest({ locales: ["en"], entries: [], messages: { en: {} } })
    );

    expect(coverage.totalKeys).toBe(0);
    expect(coverage.locales[0].percent).toBe(0);
    expect(coverage.overallPercent).toBe(0);
  });

  it("averages locale percentages for the overall value", () => {
    const coverage = buildCoverageJson(makeManifest());
    // en=100, id=50 -> 75
    expect(coverage.overallPercent).toBe(75);
  });
});

describe("buildCoverageHtml", () => {
  it("renders locale rows and the overall summary", () => {
    const html = buildCoverageHtml(buildCoverageJson(makeManifest()));

    expect(html).toContain("Localization Coverage");
    // Overall summary (en=100, id=50 -> average 75).
    expect(html).toContain("75");
    // Per-locale row labels render both locales.
    expect(html).toContain(">en<");
    expect(html).toContain(">id<");
  });

  it("escapes dynamic markup from locale names", () => {
    const manifest = makeManifest({ locales: ["<script>", "normal"] });
    const html = buildCoverageHtml(buildCoverageJson(manifest));

    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
