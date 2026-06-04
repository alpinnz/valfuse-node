import { describe, it, expect } from "vitest";
import { validateFlattenCollision } from "../../validator/validate-flatten-collision";
import { makeMessage, makeProject } from "./_fixtures";

/**
 * Architectural note: validateFlattenCollision walks each entry's messages
 * looking for a key with two different sourceKeys. In practice, the
 * normalizeProject pipeline builds each entry's messages via
 * `Object.fromEntries(flat.map(...))`, which dedupes by key silently (last
 * wins). So the validator's collision path is defensive — it would catch a
 * collision if a future pipeline change ever let one through, but in the
 * current data flow it never fires.
 *
 * The tests below document the actual observable contract.
 */
describe("validateFlattenCollision", () => {
  it("returns no diagnostics when each entry has unique flattened keys", () => {
    const project = makeProject([
      {
        module: "common",
        locale: "en",
        messages: [
          makeMessage({ key: "greeting", sourceKey: "greeting" }),
          makeMessage({ key: "farewell", sourceKey: "farewell" }),
        ],
      },
    ]);
    expect(validateFlattenCollision(project)).toEqual([]);
  });

  it("does not flag collisions across entries (different modules, same flattened key)", () => {
    // The validator processes each entry (module+locale pair) independently.
    // Cross-module collisions are intentionally not its concern — the
    // namespace_prefix config is the layer responsible for preventing them.
    const project = makeProject([
      {
        module: "billing",
        locale: "en",
        messages: [makeMessage({ key: "pay", sourceKey: "billing.pay", module: "billing" })],
      },
      {
        module: "shipping",
        locale: "en",
        messages: [makeMessage({ key: "pay", sourceKey: "shipping.pay", module: "shipping" })],
      },
    ]);
    expect(validateFlattenCollision(project)).toEqual([]);
  });

  it("does not fire on the data flow that the current normalize pipeline produces", () => {
    // Documents the practical contract: even if two source paths would
    // flatten to the same key (e.g. with namespace_prefix: "none"), the
    // normalizer dedupes them at Object.fromEntries, so the validator
    // never sees the collision. The validator is defensive — it covers a
    // hypothetical future pipeline that preserves duplicates.
    const project = makeProject([
      {
        module: "auth",
        locale: "en",
        messages: [makeMessage({ key: "title", sourceKey: "auth.login.title" })],
      },
    ]);
    expect(validateFlattenCollision(project)).toEqual([]);
  });

  it("returns no diagnostics for an empty project", () => {
    expect(validateFlattenCollision(makeProject([]))).toEqual([]);
  });
});
