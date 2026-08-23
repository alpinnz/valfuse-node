import { readdir } from "node:fs/promises";
import { join } from "node:path";

async function walk(dir: string, files: string[], ext: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const next = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(next, files, ext);
    } else if (entry.isFile() && next.endsWith(`.${ext}`)) {
      files.push(next);
    }
  }
}

export async function scanLocalizationFiles(inputDir: string, ext = "json"): Promise<string[]> {
  const files: string[] = [];
  await walk(inputDir, files, ext);
  return files.sort();
}
