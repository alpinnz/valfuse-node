import type { StructuredNode } from "../types/ast";

function readVariants(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Structured node variants must be an object.");
  }
  const result: Record<string, string> = {};
  for (const [key, node] of Object.entries(value)) {
    if (typeof node !== "string") {
      throw new Error(`Structured variant "${key}" must be a string.`);
    }
    result[key] = node;
  }
  return result;
}

export function parseStructuredNode(node: Record<string, unknown>): StructuredNode | undefined {
  if ("@plural" in node) {
    return { type: "plural", variants: readVariants(node["@plural"]) };
  }
  if ("@gender" in node) {
    return { type: "gender", variants: readVariants(node["@gender"]) };
  }
  if ("@context" in node) {
    return { type: "context", variants: readVariants(node["@context"]) };
  }
  return undefined;
}
