import { describe, it, expect } from "vitest";
import { validatePlaceholderParity } from "../../validator/validate-placeholder-parity";
import { DIAGNOSTIC_CODES } from "../../diagnostics/codes";
import { makeMessage, makeProject, parityBaselineProject } from "./_fixtures";

describe("validatePlaceholderParity", () => {
  it("returns no diagnostics when all locales have matching placeholders", () => {
    expect(validatePlaceholderParity(parityBaselineProject())).toEqual([]);
  });

  it("detects a placeholder added in one locale but missing in another", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "greeting",
            sourceKey: "greeting",
            value: "Hello, {name}",
            placeholders: ["name"],
          }),
        ],
      },
      {
        module: "common",
        locale: "id",
        messages: [
          makeMessage({
            key: "greeting",
            sourceKey: "greeting",
            locale: "id",
            value: "Halo, {name}, {title}",
            placeholders: ["name", "title"], // extra placeholder
          }),
        ],
      },
    ]);
    const diagnostics = validatePlaceholderParity(project);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      code: DIAGNOSTIC_CODES.placeholderParity,
      severity: "error",
      key: "greeting",
    });
    expect(diagnostics[0].message).toMatch(/greeting/);
  });

  it("treats placeholder order as significant (sorted comparison via JSON.stringify)", () => {
    // The validator uses JSON.stringify for comparison. If both locales have
    // ["name", "title"], they match. If one has ["title", "name"], they don't
    // (even though semantically equivalent). Documenting the actual contract.
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({
            key: "greeting",
            sourceKey: "greeting",
            placeholders: ["name", "title"],
          }),
        ],
      },
      {
        module: "common",
        locale: "id",
        messages: [
          makeMessage({
            key: "greeting",
            sourceKey: "greeting",
            locale: "id",
            placeholders: ["title", "name"], // different order
          }),
        ],
      },
    ]);
    const diagnostics = validatePlaceholderParity(project);
    expect(diagnostics).toHaveLength(1);
  });

  it("does not flag messages that have no placeholders in any locale", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [makeMessage({ key: "static", sourceKey: "static" })],
      },
      {
        module: "common",
        locale: "id",
        messages: [
          makeMessage({ key: "static", sourceKey: "static", locale: "id" }),
        ],
      },
    ]);
    expect(validatePlaceholderParity(project)).toEqual([]);
  });

  it("returns no diagnostics for an empty project", () => {
    expect(validatePlaceholderParity(makeProject([]))).toEqual([]);
  });
});
