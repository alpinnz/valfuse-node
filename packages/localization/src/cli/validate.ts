import { resolve as absolutePath } from "node:path";
import { loadConfig } from "../config/load-config";
import { compileProject } from "../compiler/compile-project";
import { renderTerminalReport } from "../diagnostics/render-terminal-report";

export async function runValidate(options: { cwd?: string } = {}): Promise<void> {
  const cwd = absolutePath(options.cwd ?? process.cwd());
  const config = await loadConfig(cwd);
  const compiled = await compileProject(cwd, config);
  const report = renderTerminalReport(compiled.diagnostics);

  if (report !== "No diagnostics.") {
    // eslint-disable-next-line no-console
    console.log(report);
  }
  if (
    compiled.diagnostics.some((d) => d.severity === "error") &&
    config.strict
  ) {
    throw new Error("Localization validation failed.");
  }
}

