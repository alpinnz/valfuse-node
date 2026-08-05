import { extractPlaceholders } from "../parser/extract-placeholders";
import type { FlattenedLeaf } from "./flatten-keys";
import type { NormalizedMessage } from "../types/normalized";

export function normalizeKeyNode(
  leaf: FlattenedLeaf,
  module: string,
  locale: string
): NormalizedMessage {
  const value = leaf.leaf.value;
  return {
    key: leaf.key,
    sourceKey: leaf.sourceKey,
    module,
    locale,
    value,
    metadata: leaf.leaf.metadata,
    structured: leaf.leaf.structured,
    placeholders: extractPlaceholders(value),
  };
}
