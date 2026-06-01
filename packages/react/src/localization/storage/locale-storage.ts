/**
 * Generic contract for persisting / reading the active locale.
 *
 * Implement this interface to connect any storage backend
 * (localStorage, sessionStorage, cookies, IndexedDB, remote API, …).
 */
export interface LocaleStorage {
  /** Read the previously-saved locale. Returns `undefined` when nothing is stored. */
  get(): string | undefined;
  /** Persist the newly selected locale. */
  set(locale: string): void;
  /** Optional: remove the stored value (e.g. when locale is reset). */
  remove?(): void;
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface LocalStorageStrategyOptions {
  /** Storage key. Defaults to `"locale"`. */
  key?: string;
}

export interface SessionStorageStrategyOptions {
  /** Storage key. Defaults to `"locale"`. */
  key?: string;
}

export interface CookieStrategyOptions {
  /** Cookie name. Defaults to `"locale"`. */
  key?: string;
  /**
   * Domain the cookie is scoped to.
   * e.g. `".example.com"` shares across all sub-domains.
   * Omit for the current host only.
   */
  domain?: string;
  /** Cookie path. Defaults to `"/"`. */
  path?: string;
  /**
   * Max age in seconds.
   * Defaults to 1 year (`31_536_000`).
   * Pass `0` to create a session cookie.
   */
  maxAge?: number;
  /** Mark cookie as Secure. Defaults to `true` when on `https:`. */
  secure?: boolean;
  /** SameSite policy. Defaults to `"Lax"`. */
  sameSite?: "Strict" | "Lax" | "None";
}

// ─── Factories ────────────────────────────────────────────────────────────────

/**
 * Persists the locale in `window.localStorage`.
 *
 * @example
 * <LocalizationProvider storage={localStorageStrategy()} … />
 */
export function localStorageStrategy(
  options: LocalStorageStrategyOptions = {}
): LocaleStorage {
  const key = options.key ?? "locale";
  return {
    get() {
      try {
        return window.localStorage.getItem(key) ?? undefined;
      } catch {
        return undefined;
      }
    },
    set(locale) {
      try {
        window.localStorage.setItem(key, locale);
      } catch {
        // quota exceeded or private browsing — silently ignore
      }
    },
    remove() {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    },
  };
}

/**
 * Persists the locale in `window.sessionStorage` (cleared on tab close).
 *
 * @example
 * <LocalizationProvider storage={sessionStorageStrategy()} … />
 */
export function sessionStorageStrategy(
  options: SessionStorageStrategyOptions = {}
): LocaleStorage {
  const key = options.key ?? "locale";
  return {
    get() {
      try {
        return window.sessionStorage.getItem(key) ?? undefined;
      } catch {
        return undefined;
      }
    },
    set(locale) {
      try {
        window.sessionStorage.setItem(key, locale);
      } catch {
        /* noop */
      }
    },
    remove() {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        /* noop */
      }
    },
  };
}

/**
 * Persists the locale as an HTTP cookie.
 *
 * Supports `domain`, `path`, `maxAge`, `secure`, and `sameSite` options so the
 * same cookie can be read server-side (e.g. for SSR / middleware redirects).
 *
 * @example
 * <LocalizationProvider storage={cookieStrategy({ domain: ".example.com" })} … />
 */
export function cookieStrategy(options: CookieStrategyOptions = {}): LocaleStorage {
  const {
    key = "locale",
    domain,
    path = "/",
    maxAge = 31_536_000,
    sameSite = "Lax",
  } = options;

  function buildCookie(value: string, age: number): string {
    const isSecure =
      options.secure !== undefined
        ? options.secure
        : typeof location !== "undefined" && location.protocol === "https:";

    let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    cookie += `; path=${path}`;
    cookie += `; max-age=${age}`;
    if (domain) cookie += `; domain=${domain}`;
    if (isSecure) cookie += "; Secure";
    cookie += `; SameSite=${sameSite}`;
    return cookie;
  }

  return {
    get() {
      if (typeof document === "undefined") return undefined;
      const encodedKey = encodeURIComponent(key);
      const match = document.cookie
        .split("; ")
        .find((c) => c.startsWith(`${encodedKey}=`));
      const rawValue = match?.split("=").slice(1).join("=");
      return rawValue !== undefined ? decodeURIComponent(rawValue) : undefined;
    },
    set(locale) {
      if (typeof document === "undefined") return;
      document.cookie = buildCookie(locale, maxAge);
    },
    remove() {
      if (typeof document === "undefined") return;
      document.cookie = buildCookie("", 0);
    },
  };
}

/**
 * In-memory storage — locale is lost on page reload.
 * Useful for testing or when no persistence is desired.
 *
 * @example
 * <LocalizationProvider storage={memoryStrategy()} … />
 */
export function memoryStrategy(
  options: { initialLocale?: string } = {}
): LocaleStorage {
  let stored: string | undefined = options.initialLocale;
  return {
    get: () => stored,
    set: (locale) => {
      stored = locale;
    },
    remove: () => {
      stored = undefined;
    },
  };
}

/**
 * Combines multiple storages in priority order.
 * Reads from the first storage that returns a value; writes to **all** of them.
 *
 * @example
 * const storage = composeStorage(
 *   cookieStrategy({ domain: ".example.com" }),
 *   localStorageStrategy()
 * );
 */
export function composeStorage(...storages: LocaleStorage[]): LocaleStorage {
  return {
    get() {
      for (const s of storages) {
        const v = s.get();
        if (v !== undefined) return v;
      }
      return undefined;
    },
    set(locale) {
      storages.forEach((s) => s.set(locale));
    },
    remove() {
      storages.forEach((s) => s.remove?.());
    },
  };
}

