import { relative } from "node:path";
import { scanLocalizationFiles } from "./scan-localization-files";
import { parseModuleLocale } from "./parse-module-locale";

export interface LocalizationFileIndexEntry {
  filePath: string;
  relativePath: string;
  module: string;
  locale: string;
}

export async function buildFileIndex(
  cwd: string,
  inputDir: string,
  ext = "json"
): Promise<LocalizationFileIndexEntry[]> {
  const files = await scanLocalizationFiles(inputDir, ext);
  return files.map((filePath) => ({
    filePath,
    relativePath: relative(cwd, filePath),
    ...parseModuleLocale(filePath),
  }));
}
