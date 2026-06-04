import { describe, it, expect } from "vitest";
import { validatePathConsistency } from "../../validator/validate-path-consistency";
import { DIAGNOSTIC_CODES } from "../../diagnostics/codes";
import { makeMessage, makeProject } from "./_fixtures";

describe("validatePathConsistency", () => {
  it("returns no diagnostics when path metadata is absent", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [makeMessage({ key: "greeting", sourceKey: "greeting" })],
      },
    ]);
    expect(validatePathConsistency(project)).toEqual([]);
  });

  it("returns no diagnostics when path metadata matches the file locale and module", () => {
    const project = makeProject([
      {
        module: "auth",
        locale: "en",
        messages: [
          makeMessage({
            key: "login",
            sourceKey: "login",
            module: "auth",
            locale: "en",
            metadata: {
              custom: { locale: "en", module: "auth" },
            },
          }),
        ],
      },
    ]);
    expect(validatePathConsistency(project)).toEqual([]);
  });

  it("detects a locale mismatch between metadata and the file", () => {
    const project = makeProject([
      {
        module: "auth",
        locale: "en",
        messages: [
          makeMessage({
            key: "login",
            sourceKey: "login",
            module: "auth",
            locale: "en",
            metadata: { custom: { locale: "id" } }, // claims id, file is en
          }),
        ],
      },
    ]);
    const diagnostics = validatePathConsistency(project);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe(DIAGNOSTIC_CODES.pathMetadataLocaleMismatch);
    expect(diagnostics[0].message).toMatch(/en/);
    expect(diagnostics[0].message).toMatch(/id/);
  });

  it("detects a module mismatch between metadata and the file", () => {
    const project = makeProject([
      {
        module: "auth",
        locale: "en",
        messages: [
          makeMessage({
            key: "login",
            sourceKey: "login",
            module: "auth",
            locale: "en",
            metadata: { custom: { module: "billing" } },
          }),
        ],
      },
    ]);
    const diagnostics = validatePathConsistency(project);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe(DIAGNOSTIC_CODES.pathMetadataModuleMismatch);
  });

  it("reports both mismatches independently when both fields disagree", () => {
    const project = makeProject([
      {
        module: "auth",
        locale: "en",
        messages: [
          makeMessage({
            key: "login",
            sourceKey: "login",
            module: "auth",
            locale: "en",
            metadata: { custom: { locale: "id", module: "billing" } },
          }),
        ],
      },
    ]);
    const diagnostics = validatePathConsistency(project);
    expect(diagnostics).toHaveLength(2);
    const codes = diagnostics.map((d) => d.code).sort();
    expect(codes).toEqual([
      DIAGNOSTIC_CODES.pathMetadataLocaleMismatch,
      DIAGNOSTIC_CODES.pathMetadataModuleMismatch,
    ]);
  });

  it("ignores non-string custom metadata values (only checks when value is a string)", () => {
    const project = makeProject([
      {
        module: "auth",
        locale: "en",
        messages: [
          makeMessage({
            key: "login",
            sourceKey: "login",
            module: "auth",
            locale: "en",
            metadata: { custom: { locale: 42, module: null } }, // wrong types
          }),
        ],
      },
    ]);
    // The validator uses `typeof metadataLocale === "string"` to gate the
    // check, so non-string values are silently ignored.
    expect(validatePathConsistency(project)).toEqual([]);
  });

  it("returns no diagnostics for an empty project", () => {
    expect(validatePathConsistency(makeProject([]))).toEqual([]);
  });
});
