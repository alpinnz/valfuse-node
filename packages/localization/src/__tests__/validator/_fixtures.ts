import type { NormalizedMessage, NormalizedProject } from "../../types/normalized";
import type { InlineMetadata, StructuredNode } from "../../types/ast";

/**
 * Test fixture helpers for the validator suite. Each helper builds a fully
 * typed `NormalizedMessage` / `NormalizedProject` with the minimum fields
 * the validators read — no more, no less.
 *
 * Why hand-built fixtures? The validators are pure functions that take a
 * `NormalizedProject`. We don't want test setup to depend on the full
 * compile pipeline (which has filesystem and config dependencies). Building
 * fixtures inline keeps the validator tests fast and focused.
 */

export function makeMessage(overrides: Partial<NormalizedMessage> = {}): NormalizedMessage {
  return {
    key: "common.greeting",
    sourceKey: "common.greeting",
    module: "common",
    locale: "en",
    value: "Hello",
    placeholders: [],
    ...overrides,
  };
}

export function makeProject(
  entries: Array<{
    module: string;
    locale: string;
    messages: NormalizedMessage[];
  }>
): NormalizedProject {
  const flat = entries.map((e) => ({
    module: e.module,
    locale: e.locale,
    messages: Object.fromEntries(e.messages.map((m) => [m.key, m])),
  }));
  return {
    locales: [...new Set(entries.map((e) => e.locale))].sort(),
    modules: [...new Set(entries.map((e) => e.module))].sort(),
    entries: flat,
  };
}

/**
 * Build a project with a "greeting" message available in both `en` and `id`,
 * each having the same set of placeholders. This is the canonical "no errors"
 * baseline for parity validators.
 */
export function parityBaselineProject(): NormalizedProject {
  return makeProject([
    {
      module: "common",
      locale: "en",
      messages: [
        makeMessage({
          key: "greeting",
          sourceKey: "greeting",
          value: "Hello, {name}",
          placeholders: ["name"],
        }),
      ],
    },
    {
      module: "common",
      locale: "id",
      messages: [
        makeMessage({
          key: "greeting",
          sourceKey: "greeting",
          locale: "id",
          value: "Halo, {name}",
          placeholders: ["name"],
        }),
      ],
    },
  ]);
}

/** Helper: a structured node (any of the three types) for tests. */
export function structured(
  type: "plural" | "gender" | "context",
  variants: Record<string, string>
): StructuredNode {
  return { type, variants };
}

/** Helper: minimal metadata for tests. */
export function meta(overrides: Partial<InlineMetadata> = {}): InlineMetadata {
  return overrides;
}
