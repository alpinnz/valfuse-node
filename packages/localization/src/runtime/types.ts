/**
 * Runtime input consumed by localization lookup/variant helper functions.
 *
 * @remarks
 * `messages` is a two-level map:
 * - first key: locale code (`en`, `id`, ...)
 * - second key: fully-qualified message key (`module.path.to.leaf`)
 */
export interface RuntimeContext {
  /** Active locale requested by the current UI/session. */
  locale: string;
  /** Locale used as fallback when a key is missing in `locale`. */
  fallbackLocale: string;
  /** Flattened runtime message table grouped by locale. */
  messages: Record<string, Record<string, string>>;
}

export type InterpolationParams = Record<string, string | number>;
export type GenderVariant = "male" | "female" | "other";

export interface NamespacedLocalizer {
  translate(key: string, fallbackValue?: string | null): string;
  /** Returns `null` when key does not exist or is `null`/`undefined`. */
  translateOrNull(key: string | null | undefined): string | null;
  format(key: string, params: InterpolationParams): string;
  /** Returns `null` when key does not exist or is `null`/`undefined`. */
  formatOrNull(key: string | null | undefined, params: InterpolationParams): string | null;
  plural(key: string, count: number): string;
  /** Returns `null` when key does not exist or is `null`/`undefined`. */
  pluralOrNull(key: string | null | undefined, count: number): string | null;
  gender(key: string, gender: GenderVariant, params: InterpolationParams): string;
  context(key: string, context: string, params?: InterpolationParams): string;
}
