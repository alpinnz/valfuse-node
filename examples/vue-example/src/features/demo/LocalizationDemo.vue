<script setup lang="ts">
import { computed, ref } from "vue";
import { useLocalization } from "@valfuse-node/vue";

const { locale, setLocale, translate, format, plural, manifest } = useLocalization();
const assetCount = ref(2);

const welcomeMessage = computed(() => format("common.welcome", { name: "Valfuse" }));
const runtimeNote = computed(() => translate("common.runtime_note"));
const assetCountMessage = computed(() => plural("common.asset_count", assetCount.value));

function selectLocale(event: Event): void {
  setLocale((event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div style="display: grid; gap: 1rem; max-width: 34rem">
    <p>{{ runtimeNote }}</p>
    <label style="display: grid; gap: 0.4rem">
      Locale
      <select :value="locale" @change="selectLocale">
        <option
          v-for="availableLocale in manifest.locales"
          :key="availableLocale"
          :value="availableLocale"
        >
          {{ availableLocale }}
        </option>
      </select>
    </label>
    <label style="display: grid; gap: 0.4rem">
      Selected assets
      <input v-model.number="assetCount" min="0" type="number" />
    </label>
    <output
      aria-live="polite"
      style="border: 1px solid #cbd5e1; border-radius: 0.5rem; padding: 1rem"
    >
      <strong>{{ welcomeMessage }}</strong>
      <br />
      {{ assetCountMessage }}
    </output>
  </div>
</template>
