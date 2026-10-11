import { computed, defineComponent, inject, provide, ref } from "vue";
import type { ComputedRef, InjectionKey, PropType, Ref } from "vue";
import type { RuntimeManifest } from "@valfuse-node/localization";
import {
  interpolate,
  lookupMessage,
  pickStructuredContextVariant,
  pickStructuredGenderVariant,
  pickStructuredPluralVariant,
} from "@valfuse-node/localization/runtime";
import type {
  GenderVariant,
  InterpolationParams,
  NamespacedLocalizer,
} from "@valfuse-node/localization/runtime";

export type { GenderVariant, InterpolationParams, NamespacedLocalizer };

export type TranslationFallback =
  string | Record<string, string> | ((key: string) => string | undefined);

export interface UseLocalizationOptions {
  fallback?: TranslationFallback;
}

export interface LocaleStorage {
  get(): string | undefined;
  set(locale: string): void;
  remove?(): void;
}

export interface LocalizationStore {
  getLocale(): string;
  setLocale(locale: string): void;
  t(key: string, params?: InterpolationParams): string;
}

export interface LocalizationProviderOptions {
  manifest: RuntimeManifest;
  initialLocale?: string;
  storage?: LocaleStorage;
}

export interface LocalizationContextValue {
  locale: ComputedRef<string>;
  setLocale(locale: string): void;
  store: LocalizationStore;
  manifest: RuntimeManifest;
}

const localizationKey: InjectionKey<LocalizationContextValue> = Symbol("ValfuseLocalization");

function pickFallbackText(
  fallback: TranslationFallback | undefined,
  key: string
): string | undefined {
  if (!fallback) return undefined;
  if (typeof fallback === "string") return fallback;
  if (typeof fallback === "function") return fallback(key);
  return fallback[key];
}

function createStore(
  manifest: RuntimeManifest,
  locale: Ref<string>,
  setLocale: (locale: string) => void
): LocalizationStore {
  return {
    getLocale: () => locale.value,
    setLocale,
    t(key, params) {
      const context = {
        locale: locale.value,
        fallbackLocale: manifest.fallback_locale,
        messages: manifest.messages,
      };
      const message = lookupMessage(context, key);
      return params ? interpolate(message, params) : message;
    },
  };
}

/** Provides request/app-scoped localization state from inside a Vue setup(). */
export function provideLocalization(
  options: LocalizationProviderOptions
): LocalizationContextValue {
  const { manifest, initialLocale, storage } = options;
  const storedLocale = storage?.get();
  const initial =
    storedLocale && manifest.locales.includes(storedLocale)
      ? storedLocale
      : initialLocale && manifest.locales.includes(initialLocale)
        ? initialLocale
        : manifest.base_locale;
  const localeState = ref(initial);
  const locale = computed(() => localeState.value);

  function setLocale(nextLocale: string): void {
    storage?.set(nextLocale);
    localeState.value = nextLocale;
  }

  const context: LocalizationContextValue = {
    locale,
    setLocale,
    store: createStore(manifest, localeState, setLocale),
    manifest,
  };

  provide(localizationKey, context);
  return context;
}

/** Vue component equivalent of React's LocalizationProvider. */
export const LocalizationProvider = defineComponent({
  name: "LocalizationProvider",
  props: {
    manifest: { type: Object as PropType<RuntimeManifest>, required: true },
    initialLocale: { type: String, default: undefined },
    storage: { type: Object as PropType<LocaleStorage>, default: undefined },
  },
  setup(props, { slots }) {
    provideLocalization({
      manifest: props.manifest,
      initialLocale: props.initialLocale,
      storage: props.storage,
    });
    return () => slots.default?.();
  },
});

/** Returns reactive localization methods from a LocalizationProvider. */
export function useLocalization(options: UseLocalizationOptions = {}) {
  const injectedContext = inject(localizationKey);
  if (!injectedContext)
    throw new Error("useLocalization must be used within LocalizationProvider.");
  const context = injectedContext;

  function runtimeContext() {
    return {
      locale: context.locale.value,
      fallbackLocale: context.manifest.fallback_locale,
      messages: context.manifest.messages,
    };
  }

  function raw(key: string): string {
    const { fallback_locale: fallbackLocale, messages } = context.manifest;
    return messages[context.locale.value]?.[key] ?? messages[fallbackLocale]?.[key] ?? "";
  }

  function hasKey(key: string): boolean {
    const { fallback_locale: fallbackLocale, messages } = context.manifest;
    return key in (messages[context.locale.value] ?? {}) || key in (messages[fallbackLocale] ?? {});
  }

  function translate(key: string, fallbackValue?: string | null): string {
    const translated = lookupMessage(runtimeContext(), key);
    if (!translated || translated === key) {
      if (fallbackValue === null) return translated;
      return fallbackValue ?? pickFallbackText(options.fallback, key) ?? translated;
    }
    return translated;
  }

  function format(key: string, params: InterpolationParams): string {
    return interpolate(translate(key), params);
  }

  function translateOrNull(key: string | null | undefined): string | null {
    return key == null || !hasKey(key) ? null : translate(key);
  }

  function formatOrNull(
    key: string | null | undefined,
    params: InterpolationParams
  ): string | null {
    return key == null || !hasKey(key) ? null : format(key, params);
  }

  function plural(key: string, count: number): string {
    return pickStructuredPluralVariant(raw(key), count);
  }

  function pluralOrNull(key: string | null | undefined, count: number): string | null {
    return key == null || !hasKey(key) ? null : plural(key, count);
  }

  function gender(key: string, value: GenderVariant, params: InterpolationParams): string {
    return interpolate(pickStructuredGenderVariant(raw(key), value), params);
  }

  function contextMessage(key: string, value: string, params?: InterpolationParams): string {
    const message = pickStructuredContextVariant(raw(key), value);
    return params ? interpolate(message, params) : message;
  }

  function namespace(scope: string): NamespacedLocalizer {
    return {
      translate: (key, fallbackValue) => translate(`${scope}.${key}`, fallbackValue),
      translateOrNull: (key) => (key == null ? null : translateOrNull(`${scope}.${key}`)),
      format: (key, params) => format(`${scope}.${key}`, params),
      formatOrNull: (key, params) => (key == null ? null : formatOrNull(`${scope}.${key}`, params)),
      plural: (key, count) => plural(`${scope}.${key}`, count),
      pluralOrNull: (key, count) => (key == null ? null : pluralOrNull(`${scope}.${key}`, count)),
      gender: (key, value, params) => gender(`${scope}.${key}`, value, params),
      context: (key, value, params) => contextMessage(`${scope}.${key}`, value, params),
    };
  }

  const entriesForLocale: ComputedRef<Array<[string, string]>> = computed(() =>
    Object.entries(context.manifest.messages[context.locale.value] ?? {}).sort(([left], [right]) =>
      left.localeCompare(right)
    )
  );

  return {
    ...context,
    translate,
    translateOrNull,
    format,
    formatOrNull,
    plural,
    pluralOrNull,
    gender,
    context: contextMessage,
    namespace,
    entriesForLocale,
  };
}

/** Builds translated strings and placeholder functions in a reactive tree. */
export function useLocalizationTree() {
  const localizer = useLocalization();

  return computed(() => {
    const strings: Record<string, unknown> = {};
    const placeholders: Record<string, unknown> = {};

    for (const entry of localizer.manifest.entries) {
      const segments = entry.key.split(".").slice(1);
      if (segments.length === 0) continue;
      const target = entry.placeholders.length > 0 ? placeholders : strings;
      let cursor = target;

      for (const segment of segments.slice(0, -1)) {
        cursor[segment] ??= {};
        cursor = cursor[segment] as Record<string, unknown>;
      }

      const leaf = segments[segments.length - 1];
      if (!leaf) continue;
      cursor[leaf] =
        entry.placeholders.length > 0
          ? (params: InterpolationParams) => localizer.store.t(entry.key, params)
          : localizer.store.t(entry.key);
    }

    return { strings, placeholders };
  });
}
