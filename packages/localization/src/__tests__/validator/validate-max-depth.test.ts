import { describe, it, expect } from "vitest";
import { validateMaxDepth } from "../../validator/validate-max-depth";
import { DIAGNOSTIC_CODES } from "../../diagnostics/codes";
import { makeMessage, makeProject } from "./_fixtures";

describe("validateMaxDepth", () => {
  it("returns no diagnostics when all keys are at or below the limit", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({ key: "a", sourceKey: "a" }), // depth 1
          makeMessage({ key: "a.b", sourceKey: "a.b" }), // depth 2
          makeMessage({ key: "a.b.c", sourceKey: "a.b.c" }), // depth 3
        ],
      },
    ]);
    expect(validateMaxDepth(project, 3)).toEqual([]);
  });

  it("returns no diagnostics when a key is exactly at the limit", () => {
    // depth 3 == maxDepth 3 → NOT flagged. Only strictly greater is flagged.
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [makeMessage({ key: "a.b.c", sourceKey: "a.b.c" })],
      },
    ]);
    expect(validateMaxDepth(project, 3)).toEqual([]);
  });

  it("flags a key that exceeds the maxDepth", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({ key: "a.b.c.d", sourceKey: "a.b.c.d" }), // depth 4
        ],
      },
    ]);
    const diagnostics = validateMaxDepth(project, 3);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      code: DIAGNOSTIC_CODES.maxDepthExceeded,
      severity: "error",
      key: "a.b.c.d",
    });
    expect(diagnostics[0].message).toMatch(/a\.b\.c\.d/);
    expect(diagnostics[0].message).toMatch(/3/);
  });

  it("uses sourceKey (not key) for depth calculation", () => {
    // If the key is short (e.g. flat-namespace mode) but the sourceKey is deep,
    // the validator uses sourceKey. This matters when namespace_prefix is "none"
    // and the source path is deep.
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          // key is short (depth 1) but sourceKey is deep (depth 5)
          makeMessage({ key: "greeting", sourceKey: "auth.pages.login.greeting" }),
        ],
      },
    ]);
    const diagnostics = validateMaxDepth(project, 3);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].key).toBe("greeting");
  });

  it("flags multiple offenders in a single entry", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({ key: "a.b.c.d", sourceKey: "a.b.c.d" }),
          makeMessage({ key: "x.y.z.w", sourceKey: "x.y.z.w" }),
          makeMessage({ key: "ok", sourceKey: "ok" }), // depth 1, fine
        ],
      },
    ]);
    expect(validateMaxDepth(project, 3)).toHaveLength(2);
  });

  it("respects maxDepth=0 (any key with at least one segment is too deep)", () => {
    // Edge case: maxDepth=0 → depth 1 (one segment) is already > 0, so
    // every non-empty key is flagged. This is an unusual config but the
    // validator's strict `>` check should be predictable.
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({ key: "a", sourceKey: "a" }), // depth 1 > 0
          makeMessage({ key: "a.b", sourceKey: "a.b" }), // depth 2 > 0
        ],
      },
    ]);
    const diagnostics = validateMaxDepth(project, 0);
    expect(diagnostics).toHaveLength(2);
  });

  it("respects maxDepth=1 (depth-1 keys are fine, depth-2+ keys flagged)", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({ key: "a", sourceKey: "a" }), // depth 1, OK
          makeMessage({ key: "a.b", sourceKey: "a.b" }), // depth 2, flagged
        ],
      },
    ]);
    const diagnostics = validateMaxDepth(project, 1);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].key).toBe("a.b");
  });

  it("returns no diagnostics for an empty project", () => {
    expect(validateMaxDepth(makeProject([]), 3)).toEqual([]);
  });
});
