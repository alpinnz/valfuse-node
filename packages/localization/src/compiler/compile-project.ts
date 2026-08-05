import type { LocalizationConfig } from "../types/config";
import type { RuntimeManifest } from "../types/manifest";
import { normalizeProject } from "../normalizer/normalize-project";
import { validateProject } from "../validator/validate-project";
import { buildManifest } from "./build-manifest";
import { buildReactRuntimeFiles } from "./build-react-runtime-files";
import type { Diagnostic } from "../types/diagnostics";

export interface CompiledProject {
  manifest: RuntimeManifest;
  runtimeEntryFile: string;
  runtimeTypesFile: string;
  diagnostics: Diagnostic[];
  placeholders: Record<string, string[]>;
}

export async function compileProject(
  cwd: string,
  config: LocalizationConfig
): Promise<CompiledProject> {
  const normalized = await normalizeProject(cwd, config);
  const diagnostics = validateProject(normalized, config);
  const manifest = buildManifest(normalized, config);

  // Currently only React runtime files are generated in the examples/react-example.
  // Vue/Nest templates are not included in adapter-react scope.
  const files = buildReactRuntimeFiles(manifest);

  const placeholders = Object.fromEntries(
    manifest.entries
      .filter((entry) => entry.placeholders.length > 0)
      .map((entry): [string, string[]] => [entry.key, entry.placeholders])
      .sort(([a], [b]) => a.localeCompare(b))
  );

  return {
    manifest,
    runtimeEntryFile: files.entry,
    runtimeTypesFile: files.types,
    diagnostics,
    placeholders,
  };
}
