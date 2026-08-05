<script setup lang="ts">
// TextInput — wrapper input yang kompatibel dengan v-bind="form.register('field')"
// register() meng-emit: { name, modelValue, "onUpdate:modelValue", onBlur }
defineProps<{
  modelValue: unknown;
  label: string;
  error?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  type?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
  blur: [];
}>();
</script>

<template>
  <div style="margin-bottom: 1rem">
    <label :for="id" style="display: block; margin-bottom: 0.25rem">{{ label }}</label>

    <input
      :id="id"
      :name="name"
      :type="type ?? 'text'"
      :value="modelValue as string"
      :placeholder="placeholder"
      :style="{
        border: error ? '1px solid red' : '1px solid #ccc',
        padding: '0.5rem',
        borderRadius: '4px',
        width: '100%',
        boxSizing: 'border-box',
        fontSize: '0.875rem',
      }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur')"
    />

    <p v-if="error" role="alert" style="color: red; margin: 0.25rem 0 0; font-size: 0.875rem">
      {{ error }}
    </p>
  </div>
</template>
