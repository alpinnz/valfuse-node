<script setup lang="ts">
import { computed, ref } from "vue";
import {
  interpolate,
  lookupMessage,
  pickStructuredPluralVariant,
} from "@valfuse-node/localization/runtime";
import localizationManifest from "../../assets/localizations/localization";

const locale = ref(localizationManifest.base_locale);
const assetCount = ref(2);

const runtimeContext = computed(() => ({
  locale: locale.value,
  fallbackLocale: localizationManifest.fallback_locale,
  messages: localizationManifest.messages,
}));

const welcomeMessage = computed(() =>
  interpolate(lookupMessage(runtimeContext.value, "common.welcome"), { name: "Valfuse" })
);

const assetCountMessage = computed(() =>
  pickStructuredPluralVariant(
    lookupMessage(runtimeContext.value, "common.asset_count"),
    assetCount.value
  )
);
</script>

<template>
  <div style="display: grid; gap: 1rem; max-width: 34rem">
    <p>
      Vue adapter belum menyediakan provider localization. Demo ini memakai browser-safe runtime
      dari
      <code>@valfuse-node/localization/runtime</code> langsung.
    </p>
    <label style="display: grid; gap: 0.4rem">
      Locale
      <select v-model="locale">
        <option
          v-for="availableLocale in localizationManifest.locales"
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
