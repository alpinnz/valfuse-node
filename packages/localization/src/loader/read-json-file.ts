import { readFile } from "node:fs/promises";

export async function readJsonFile(
  filePath: string
): Promise<Record<string, unknown>> {
  const content = await readFile(filePath, "utf8");
  const parsed = JSON.parse(content) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Invalid localization root object in ${filePath}`);
  }
  return parsed as Record<string, unknown>;
}

