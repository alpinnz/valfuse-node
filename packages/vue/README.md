# @valfuse-node/vue

> Vue 3 adapter for `@valfuse-node` — `useValfuseForm` composable for type-safe form validation.

## Installation

```bash
npm install @valfuse-node/vue @valfuse-node/core
```

**Peer dependency:** `vue >= 3`

## Features

- 🟢 **`useValfuseForm`** — Vue 3 composable powered by `@valfuse-node/core`
- 📡 **Reactive `formState`** — computed getters for `errors`, `isValid`, `isDirty`, `isSubmitting`
- 🔒 **Fully type-safe** — field names, errors, and values are TypeScript-inferred
- 🎛️ **Native v-model** — `register()` returns `{ name, modelValue, "onUpdate:modelValue", onBlur }`
- 🔁 **`watch()`** — subscribe to any field change reactively

## Quick Start

```vue
<script setup lang="ts">
import { createSchema } from "@valfuse-node/core";
import { useValfuseForm } from "@valfuse-node/vue";

const schema = createSchema({
  email: { type: "string", rules: { required: true, email: true } },
  password: { type: "string", rules: { required: true, minLength: 8 } },
});

const form = useValfuseForm({ schema, mode: "onSubmit" });

async function onSubmit(values: Record<string, unknown>) {
  await loginApi(values);
}
</script>

<template>
  <form @submit.prevent="form.handleSubmit(onSubmit)">
    <input v-bind="form.register('email')" />
    <span v-if="form.formState.errors.email">
      {{ form.formState.errors.email.message }}
    </span>

    <input type="password" v-bind="form.register('password')" />
    <span v-if="form.formState.errors.password">
      {{ form.formState.errors.password.message }}
    </span>

    <button type="submit" :disabled="form.formState.isSubmitting">
      Log in
    </button>
  </form>
</template>
```

## API

### `useValfuseForm(props)`

| Prop | Type | Description |
|---|---|---|
| `schema` | `ValfuseSchema` | Validation schema from `@valfuse-node/core` |
| `mode` | `"onSubmit" \| "onChange" \| "onBlur"` | When validation triggers |
| `defaultValues` | `Record<string, unknown>` | Initial field values |

**Returns:**

| Property | Description |
|---|---|
| `register(name)` | Returns `{ name, modelValue, "onUpdate:modelValue", onBlur }` |
| `formState` | Reactive `{ errors, isValid, isDirty, isSubmitting, dirtyFields, touchedFields }` |
| `handleSubmit(fn)` | Validates and calls `fn(values)` on success |
| `watch(name?, cb)` | Subscribe to field changes; returns unsubscribe function |
| `getValue(name)` | Read current field value |
| `setValue(name, value)` | Imperatively set a field value |
| `setErrors(errors)` | Set server-side errors |
| `clearErrors(name?)` | Clear one or all errors |
| `reset(values?)` | Reset form to default or provided values |
| `getValues()` | Return a snapshot of all current values |

## License

[MIT](./LICENSE)

