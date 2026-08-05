import type { RuntimeManifest } from "../types/manifest";

export interface RuntimeModel {
  stringsTree: Record<string, unknown>;
}

function setNested(target: Record<string, unknown>, path: string[], value: unknown): void {
  if (path.length === 0) return;
  let cursor: Record<string, unknown> = target;
  for (let i = 0; i < path.length - 1; i += 1) {
    const segment = path[i];
    if (!segment) continue;
    const next = cursor[segment];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }
  const leaf = path[path.length - 1];
  if (!leaf) return;
  cursor[leaf] = value;
}

/**
 * Builds the accessor tree used in the generated `localization` constant.
 * Property names preserve source key segments as-is (snake_case).
 */
export function buildRuntimeModel(manifest: RuntimeManifest): RuntimeModel {
  const stringsTree: Record<string, unknown> = {};

  for (const entry of manifest.entries) {
    const segments = entry.key.split(".");
    setNested(stringsTree, segments, entry.key);
  }

  return { stringsTree };
}
