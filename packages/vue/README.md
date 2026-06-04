# @valfuse-node/vue

> Vue 3 adapter for `@valfuse-node` — `useValfuseForm` composable with reactive `formState`, native v-model bindings, and a 1:1 API contract with the React adapter.

```bash
npm install @valfuse-node/vue @valfuse-node/core
```

**Peer dependency:** `vue >= 3`

If you want a single install, use the umbrella package:

```bash
npm install @valfuse-node/core
```

---

## Table of Contents

- [Quick Start](#quick-start)
- [`useValfuseForm(options)`](#usevalfuseformoptions)
- [Reactive `formState`](#reactive-formstate)
- [`form.register(name)` — Vue v-model binding](#formregistername--vue-v-model-binding)
- [`form.handleSubmit(onValid)`](#formhandlesubmitonvalid)
- [`form.setErrors` / `form.clearErrors`](#formseterrors--formclearerrors)
- [`form.setValue` / `form.getValue` / `form.getValues`](#formsetvalue--formgetvalue--formgetvalues)
- [`form.trigger`](#formtrigger)
- [`form.watch(...)` — multi-overload](#formwatch--multi-overload)
- [`form.reset(values?)`](#formresetvalues)
- [`form.control`](#formcontrol)
- [Custom Inputs](#custom-inputs)
- [API Parity vs React](#api-parity-vs-react)
- [Type Reference](#type-reference)
- [Development Usage](#development-usage)
- [License](#license)

---

## Quick Start

```vue
<script setup lang="ts">
import { createSchema } from "@valfuse-node/core";
import { useValfuseForm } from "@valfuse-node/vue";

const schema = createSchema({
  email:    { type: "string", rules: [{ name: "required", error: { message: "Required" } }, { name: "email", error: { message: "Invalid" } }] },
  password: { type: "string", rules: [{ name: "required", error: { message: "Required" } }, { name: "minLength", value: 8, error: { message: "Min 8" } }] },
});

type LoginValues = { email: string; password: string };

const form = useValfuseForm<LoginValues>({
  schema,
  defaultValues: { email: "", password: "" },
});

async function onSubmit(values: LoginValues) {
  await loginApi(values);
}
</script>

<template>
  <form @submit="form.handleSubmit(onSubmit)">
    <input v-bind="form.register('email')" />
    <span v-if="form.formState.errors.email">
      {{ form.formState.errors.email.message }}
    </span>

    <input type="password" v-bind="form.register('password')" />
    <span v-if="form.formState.errors.password">
      {{ form.formState.errors.password.message }}
    </span>

    <button type="submit" :disabled="form.formState.isSubmitting">Log in</button>
  </form>
</template>
```

---

## `useValfuseForm(options)`

```ts
function useValfuseForm<TFieldValues extends Record<string, unknown>>(
  options: UseValfuseFormProps<TFieldValues>
): UseValfuseFormReturn<TFieldValues>;
```

### Options

```ts
interface UseValfuseFormProps<TFieldValues> {
  schema: ValfuseSchema;                                       // required
  defaultValues: TFieldValues;                                  // required (inferred)
  mode?: "onSubmit" | "onChange" | "onBlur" | "onTouched" | "all";  // default: "onSubmit"
  reValidateMode?: "onChange" | "onBlur" | "onSubmit";         // default: "onChange"
}
```

| Option | Type | Default | Notes |
|---|---|---|---|
| `schema` | `ValfuseSchema` | — (required) | The rule-based schema from `@valfuse-node/form` |
| `defaultValues` | object literal | — (required) | The generic `TFieldValues` is **inferred** from this |
| `mode` | union | `"onSubmit"` | When validation first runs |
| `reValidateMode` | union | `"onChange"` | Mode used after the first submit attempt to re-validate fields the user fixes |

### Return value

```ts
interface UseValfuseFormReturn<TFieldValues> {
  formState:   ValfuseFormState<TFieldValues>;   // reactive
  control:     ValfuseFormControl<TFieldValues>;
  register:    (name) => { name, modelValue, "onUpdate:modelValue", onBlur };
  handleSubmit:(onValid) => (e: Event) => Promise<void>;
  setErrors:   (errors) => void;
  clearErrors: (fields?) => void;
  setValue:    (name, value) => void;
  getValue:    (name) => TFieldValues[TName];
  getValues:   () => TFieldValues;
  trigger:     (name?) => boolean;
  watch:       ValfuseVueWatchFunction<TFieldValues>;
  reset:       (values?) => void;
}
```

---

## Reactive `formState`

`formState` is a `reactive()` proxy — every field is a getter so Vue tracks reads and triggers re-renders.

| Field | Type | Description |
|---|---|---|
| `errors` | `Partial<Record<keyof T, ValfuseFieldError>>` | Current field errors |
| `isSubmitting` | `boolean` | `true` while the async submit handler is running |
| `isSubmitted` | `boolean` | `true` after the first submit attempt |
| `isSubmitSuccessful` | `boolean` | `true` if the most recent submit completed without throwing |
| `submitCount` | `number` | Total submit attempts |
| `isDirty` | `boolean` | `true` if any field differs from `defaultValues` |
| `isValid` | `boolean` | `true` when no errors are present |
| `dirtyFields` | `Partial<Record<keyof T, true>>` | Fields that differ from `defaultValues` |
| `touchedFields` | `Partial<Record<keyof T, true>>` | Fields the user has blurred |
| `defaultValues` | `Readonly<T>` | The defaults passed at composable initialization |

```vue
<template>
  <div v-if="form.formState.isSubmitting">Saving…</div>
  <div v-if="form.formState.isDirty">Unsaved changes</div>
  <pre>{{ form.formState.errors }}</pre>
</template>
```

---

## `form.register(name)` — Vue v-model binding

Returns Vue-native v-model props. Use `v-bind` to spread them onto an element.

```vue
<input v-bind="form.register('email')" />
<!--
  expands to:
    :name="email"
    :modelValue="email value"
    @update:modelValue="..."
    @blur="..."
-->
```

The shape is `{ name, modelValue, "onUpdate:modelValue", onBlur }`. This is **intentionally different** from the React adapter — Vue's idiomatic binding is v-model, not onChange.

---

## `form.handleSubmit(onValid)`

```vue
<script setup lang="ts">
const onSubmit = form.handleSubmit(async (values) => {
  // values: TFieldValues  (already transformed + validated)
  await api.save(values);
});
</script>

<template>
  <form @submit="onSubmit">…</form>
</template>
```

The handler:
1. Calls `e.preventDefault()` on the submit event
2. Validates the form
3. If valid → calls `onValid(values)` and sets `isSubmitting = true` for the duration
4. If invalid → sets `formState.errors` and returns

---

## `form.setErrors` / `form.clearErrors`

```ts
form.setErrors({ email: { message: "Account exists", code: "auth.duplicate" } });
form.clearErrors();                       // clear all
form.clearErrors(["email", "password"]);  // clear specific fields
```

`form.setErrors` accepts a `SetErrorsInput` — pass either a string (`{ email: "Required" }`) or a `ValfuseError` object (`{ email: { message, code, type } }`). Strings are normalized to objects automatically.

---

## `form.setValue` / `form.getValue` / `form.getValues`

```ts
form.setValue("email", "alice@example.com");

const current = form.getValue("email");
const all     = form.getValues();
```

`getValue` and `getValues` are **Vue-specific extensions** not present in the React adapter. They return snapshots — mutating them has no effect on the form.

---

## `form.trigger`

```ts
form.trigger();             // all fields
form.trigger("email");      // one field
form.trigger(["email", "password"]);  // many
// returns boolean — true if all triggered fields are valid
```

Diff-merges results into `formState.errors` without clobbering unrelated field errors.

---

## `form.watch(...)` — multi-overload

```ts
const all     = form.watch();                          // TFieldValues snapshot
const email   = form.watch("email");                   // TFieldValues["email"]
const pair    = form.watch(["email", "name"]);         // Array of values

const unsub = form.watch((values, info) => {           // subscribe to all changes
  console.log("changed:", info?.name, values);
});

const unsubField = form.watch("email", (value) => {    // legacy: subscribe to one field
  console.log("email is now", value);
});

// later
unsub();
unsubField();
```

> **Tip:** the `watch(callback)` form (global subscription) is preferred over the legacy `watch(name, callback)` form. The legacy form is preserved for backward compatibility.

---

## `form.reset(values?)`

```ts
form.reset();                  // back to defaultValues
form.reset({ email: "" });     // partial override
```

Resets values, errors, touched, dirty, **and** submission state (`isSubmitted`, `isSubmitSuccessful`, `submitCount`).

---

## `form.control`

Same shape as the React adapter's `control` — an opaque object you can pass to a future `<ValfuseController>` Vue equivalent. The `_values`, `_errors`, `_touchedFields` getters always return the latest snapshot.

```ts
form.control._values;          // current values
form.control._errors;          // current errors
form.control._touchedFields;   // ReadonlySet of touched field names
form.control._updateField(name, value);
form.control._touchField(name);
```

---

## Custom Inputs

Vue does not yet ship a `ValfuseController` component, so custom inputs use `form.getValue` / `form.setValue` directly.

```vue
<script setup lang="ts">
const role = computed({
  get: () => form.getValue("role") as string,
  set: (v) => form.setValue("role", v),
});
</script>

<template>
  <select v-model="role">
    <option value="admin">Admin</option>
    <option value="user">User</option>
  </select>
</template>
```

This works because `form.getValue` reads the latest value and `form.setValue` writes through the same internal store that `form.register` uses, so dirty/touched/watch all stay in sync.

---

## API Parity vs React

| Feature | React (`@valfuse-node/react`) | Vue (`@valfuse-node/vue`) |
|---|---|---|
| Field binding | `{...form.register('f')}` (JSX spread) | `v-bind="form.register('f')"` |
| Custom field | `<ValfuseController>` + `form.control` | `getValue` / `setValue` (no controller yet) |
| Watch snapshot | `form.watch()` | `form.watch()` |
| Watch subscribe (global) | `form.watch((values, info) => …)` | `form.watch((values, info) => …)` |
| Watch subscribe (one field) | `form.watch("email", cb)` | `form.watch("email", cb)` (legacy) |
| Watch subscribe (multi) | `form.watch(["a", "b"], cb)` | — use multiple single-field subscriptions |
| Manual trigger | `form.trigger()` | `form.trigger()` |
| Localization runtime | `<LocalizationProvider>` + `useLocalization()` | — not provided; use the underlying `@valfuse-node/localization` package |
| Mode values | `onSubmit \| onChange \| onBlur \| onTouched \| all` | `onSubmit \| onChange \| onBlur \| onTouched \| all` |

The form contract (`UseValfuseFormReturn`) is **identical at the type level** between React and Vue, so the same schema and the same `defaultValues` can be reused across adapters.

---

## Type Reference

```ts
import type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFormMode,
  ValfuseFormState,
  ValfuseRegisterReturn,
} from "@valfuse-node/vue";
```

---

## Development Usage

### Share a schema across web (React) and mobile (Vue)

```ts
// schemas/user.ts
import { createSchema } from "@valfuse-node/form";

export const userSchema = createSchema({
  name:  { type: "string", rules: [{ name: "required", error: { message: "Required" } }] },
  email: { type: "string", rules: [{ name: "required", error: { message: "Required" } }, { name: "email", error: { message: "Invalid" } }] },
});

export type UserValues = { name: string; email: string };
```

```vue
<!-- Vue component -->
<script setup lang="ts">
import { useValfuseForm } from "@valfuse-node/vue";
import { userSchema, type UserValues } from "~/schemas/user";

const form = useValfuseForm<UserValues>({
  schema: userSchema,
  defaultValues: { name: "", email: "" },
  mode: "onBlur",
});
</script>
```

### Use a validation mode that matches UX intent

```ts
// Aggressive — validates on every keystroke
useValfuseForm({ schema, defaultValues, mode: "onChange" });

// Friendly — validates on blur (recommended for most forms)
useValfuseForm({ schema, defaultValues, mode: "onBlur" });

// Lazy — only validates on submit
useValfuseForm({ schema, defaultValues, mode: "onSubmit" });
```

### Inject server errors

```ts
async function onSubmit(values: UserValues) {
  try {
    await api.saveUser(values);
  } catch (err) {
    form.setErrors({
      email: { message: "Email is already taken", code: "auth.duplicate", type: "server" },
    });
  }
}
```

### Build a reactive debug panel

```vue
<script setup lang="ts">
import { computed } from "vue";

const values = computed(() => form.getValues());
const dirty  = computed(() => form.formState.dirtyFields);
</script>

<template>
  <pre>values: {{ values }}</pre>
  <pre>dirty:  {{ dirty }}</pre>
  <pre>valid:  {{ form.formState.isValid }}</pre>
</template>
```

---

## License

[MIT](../../LICENSE)
