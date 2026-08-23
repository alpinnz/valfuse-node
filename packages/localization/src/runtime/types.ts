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
