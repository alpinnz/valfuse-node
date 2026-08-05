import { createContext, useCallback, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { RuntimeManifest } from "@valfuse-node/localization";
import {
  createLocalizationStore,
  type LocalizationStore,
} from "../bridge/create-localization-store";
import type { LocaleStorage } from "../storage/locale-storage";

// ─── Context value ────────────────────────────────────────────────────────────

export interface LocalizationContextValue {
  /** Active locale currently used for runtime resolution. */
  locale: string;
  /** Updates the active locale for all consumers under the provider. */
  setLocale: (locale: string) => void;
  /** Runtime store — `store.t(key, params)` looks up translations. */
  store: LocalizationStore;
  /** Generated runtime manifest — source of truth for keys and messages. */
  manifest: RuntimeManifest;
}

// ─── Provider props ───────────────────────────────────────────────────────────

export interface LocalizationProviderProps {
  /** Generated runtime manifest from `valfuse-localization generate`. */
  manifest: RuntimeManifest;
  /**
   * Optional initial locale. When `storage` is also provided the stored value
   * takes precedence over `initialLocale`.
   */
  initialLocale?: string;
  /**
   * Pluggable locale storage strategy.
   *
   * Built-in helpers (imported from `@valfuse-node/react`):
   * - `localStorageStrategy()` — persists in `window.localStorage`
   * - `sessionStorageStrategy()` — persists in `window.sessionStorage`
   * - `cookieStrategy({ domain, maxAge, … })` — persists as a cookie
   * - `memoryStrategy()` — in-memory only (no persistence)
   * - `composeStorage(a, b)` — combines multiple strategies
   */
  storage?: LocaleStorage;
}

// ─── Internal context ─────────────────────────────────────────────────────────

export const LocalizationContext = createContext<LocalizationContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function determineInitialLocale(
  manifest: RuntimeManifest,
  initialLocale?: string,
  storage?: LocaleStorage
): string {
  const stored = storage?.get();
  if (stored && manifest.locales.includes(stored)) return stored;
  if (initialLocale && manifest.locales.includes(initialLocale)) return initialLocale;
  return manifest.base_locale;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Provides localization state and runtime store to the React subtree.
 *
 * Pass a `storage` strategy to persist the selected locale across page reloads.
 *
 * @example
 * import { LocalizationProvider, localStorageStrategy } from "@valfuse-node/react";
 *
 * <LocalizationProvider manifest={manifest} storage={localStorageStrategy()}>
 *   <App />
 * </LocalizationProvider>
 */
export default function LocalizationProvider({
  manifest,
  initialLocale,
  storage,
  children,
}: PropsWithChildren<LocalizationProviderProps>) {
  const [locale, _setLocale] = useState(() =>
    determineInitialLocale(manifest, initialLocale, storage)
  );

  const setLocale = useCallback(
    (nextLocale: string) => {
      storage?.set(nextLocale);
      _setLocale(nextLocale);
    },
    [storage]
  );

  const value = useMemo<LocalizationContextValue>(() => {
    const store = createLocalizationStore(manifest, locale);
    return { locale, setLocale, store, manifest };
  }, [locale, manifest, setLocale]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}
