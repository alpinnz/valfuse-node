import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve as absolutePath } from "node:path";

const EN_TEMPLATE = `{
  "@@module": "common",
  "@@locale": "en",
  "strings": {
    "app_title": "My App"
  },
  "simple": {
    "hello": "Hello"
  },
  "placeholders": {
    "welcome_user": "Welcome, {name}!"
  }
}\n`;

const ID_TEMPLATE = `{
  "@@module": "common",
  "@@locale": "id",
  "strings": {
    "app_title": "Aplikasi Saya"
  },
  "simple": {
    "hello": "Halo"
  },
  "placeholders": {
    "welcome_user": "Selamat datang, {name}!"
  }
}\n`;

export async function runInit(options: { cwd?: string } = {}): Promise<void> {
  const cwd = absolutePath(options.cwd ?? process.cwd());
  const baseDir = join(cwd, "assets/localizations/common");
  await mkdir(baseDir, { recursive: true });
  await writeFile(join(baseDir, "en.json"), EN_TEMPLATE, "utf8");
  await writeFile(join(baseDir, "id.json"), ID_TEMPLATE, "utf8");
  // eslint-disable-next-line no-console
  console.log(`✅ Initialized localization files in ${baseDir}`);
}

