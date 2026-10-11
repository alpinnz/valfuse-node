<script setup lang="ts">
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
];
</script>

<template>
  <div>
    <p>
      Standalone CLI Node.js berjalan sebelum dev, build, dan typecheck. Output-nya dipakai aplikasi
      ini; barrel hasil generate menjadi entry import untuk semua demo section. Barrel dibuat
      melalui CLI publik <code>valfuse-barrel</code>.
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
      Runtime facade diakses dari <code>@valfuse-node/core</code>. Jalankan
      <code>npm run generate:check</code> untuk memastikan output generated sesuai dengan input.
    </p>
  </div>
</template>
