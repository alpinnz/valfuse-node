<script setup lang="ts">
const coreImports = `import { generateAssets } from "@valfuse-node/core/assets";
import { generateBarrel } from "@valfuse-node/core/barrel";`;

const generators = [
  {
    packageName: "@valfuse-node/assets",
    command: "npm run assets:generate",
    output: "src/assets/assets.ts",
  },
  {
    packageName: "@valfuse-node/barrel",
    command: "npm run barrel:generate",
    output: "src/features/demo/index.ts",
  },
  {
    packageName: "@valfuse-node/localization",
    command: "npm run localization:generate",
    output: "src/assets/localizations/",
  },
  {
    packageName: "@valfuse-node/core/assets + @valfuse-node/core/barrel",
    command: "npm run codegen:core",
    output: "the same generated asset and barrel files through the Node.js API",
  },
];
</script>

<template>
  <div>
    <p>
      Standalone CLI Node.js berjalan sebelum dev, build, dan typecheck. Output-nya dipakai aplikasi
      ini; barrel hasil generate menjadi entry import untuk semua demo section. Perintah
      <code>codegen:core</code> menjalankan generator melalui subpath Node.js core.
    </p>
    <ul>
      <li
        v-for="generator in generators"
        :key="generator.packageName"
        style="margin-bottom: 0.75rem"
      >
        <strong>{{ generator.packageName }}</strong>
        <br />
        <code>{{ generator.command }}</code> menghasilkan <code>{{ generator.output }}</code
        >.
      </li>
    </ul>
    <p>
      Runtime facade diakses dari <code>@valfuse-node/core</code>. Generator filesystem tersedia
      pada subpath Node.js <code>@valfuse-node/core/assets</code> dan
      <code>@valfuse-node/core/barrel</code>.
    </p>
    <pre style="background: #f1f5f9; border-radius: 0.5rem; overflow-x: auto; padding: 1rem">{{
      coreImports
    }}</pre>
    <p>
      Jalankan <code>npm run generate:check</code> atau <code>npm run codegen:core:check</code>
      untuk memastikan output generated sesuai dengan input.
    </p>
  </div>
</template>
