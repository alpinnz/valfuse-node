import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
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
  ],
  messages: {
    en: {
      "common.welcome": "Hello, {name}!",
      "common.item_count": '{"one":"{count} item","other":"{count} items"}',
    },
    id: {
      "common.welcome": "Halo, {name}!",
      "common.item_count": '{"one":"{count} barang","other":"{count} barang"}',
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
    wrapper.unmount();
  });
});
