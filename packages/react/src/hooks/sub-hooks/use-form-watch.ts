/**
 * useFormWatch — the `watch` callback + the subscriber-notification effect.
 *
 * The effect fires `watchSubscribersRef` callbacks whenever `values` changes,
 * passing the changed-field hint from `lastChangedFieldRef`. The effect deps
 * are limited to `values` (and the two refs) so subscribers only run when
 * values actually change — not on every render.
 *
 * Reference-stability contract: `watch` itself keeps `[]` deps. The function
 * closes over `core.refs.*` (stable refs) and the identity never changes
 * across renders, so consumers can safely include it in `useEffect` deps.
 */
import { useCallback, useEffect } from "react";
import type { ValfuseWatchFunction, ValfuseWatchCallback } from "../../types/index";
import type { FormCore } from "./form-core";

export function useFormWatch<TFieldValues extends Record<string, unknown>>(
  core: FormCore<TFieldValues>
) {
  const { watchSubscribersRef, lastChangedFieldRef } = core.refs;

  // Notify watch subscribers whenever values change.
  useEffect(() => {
    if (watchSubscribersRef.current.size > 0) {
      const info: { name?: string; type?: string } = {
        name: lastChangedFieldRef.current,
        type: lastChangedFieldRef.current ? "change" : undefined,
      };
      watchSubscribersRef.current.forEach((cb) => cb(core.values, info));
    }
    lastChangedFieldRef.current = undefined;
    // Deps mirror the original inline useEffect: only the two refs (stable)
    // and `values` (the trigger). `core.refs` is intentionally NOT a dep —
    // its identity changes every render even though its fields are stable.
  }, [core.values, watchSubscribersRef, lastChangedFieldRef]);

  // `watch` reads everything via refs; identity is stable for the hook's lifetime.
  const watch = useCallback(
    (nameOrNamesOrCallback?: unknown) => {
      const { valuesRef } = core.refs;
      if (typeof nameOrNamesOrCallback === "function") {
        const cb = nameOrNamesOrCallback as ValfuseWatchCallback<TFieldValues>;
        watchSubscribersRef.current.add(cb);
        return () => watchSubscribersRef.current.delete(cb);
      }
      if (Array.isArray(nameOrNamesOrCallback)) {
        return nameOrNamesOrCallback.map((n) => valuesRef.current[n as keyof TFieldValues]);
      }
      if (typeof nameOrNamesOrCallback === "string") {
        return valuesRef.current[nameOrNamesOrCallback as keyof TFieldValues];
      }
      return valuesRef.current;
    },
    [core.refs, watchSubscribersRef]
  ) as ValfuseWatchFunction<TFieldValues>;

  return { watch };
}
