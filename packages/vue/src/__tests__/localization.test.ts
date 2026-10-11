import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import type { RuntimeManifest } from "@valfuse-node/localization";
import {
  LocalizationProvider,
  useLocalization,
  useLocalizationTree,
} from "../localization/localization";
import {
  composeStorage,
  cookieStrategy,
  localStorageStrategy,
  memoryStrategy,
  sessionStorageStrategy,
} from "../localization/storage";

const manifest: RuntimeManifest = {
  base_locale: "en",
  fallback_locale: "en",
  locales: ["en", "id"],
  entries: [
    { key: "common.welcome", placeholders: ["name"] },
    { key: "common.item_count", placeholders: [] },
    { key: "common.gender_message", placeholders: ["name"] },
    { key: "common.context_message", placeholders: ["name"] },
    { key: "common.alpha", placeholders: [] },
    { key: "common.fallback_only", placeholders: [] },
    { key: "common.zebra", placeholders: [] },
  ],
  messages: {
    en: {
      "common.alpha": "Alpha",
      "common.context_message": '{"formal":"Good day, {name}","casual":"Hi, {name}"}',
      "common.fallback_only": "Fallback translation",
      "common.gender_message":
        '{"male":"He likes {name}","female":"She likes {name}","other":"They like {name}"}',
      "common.welcome": "Hello, {name}!",
      "common.item_count": '{"one":"{count} item","other":"{count} items"}',
      "common.zebra": "Zebra",
    },
    id: {
      "common.alpha": "Alfa",
      "common.context_message": '{"formal":"Selamat siang, {name}","casual":"Hai, {name}"}',
      "common.gender_message":
        '{"male":"Dia suka {name}","female":"Dia suka {name}","other":"Mereka suka {name}"}',
      "common.welcome": "Halo, {name}!",
      "common.item_count": '{"one":"{count} barang","other":"{count} barang"}',
      "common.zebra": "Zebra ID",
    },
  },
};

describe("Vue localization adapter", () => {
  it("composes storage strategies with first-hit reads and fan-out writes", () => {
    const fallback = memoryStrategy({ initialLocale: "en" });
    const preferred = memoryStrategy();
    const storage = composeStorage(preferred, fallback);

    expect(storage.get()).toBe("en");
    storage.set("id");
    expect(preferred.get()).toBe("id");
    expect(fallback.get()).toBe("id");
    storage.remove?.();
    expect(storage.get()).toBeUndefined();
  });

  it("persists and removes locale values from browser storage strategies", () => {
    const localStorageAdapter = localStorageStrategy({ key: "valfuse-local-locale" });
    const sessionStorageAdapter = sessionStorageStrategy({ key: "valfuse-session-locale" });
    const cookieAdapter = cookieStrategy({ key: "valfuse-cookie-locale", secure: false });

    for (const storage of [localStorageAdapter, sessionStorageAdapter, cookieAdapter]) {
      storage.set("id");
      expect(storage.get()).toBe("id");
      storage.remove?.();
      expect(storage.get()).toBeUndefined();
    }
  });

  it("returns safe defaults when browser storage is unavailable", () => {
    const getItem = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    const setItem = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    const removeItem = vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    const storage = localStorageStrategy({ key: "blocked-locale" });

    expect(storage.get()).toBeUndefined();
    expect(() => storage.set("id")).not.toThrow();
    expect(() => storage.remove?.()).not.toThrow();

    getItem.mockRestore();
    setItem.mockRestore();
    removeItem.mockRestore();
  });

  it("provides reactive translations, formatting, and locale changes", async () => {
    let localizer!: ReturnType<typeof useLocalization>;
    const Consumer = defineComponent({
      setup() {
        localizer = useLocalization();
        return () => h("span", localizer.format("common.welcome", { name: "Valfuse" }));
      },
    });
    const wrapper = mount(LocalizationProvider, {
      props: { manifest, initialLocale: "en" },
      slots: { default: () => h(Consumer) },
    });

    expect(wrapper.text()).toBe("Hello, Valfuse!");
    expect(localizer.plural("common.item_count", 2)).toBe("2 items");

    localizer.setLocale("id");
    await nextTick();

    expect(localizer.locale.value).toBe("id");
    expect(wrapper.text()).toBe("Halo, Valfuse!");
    wrapper.unmount();
  });

  it("uses stored locale only when it is available in the manifest", () => {
    let localizer!: ReturnType<typeof useLocalization>;
    const Consumer = defineComponent({
      setup() {
        localizer = useLocalization();
        return () => h("span");
      },
    });
    const wrapper = mount(LocalizationProvider, {
      props: {
        manifest,
        initialLocale: "en",
        storage: { get: () => "id", set: () => undefined },
      },
      slots: { default: () => h(Consumer) },
    });

    expect(localizer.locale.value).toBe("id");
    wrapper.unmount();
  });

  it("uses a valid initial locale when stored data is unsupported and persists changes", () => {
    let localizer!: ReturnType<typeof useLocalization>;
    const savedLocales: string[] = [];
    const Consumer = defineComponent({
      setup() {
        localizer = useLocalization();
        return () => h("span");
      },
    });
    const wrapper = mount(LocalizationProvider, {
      props: {
        manifest,
        initialLocale: "id",
        storage: { get: () => "fr", set: (locale) => savedLocales.push(locale) },
      },
      slots: { default: () => h(Consumer) },
    });

    expect(localizer.locale.value).toBe("id");
    localizer.setLocale("en");
    expect(localizer.store.getLocale()).toBe("en");
    expect(savedLocales).toEqual(["en"]);
    expect(localizer.store.t("common.welcome", { name: "Ada" })).toBe("Hello, Ada!");
    wrapper.unmount();
  });

  it("uses the base locale when the requested initial locale is unavailable", () => {
    let localizer!: ReturnType<typeof useLocalization>;
    const Consumer = defineComponent({
      setup() {
        localizer = useLocalization();
        return () => h("span");
      },
    });
    const wrapper = mount(LocalizationProvider, {
      props: { manifest, initialLocale: "fr" },
      slots: { default: () => h(Consumer) },
    });

    expect(localizer.locale.value).toBe("en");
    wrapper.unmount();
  });

  it("supports fallbacks and nullable translation lookups", () => {
    let localizer!: ReturnType<typeof useLocalization>;
    let mappedFallback!: ReturnType<typeof useLocalization>;
    let globalFallback!: ReturnType<typeof useLocalization>;
    const Consumer = defineComponent({
      setup() {
        localizer = useLocalization({
          fallback: (key) => (key === "common.callback_fallback" ? "Callback fallback" : undefined),
        });
        mappedFallback = useLocalization({
          fallback: { "common.map_fallback": "Mapped fallback" },
        });
        globalFallback = useLocalization({ fallback: "Global fallback" });
        return () => h("span");
      },
    });
    const wrapper = mount(LocalizationProvider, {
      props: { manifest },
      slots: { default: () => h(Consumer) },
    });

    expect(localizer.translate("common.missing")).toBe("common.missing");
    expect(localizer.translate("common.missing", "Explicit fallback")).toBe("Explicit fallback");
    expect(localizer.translate("common.missing", null)).toBe("common.missing");
    expect(localizer.translate("common.callback_fallback")).toBe("Callback fallback");
    expect(mappedFallback.translate("common.map_fallback")).toBe("Mapped fallback");
    expect(globalFallback.translate("common.global_fallback")).toBe("Global fallback");

    expect(localizer.translateOrNull(null)).toBeNull();
    expect(localizer.translateOrNull(undefined)).toBeNull();
    expect(localizer.translateOrNull("common.welcome")).toBe("Hello, {name}!");
    expect(localizer.translateOrNull("common.missing")).toBeNull();
    expect(localizer.formatOrNull(null, { name: "Ada" })).toBeNull();
    expect(localizer.formatOrNull("common.missing", { name: "Ada" })).toBeNull();
    expect(localizer.formatOrNull("common.welcome", { name: "Ada" })).toBe("Hello, Ada!");
    wrapper.unmount();
  });

  it("supports structured variants, namespaced methods, and sorted locale entries", () => {
    let localizer!: ReturnType<typeof useLocalization>;
    const Consumer = defineComponent({
      setup() {
        localizer = useLocalization();
        return () => h("span");
      },
    });
    const wrapper = mount(LocalizationProvider, {
      props: { manifest },
      slots: { default: () => h(Consumer) },
    });
    const common = localizer.namespace("common");

    expect(localizer.format("common.welcome", { name: "Ada" })).toBe("Hello, Ada!");
    expect(localizer.plural("common.item_count", 1)).toBe("1 item");
    expect(localizer.plural("common.item_count", 2)).toBe("2 items");
    expect(localizer.pluralOrNull(null, 2)).toBeNull();
    expect(localizer.pluralOrNull("common.missing", 2)).toBeNull();
    expect(localizer.pluralOrNull("common.item_count", 2)).toBe("2 items");
    expect(localizer.gender("common.gender_message", "female", { name: "Ada" })).toBe(
      "She likes Ada"
    );
    expect(localizer.context("common.context_message", "formal", { name: "Ada" })).toBe(
      "Good day, Ada"
    );
    expect(localizer.context("common.context_message", "casual")).toBe("Hi, {name}");

    expect(common.translate("welcome")).toBe("Hello, {name}!");
    expect(common.translateOrNull(null)).toBeNull();
    expect(common.translateOrNull("missing")).toBeNull();
    expect(common.translateOrNull("welcome")).toBe("Hello, {name}!");
    expect(common.format("welcome", { name: "Ada" })).toBe("Hello, Ada!");
    expect(common.formatOrNull(null, { name: "Ada" })).toBeNull();
    expect(common.formatOrNull("missing", { name: "Ada" })).toBeNull();
    expect(common.formatOrNull("welcome", { name: "Ada" })).toBe("Hello, Ada!");
    expect(common.plural("item_count", 2)).toBe("2 items");
    expect(common.pluralOrNull(null, 2)).toBeNull();
    expect(common.pluralOrNull("missing", 2)).toBeNull();
    expect(common.pluralOrNull("item_count", 2)).toBe("2 items");
    expect(common.gender("gender_message", "male", { name: "Adi" })).toBe("He likes Adi");
    expect(common.context("context_message", "formal", { name: "Ada" })).toBe("Good day, Ada");
    expect(common.context("context_message", "casual")).toBe("Hi, {name}");
    const entryKeys = localizer.entriesForLocale.value.map(([key]) => key);
    expect(entryKeys).toEqual([...entryKeys].sort());

    localizer.setLocale("id");
    expect(localizer.entriesForLocale.value.map(([key]) => key)).toContain("common.alpha");
    expect(localizer.translateOrNull("common.fallback_only")).toBe("Fallback translation");
    wrapper.unmount();
  });

  it("requires a provider and renders safely when it has no default slot", () => {
    let setupError: unknown;
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const Consumer = defineComponent({
      setup() {
        try {
          useLocalization();
        } catch (error) {
          setupError = error;
        }
        return () => h("span");
      },
    });

    try {
      const wrapper = mount(Consumer);
      expect(setupError).toEqual(
        new Error("useLocalization must be used within LocalizationProvider.")
      );
      wrapper.unmount();
    } finally {
      warning.mockRestore();
    }

    expect(mount(LocalizationProvider, { props: { manifest } }).text()).toBe("");
  });

  it("builds a locale-reactive strings and placeholders tree", () => {
    let tree!: ReturnType<typeof useLocalizationTree>;
    const Consumer = defineComponent({
      setup() {
        tree = useLocalizationTree();
        return () => h("span");
      },
    });
    const wrapper = mount(LocalizationProvider, {
      props: { manifest },
      slots: { default: () => h(Consumer) },
    });

    const welcome = tree.value.placeholders.welcome as (params: { name: string }) => string;
    expect(welcome({ name: "Ada" })).toBe("Hello, Ada!");
    expect(tree.value.strings.alpha).toBe("Alpha");
    wrapper.unmount();
  });
});
