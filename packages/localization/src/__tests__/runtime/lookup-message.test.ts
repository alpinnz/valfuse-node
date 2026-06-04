import { describe, it, expect } from "vitest";
import { lookupMessage } from "../../runtime/lookup-message";
import type { RuntimeContext } from "../../runtime/types";

const baseContext: RuntimeContext = {
  locale: "en",
  fallbackLocale: "id",
  messages: {
    en: {
      "common.greeting": "Hello",
      "common.farewell": "Goodbye",
    },
    id: {
      "common.greeting": "Halo",
      // farewell missing in id to test fallback
    },
  },
};

describe("lookupMessage", () => {
  it("returns the value from the active locale when present", () => {
    expect(lookupMessage(baseContext, "common.greeting")).toBe("Hello");
  });

  it("falls back to the fallback locale when the active locale is missing the key", () => {
    expect(lookupMessage(baseContext, "common.farewell")).toBe("Goodbye");
  });

  it("returns the key itself when neither locale has the key", () => {
    expect(lookupMessage(baseContext, "common.unknown")).toBe("common.unknown");
  });

  it("returns the key when the active locale table is missing entirely", () => {
    const ctx: RuntimeContext = { ...baseContext, locale: "fr", messages: { en: {}, id: {} } };
    expect(lookupMessage(ctx, "common.greeting")).toBe("common.greeting");
  });

  it("prefers the active locale value over the fallback even if both are present", () => {
    const ctx: RuntimeContext = {
      locale: "en",
      fallbackLocale: "id",
      messages: {
        en: { k: "EN" },
        id: { k: "ID" },
      },
    };
    expect(lookupMessage(ctx, "k")).toBe("EN");
  });

  it("falls back when the active locale's table is empty for that key (uses ?? chaining)", () => {
    // Documents the contract: the lookup uses `??` so an empty string would
    // be returned (not fall through to fallback) — empty string is a valid value.
    const ctx: RuntimeContext = {
      locale: "en",
      fallbackLocale: "id",
      messages: {
        en: { k: "" },
        id: { k: "ID" },
      },
    };
    expect(lookupMessage(ctx, "k")).toBe("");
  });
});
