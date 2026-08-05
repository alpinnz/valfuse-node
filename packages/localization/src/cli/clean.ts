import { resolve as absolutePath } from "node:path";
import { loadConfig } from "../config/load-config";
import { cleanOutput } from "../emitter/clean-output";

export async function runClean(options: { cwd?: string } = {}): Promise<void> {
  const cwd = absolutePath(options.cwd ?? process.cwd());
  const config = await loadConfig(cwd);
  await cleanOutput(cwd, config);
  // eslint-disable-next-line no-console
  console.log("✅ Localization output cleaned.");
}
