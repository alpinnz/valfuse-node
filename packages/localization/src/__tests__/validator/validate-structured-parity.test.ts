import { describe, it, expect } from "vitest";
import { validateStructuredParity } from "../../validator/validate-structured-parity";
import { DIAGNOSTIC_CODES } from "../../diagnostics/codes";
import { makeMessage, makeProject, structured } from "./_fixtures";

describe("validateStructuredParity", () => {
  it("returns no diagnostics when structured shapes match across locales", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "items",
            sourceKey: "items",
            structured: structured("plural", { one: "1", other: "{count}" }),
          }),
        ],
      },
      {
        module: "common",
        locale: "id",
        messages: [
          makeMessage({
            key: "items",
            sourceKey: "items",
            locale: "id",
            structured: structured("plural", { one: "1", other: "{count}" }),
          }),
        ],
      },
    ]);
    expect(validateStructuredParity(project)).toEqual([]);
  });

  it("detects structured-type mismatch (plural in en, gender in id)", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "items",
            sourceKey: "items",
            structured: structured("plural", { one: "1", other: "{count}" }),
          }),
        ],
      },
      {
        module: "common",
        locale: "id",
        messages: [
          makeMessage({
            key: "items",
            sourceKey: "items",
            locale: "id",
            structured: structured("gender", { male: "He", female: "She" }),
          }),
        ],
      },
    ]);
    const diagnostics = validateStructuredParity(project);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe(DIAGNOSTIC_CODES.structuredParity);
  });

  it("detects structured-variants-set mismatch (different keys)", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "items",
            sourceKey: "items",
            structured: structured("plural", { one: "1", other: "{count}" }),
          }),
        ],
      },
      {
        module: "common",
        locale: "id",
        messages: [
          makeMessage({
            key: "items",
            sourceKey: "items",
            locale: "id",
            // Missing 'one', has 'zero' instead
            structured: structured("plural", { zero: "0", other: "{count}" }),
          }),
        ],
      },
    ]);
    const diagnostics = validateStructuredParity(project);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].code).toBe(DIAGNOSTIC_CODES.structuredParity);
  });

  it("treats variant order as insignificant (sorts keys before comparison)", () => {
    // Signature is `${type}:${sortedKeys.join(",")}` — so {one, other} and
    // {other, one} produce the same signature.
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "items",
            sourceKey: "items",
            structured: structured("plural", { one: "1", other: "{count}" }),
          }),
        ],
      },
      {
        module: "common",
        locale: "id",
        messages: [
          makeMessage({
            key: "items",
            sourceKey: "items",
            locale: "id",
            // Same keys, different insertion order
            structured: structured("plural", { other: "{count}", one: "1" }),
          }),
        ],
      },
    ]);
    expect(validateStructuredParity(project)).toEqual([]);
  });

  it("detects when one locale has structured and another has none", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "items",
            sourceKey: "items",
            structured: structured("plural", { one: "1", other: "{count}" }),
          }),
        ],
      },
      {
        module: "common",
        locale: "id",
        messages: [
          makeMessage({ key: "items", sourceKey: "items", locale: "id" }), // no structured
        ],
      },
    ]);
    const diagnostics = validateStructuredParity(project);
    expect(diagnostics).toHaveLength(1);
  });

  it("returns no diagnostics for messages with no structured variants in any locale", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [makeMessage({ key: "greeting", sourceKey: "greeting" })],
      },
      {
        module: "common",
        locale: "id",
        messages: [makeMessage({ key: "greeting", sourceKey: "greeting", locale: "id" })],
      },
    ]);
    expect(validateStructuredParity(project)).toEqual([]);
  });

  it("returns no diagnostics for an empty project", () => {
    expect(validateStructuredParity(makeProject([]))).toEqual([]);
  });
});
