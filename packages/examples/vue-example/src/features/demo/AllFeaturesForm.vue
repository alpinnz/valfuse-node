<script setup lang="ts">
import { ref } from "vue";
import type { ValfuseFormMode } from "@valfuse-node/vue";
import AllFeaturesFormInner from "./AllFeaturesFormInner.vue";

// ─── Modes yang tersedia di Vue adapter (parity dengan React) ────────────────
const ALL_MODES: ValfuseFormMode[] = ["onSubmit", "onBlur", "onChange", "onTouched", "all"];

const MODE_DESC: Record<ValfuseFormMode, string> = {
  onSubmit: "validasi hanya saat submit",
  onBlur: "validasi saat field blur",
  onChange: "validasi setiap perubahan",
  onTouched: "validasi saat field pertama kali di-blur",
  all: "onChange + onBlur",
};

const mode = ref<ValfuseFormMode>("onSubmit");
</script>

<template>
  <div>
    <!-- Mode selector ────────────────────────────────────────────────────── -->
    <div
      style="margin-bottom: 1.5rem; padding: 0.75rem 1rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;"
    >
      <strong style="font-size: 0.875rem;">Validation Mode:</strong>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
        <label
          v-for="m in ALL_MODES"
          :key="m"
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '4px 10px',
            borderRadius: '6px',
            background: mode === m ? '#2563eb' : '#fff',
            color: mode === m ? '#fff' : '#374151',
            border: '1px solid',
            borderColor: mode === m ? '#2563eb' : '#d1d5db',
            fontSize: '0.82rem',
            fontFamily: 'monospace',
          }"
        >
          <input
            type="radio"
            name="all-features-mode"
            :value="m"
            :checked="mode === m"
            style="display: none;"
            @change="mode = m"
          />
          {{ m }}
        </label>
      </div>
      <p style="margin: 0.5rem 0 0; font-size: 0.78rem; color: #1e40af;">
        <strong>{{ mode }}</strong>: {{ MODE_DESC[mode] }} —
        <em>Mengganti mode akan me-reset form (re-mount via <code>:key</code>).</em>
      </p>
    </div>

    <!-- :key="mode" memaksa AllFeaturesFormInner remount saat mode berganti -->
    <AllFeaturesFormInner :key="mode" :mode="mode" />
  </div>
</template>

