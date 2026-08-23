import type { LocalizationAstNode, LocalizedLeaf } from "../types/ast";
import { parseInlineMetadata } from "./parse-inline-metadata";
import { parseStructuredNode } from "./parse-structured-node";

export function parseLocalizationFile(
  raw: Record<string, unknown>
): Record<string, LocalizationAstNode> {
  function parseNode(node: unknown): LocalizationAstNode {
    if (typeof node === "string") return node;

    if (!node || typeof node !== "object" || Array.isArray(node)) {
      throw new Error("Invalid localization node: expected string or object.");
    }

    const objectNode = node as Record<string, unknown>;
    const hasValue = "@value" in objectNode;
    const structured = parseStructuredNode(objectNode);
    const metadata = parseInlineMetadata(objectNode);

    if (hasValue || structured || metadata) {
      const valueNode = objectNode["@value"];
      const leaf: LocalizedLeaf = {
        value: typeof valueNode === "string" ? valueNode : "",
        metadata,
        structured,
      };
      return leaf;
    }

    const out: Record<string, LocalizationAstNode> = {};
    for (const [key, value] of Object.entries(objectNode)) {
      out[key] = parseNode(value);
    }
    return out;
  }

  const output: Record<string, LocalizationAstNode> = {};
  for (const [key, value] of Object.entries(raw)) {
    output[key] = parseNode(value);
  }
  return output;
}
