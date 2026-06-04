import { describe, it, expect } from "vitest";
import { validateMetadataUsage } from "../../validator/validate-metadata-usage";
import { DIAGNOSTIC_CODES } from "../../diagnostics/codes";
import { makeMessage, makeProject } from "./_fixtures";

describe("validateMetadataUsage", () => {
  it("returns no diagnostics when @value is provided with metadata", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "greeting",
            sourceKey: "greeting",
            value: "Hello",
            metadata: { description: "a greeting" },
          }),
        ],
      },
    ]);
    expect(validateMetadataUsage(project)).toEqual([]);
  });

  it("returns no diagnostics for messages with no metadata at all", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [makeMessage({ key: "greeting", sourceKey: "greeting" })],
      },
    ]);
    expect(validateMetadataUsage(project)).toEqual([]);
  });

  it("detects metadata without @value (missing value)", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "greeting",
            sourceKey: "greeting",
            value: "", // empty value
            metadata: { description: "a greeting" },
          }),
        ],
      },
    ]);
    const diagnostics = validateMetadataUsage(project);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe(DIAGNOSTIC_CODES.valueRequired);
    expect(diagnostics[0].message).toMatch(/greeting/);
    expect(diagnostics[0].message).toMatch(/@value/);
  });

  it("does not flag structured nodes with empty value (structured provides the message)", () => {
    // A message with @plural/@gender/@context has a structured node, so the
    // empty value is OK — the runtime picks the variant.
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "items",
            sourceKey: "items",
            value: "",
            structured: { type: "plural", variants: { one: "1", other: "{count}" } },
          }),
        ],
      },
    ]);
    expect(validateMetadataUsage(project)).toEqual([]);
  });

  it("flags metadata-only entries (no value, no structured) — the orphan case", () => {
    // Even if structured is undefined and value is empty, but metadata exists,
    // this should be flagged.
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "orphan",
            sourceKey: "orphan",
            value: undefined,
            metadata: { description: "no value" },
          }),
        ],
      },
    ]);
    const diagnostics = validateMetadataUsage(project);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe(DIAGNOSTIC_CODES.valueRequired);
  });

  it("returns no diagnostics for an empty project", () => {
    expect(validateMetadataUsage(makeProject([]))).toEqual([]);
  });
});
