const PLACEHOLDER_REGEX = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/gu;

export function extractPlaceholders(value: string): string[] {
  const names = new Set<string>();
  for (const match of value.matchAll(PLACEHOLDER_REGEX)) {
    const placeholder = match[1];
    if (placeholder) names.add(placeholder);
  }
  return [...names].sort();
}
