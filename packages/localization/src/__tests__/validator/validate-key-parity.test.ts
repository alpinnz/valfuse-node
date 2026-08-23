import { describe, it, expect } from "vitest";
import { validateKeyParity } from "../../validator/validate-key-parity";
import { DIAGNOSTIC_CODES } from "../../diagnostics/codes";
import { makeMessage, makeProject, parityBaselineProject } from "./_fixtures";

describe("validateKeyParity", () => {
  it("returns no diagnostics for a project with full key parity", () => {
    const project = parityBaselineProject();
    expect(validateKeyParity(project)).toEqual([]);
  });

  it("detects a missing key in one locale", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({ key: "greeting", sourceKey: "greeting" }),
          makeMessage({ key: "farewell", sourceKey: "farewell" }),
        ],
      },
      {
        module: "common",
        locale: "id",
        messages: [
          makeMessage({ key: "greeting", sourceKey: "greeting", locale: "id" }),
          // farewell is missing in id
        ],
      },
    ]);
    const diagnostics = validateKeyParity(project);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      code: DIAGNOSTIC_CODES.keyParity,
      severity: "error",
      key: "farewell",
    });
    expect(diagnostics[0].message).toMatch(/farewell/);
    expect(diagnostics[0].message).toMatch(/id/);
  });

  it("symmetrically reports the same key missing for both locales", () => {
    // If 'farewell' exists in en but not id, AND in id but not en,
    // each locale's entry should get a diagnostic.
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({ key: "greeting", sourceKey: "greeting" }),
          makeMessage({ key: "only_in_en", sourceKey: "only_in_en" }),
        ],
      },
      {
        module: "common",
        locale: "id",
        messages: [
          makeMessage({ key: "greeting", sourceKey: "greeting", locale: "id" }),
          makeMessage({ key: "only_in_id", sourceKey: "only_in_id", locale: "id" }),
        ],
      },
    ]);
    const diagnostics = validateKeyParity(project);
    // 2 diagnostics: each locale is missing the other's exclusive key
    expect(diagnostics).toHaveLength(2);
    const keys = diagnostics.map((d) => d.key).sort();
    expect(keys).toEqual(["only_in_en", "only_in_id"]);
  });

  it("scopes parity per module (same key in different modules does not cross-pollute)", () => {
    const project = makeProject([
      {
        module: "auth",
        locale: "en",
        messages: [makeMessage({ key: "login", sourceKey: "login", module: "auth" })],
      },
      {
        module: "auth",
        locale: "id",
        messages: [makeMessage({ key: "login", sourceKey: "login", module: "auth", locale: "id" })],
      },
      {
        module: "billing",
        locale: "en",
        messages: [makeMessage({ key: "pay", sourceKey: "pay", module: "billing" })],
      },
      {
        module: "billing",
        locale: "id",
        messages: [], // no messages — should report "pay" missing
      },
    ]);
    const diagnostics = validateKeyParity(project);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].key).toBe("pay");
  });

  it("returns no diagnostics for an empty project", () => {
    expect(validateKeyParity(makeProject([]))).toEqual([]);
  });
});
