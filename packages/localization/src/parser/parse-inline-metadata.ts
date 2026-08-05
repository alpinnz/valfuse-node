import type { InlineMetadata } from "../types/ast";

export function parseInlineMetadata(node: Record<string, unknown>): InlineMetadata | undefined {
  const metadataKeys = Object.keys(node).filter(
    (key) =>
      key.startsWith("@") &&
      key !== "@value" &&
      key !== "@plural" &&
      key !== "@gender" &&
      key !== "@context"
  );
  if (metadataKeys.length === 0) return undefined;

  const metadata: InlineMetadata = {};
  for (const key of metadataKeys) {
    const value = node[key];
    if (key === "@description" && typeof value === "string") {
      metadata.description = value;
    } else if (key === "@example" && typeof value === "string") {
      metadata.example = value;
    } else if (key === "@placeholders" && value && typeof value === "object") {
      metadata.placeholders = value as Record<string, string>;
    } else {
      metadata.custom ??= {};
      metadata.custom[key.slice(1)] = value;
    }
  }
  return metadata;
}
