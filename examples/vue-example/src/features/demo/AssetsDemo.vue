<script setup lang="ts">
import { assets, type AssetPath } from "../../assets/assets";

const assetExamples: Array<{ label: string; path: AssetPath }> = [
  { label: "Brand mark from public/assets", path: assets.brand.valfuse },
  { label: "Nested icon from public/assets", path: assets.icons.check },
];
</script>

<template>
  <div>
    <p>
      <code>@valfuse-node/assets</code> scans public files and generates a typed URL registry in
      <code>src/assets/assets.ts</code>.
    </p>
    <div style="display: flex; flex-wrap: wrap; gap: 1rem">
      <figure
        v-for="asset in assetExamples"
        :key="asset.path"
        style="
          align-items: center;
          border: 1px solid #cbd5e1;
          border-radius: 0.75rem;
          display: flex;
          gap: 0.75rem;
          margin: 0;
          max-width: 25rem;
          padding: 1rem;
        "
      >
        <img :src="asset.path" alt="" width="48" height="48" />
        <figcaption>
          <strong>{{ asset.label }}</strong>
          <br />
          <code>{{ asset.path }}</code>
        </figcaption>
      </figure>
    </div>
  </div>
</template>
