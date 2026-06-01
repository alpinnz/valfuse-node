import { resolve as absolutePath } from "node:path";
import { writeFile } from "node:fs/promises";
import { loadConfig } from "../config/load-config";
import { compileProject } from "../compiler/compile-project";
import { buildCoverageJson } from "../coverage/build-coverage-json";
import { buildCoverageHtml } from "../coverage/build-coverage-html";

export async function runCoverage(
  options: { cwd?: string; format?: "json" | "html"; output?: string } = {}
): Promise<void> {
  const cwd = absolutePath(options.cwd ?? process.cwd());
  const config = await loadConfig(cwd);
  const compiled = await compileProject(cwd, config);
  const coverage = buildCoverageJson(compiled.manifest);
  const format = options.format ?? "json";

  if (format === "html") {
    const output = options.output ?? "coverage.html";
    await writeFile(absolutePath(cwd, output), buildCoverageHtml(coverage), "utf8");
    // eslint-disable-next-line no-console
    console.log(`✅ Coverage HTML written to ${output}`);
    return;
  }

  const output = options.output ?? "coverage.json";
  await writeFile(
    absolutePath(cwd, output),
    `${JSON.stringify(coverage, null, 2)}\n`,
    "utf8"
  );
  // eslint-disable-next-line no-console
  console.log(`✅ Coverage JSON written to ${output}`);
}

