import type { LocaleStorage } from "./localization";

export interface WebStorageStrategyOptions {
  key?: string;
}

export interface CookieStrategyOptions {
  key?: string;
  domain?: string;
  path?: string;
  maxAge?: number;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

function browserStorageStrategy(
  storageName: "localStorage" | "sessionStorage",
  options: WebStorageStrategyOptions = {}
): LocaleStorage {
  const key = options.key ?? "locale";
  return {
    get() {
      try {
        return window[storageName].getItem(key) ?? undefined;
      } catch {
        return undefined;
      }
    },
    set(locale) {
      try {
        window[storageName].setItem(key, locale);
      } catch {
        // Browser storage can be unavailable in private or restricted contexts.
      }
    },
    remove() {
      try {
        window[storageName].removeItem(key);
      } catch {
        // Browser storage can be unavailable in private or restricted contexts.
      }
    },
  };
}

/** Stores the selected locale in browser localStorage. Safe during SSR. */
export function localStorageStrategy(options: WebStorageStrategyOptions = {}): LocaleStorage {
  return browserStorageStrategy("localStorage", options);
}

/** Stores the selected locale in browser sessionStorage. Safe during SSR. */
export function sessionStorageStrategy(options: WebStorageStrategyOptions = {}): LocaleStorage {
  return browserStorageStrategy("sessionStorage", options);
}

/** Stores the selected locale in a browser cookie. Safe during SSR. */
export function cookieStrategy(options: CookieStrategyOptions = {}): LocaleStorage {
  const { key = "locale", domain, path = "/", maxAge = 31_536_000, sameSite = "Lax" } = options;

  function buildCookie(value: string, age: number): string {
    const secure =
      options.secure ?? (typeof location !== "undefined" && location.protocol === "https:");
    let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=${path}; max-age=${age}`;
    if (domain) cookie += `; domain=${domain}`;
    if (secure) cookie += "; Secure";
    cookie += `; SameSite=${sameSite}`;
    return cookie;
  }

  return {
    get() {
      if (typeof document === "undefined") return undefined;
      const encodedKey = encodeURIComponent(key);
      const match = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith(`${encodedKey}=`));
      const encodedValue = match?.slice(encodedKey.length + 1);
      return encodedValue === undefined ? undefined : decodeURIComponent(encodedValue);
    },
    set(locale) {
      if (typeof document !== "undefined") document.cookie = buildCookie(locale, maxAge);
    },
    remove() {
      if (typeof document !== "undefined") document.cookie = buildCookie("", 0);
    },
  };
}

/** In-memory locale storage, useful for tests or non-persistent sessions. */
export function memoryStrategy(options: { initialLocale?: string } = {}): LocaleStorage {
  let locale = options.initialLocale;
  return {
    get: () => locale,
    set: (nextLocale) => {
      locale = nextLocale;
    },
    remove: () => {
      locale = undefined;
    },
  };
}

/** Reads from the first storage containing a locale and writes to every storage. */
export function composeStorage(...storages: LocaleStorage[]): LocaleStorage {
  return {
    get() {
      for (const storage of storages) {
        const locale = storage.get();
        if (locale !== undefined) return locale;
      }
      return undefined;
    },
    set(locale) {
      for (const storage of storages) storage.set(locale);
    },
    remove() {
      for (const storage of storages) storage.remove?.();
    },
  };
}
