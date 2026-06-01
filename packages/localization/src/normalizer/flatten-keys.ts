import type { LocalizationAstNode, LocalizedLeaf } from "../types/ast";

export interface FlattenedLeaf {
  key: string;
  sourceKey: string;
  leaf: LocalizedLeaf;
}

function toLeaf(node: string | LocalizedLeaf): LocalizedLeaf {
  return typeof node === "string" ? { value: node } : node;
}

export function flattenKeys(
  root: Record<string, LocalizationAstNode>
): FlattenedLeaf[] {
  const output: FlattenedLeaf[] = [];

  function visit(prefix: string, node: LocalizationAstNode): void {
    if (typeof node === "string") {
      output.push({ key: prefix, sourceKey: prefix, leaf: toLeaf(node) });
      return;
    }
    if (node && typeof node === "object" && "value" in node) {
      output.push({ key: prefix, sourceKey: prefix, leaf: node as LocalizedLeaf });
      return;
    }
    for (const [childKey, childNode] of Object.entries(
      node as Record<string, LocalizationAstNode>
    )) {
      const next = prefix ? `${prefix}.${childKey}` : childKey;
      visit(next, childNode);
    }
  }

  for (const [key, value] of Object.entries(root)) {
    if (key.startsWith("@@")) continue; // @@locale / @@module are file-level metadata
    visit(key, value);
  }

  return output.sort((a, b) => a.key.localeCompare(b.key));
}

