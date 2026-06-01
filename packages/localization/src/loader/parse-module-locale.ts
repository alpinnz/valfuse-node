import { basename, dirname } from "node:path";

export function parseModuleLocale(
  filePath: string
): { module: string; locale: string } {
  const module = basename(dirname(filePath));
  const locale = basename(filePath).replace(/\.json$/u, "");
  if (!module || !locale) {
    throw new Error(`Could not parse module/locale from path: ${filePath}`);
  }
  return { module, locale };
}

