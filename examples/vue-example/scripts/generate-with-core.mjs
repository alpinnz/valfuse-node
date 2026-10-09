import { generateAssets } from "@valfuse-node/core/assets";
import { generateBarrel } from "@valfuse-node/core/barrel";
import process from "node:process";

const cwd = process.cwd();
const check = process.argv.includes("--check");

const assetsResult = await generateAssets({
  cwd,
  config: {
    inputDir: "public/assets",
    outputFile: "src/assets/assets.ts",
    basePath: "/assets",
  },
  check,
});

const barrelResult = await generateBarrel({
  cwd,
  config: {
    inputDir: "src/features/demo",
    outputFile: "src/features/demo/index.ts",
    include: [
      "all-features-form.ts",
      "assets-demo.ts",
      "form-domain-demo.ts",
      "generator-demo.ts",
      "localization-demo.ts",
    ],
  },
  check,
});

process.stdout.write(
  `${check ? "Checked" : "Generated"} ${assetsResult.assetCount} asset paths and ${barrelResult.moduleCount} barrel modules.` +
    "\n"
);
