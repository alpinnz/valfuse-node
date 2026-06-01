<script setup lang="ts">
import type { Role } from "../types/user-form.types";

const props = defineProps<{
  modelValue: Role | null;
  options: Role[];
  error?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Role | null];
  blur: [];
}>();
</script>

<template>
  <div style="margin-bottom: 1rem;">
    <label style="display: block; margin-bottom: 0.25rem;">Role</label>

    <div
      :style="{
        border: props.error ? '1px solid red' : '1px solid #ccc',
        borderRadius: '4px',
        padding: '0.5rem',
      }"
    >
      <!-- trigger blur proxy -->
      <button
        type="button"
        style="background: none; border: none; cursor: pointer; padding: 0;"
        @blur="emit('blur')"
      >
        {{ props.modelValue ? props.modelValue.name : "Pilih role" }}
      </button>

      <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
        <button
          v-for="role in props.options"
          :key="role.id"
          type="button"
          :style="{
            padding: '0.25rem 0.75rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            background: props.modelValue?.id === role.id ? '#e0e7ff' : '#fff',
          }"
          @click="emit('update:modelValue', role)"
        >
          {{ role.name }}
        </button>
      </div>

      <button
        v-if="props.modelValue"
        type="button"
        style="margin-top: 0.5rem; font-size: 0.75rem; color: red; background: none; border: none; cursor: pointer;"
        @click="emit('update:modelValue', null)"
      >
        Hapus pilihan
      </button>
    </div>

    <p
      v-if="props.error"
      role="alert"
      style="color: red; margin: 0.25rem 0 0; font-size: 0.875rem;"
    >
      {{ props.error }}
    </p>
  </div>
</template>

