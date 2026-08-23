import type { InlineMetadata } from "../types/ast";

export function normalizeMetadata(
  metadata: InlineMetadata | undefined
): InlineMetadata | undefined {
  if (!metadata) return undefined;
  return {
    ...metadata,
    placeholders: metadata.placeholders
      ? Object.fromEntries(
          Object.entries(metadata.placeholders).sort(([a], [b]) => a.localeCompare(b))
        )
      : undefined,
    custom: metadata.custom
      ? Object.fromEntries(Object.entries(metadata.custom).sort(([a], [b]) => a.localeCompare(b)))
      : undefined,
  };
}
