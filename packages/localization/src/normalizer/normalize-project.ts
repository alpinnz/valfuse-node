import { join } from "node:path";
import type { LocalizationConfig } from "../types/config";
import type { NormalizedLocaleModule, NormalizedProject } from "../types/normalized";
import { buildFileIndex } from "../loader/build-file-index";
import { readJsonFile } from "../loader/read-json-file";
import { parseLocalizationFile } from "../parser/parse-localization-file";
import { flattenKeys } from "./flatten-keys";
import { normalizeKeyNode } from "./normalize-key-node";
import { normalizeMetadata } from "./normalize-metadata";
import { normalizeStructuredNode } from "./normalize-structured-node";

export async function normalizeProject(
  cwd: string,
  config: LocalizationConfig
): Promise<NormalizedProject> {
  const entries: NormalizedLocaleModule[] = [];
  const index = await buildFileIndex(cwd, join(cwd, config.input_dir));

  for (const file of index) {
    const raw = await readJsonFile(file.filePath);
    const parsed = parseLocalizationFile(raw);
    const flat = flattenKeys(parsed);

    const messages = Object.fromEntries(
      flat.map((leaf) => {
        const normalized = normalizeKeyNode(leaf, file.module, file.locale);
        normalized.metadata = normalizeMetadata(normalized.metadata);
        normalized.structured = normalizeStructuredNode(normalized.structured);
        return [normalized.key, normalized];
      })
    );

    entries.push({ module: file.module, locale: file.locale, messages });
  }

  const locales = [...new Set(entries.map((e) => e.locale))].sort();
  const modules = [...new Set(entries.map((e) => e.module))].sort();

  return { locales, modules, entries };
}
