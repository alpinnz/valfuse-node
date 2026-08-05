# @valfuse-node/react

> React 18+ adapter for `@valfuse-node` — `useValfuseForm` hook, `<ValfuseController>`, full localization runtime (provider, hooks, storage strategies, SSR helpers). No external form library dependency.

```bash
npm install @valfuse-node/react @valfuse-node/core
```

**Peer dependencies:** `react >= 18`, `react-dom >= 18`

If you want a single install, use the umbrella package:

```bash
npm install @valfuse-node/core
```

---

## Table of Contents

- [Quick Start](#quick-start)
- [`useValfuseForm(options)`](#usevalfuseformoptions)
- [`ValfuseController`](#valfusecontroller)
- [Localization Runtime](#localization-runtime)
  - [`LocalizationProvider`](#localizationprovider)
  - [`useLocalization(options?)` — full localizer API](#uselocalizationoptions--full-localizer-api)
  - [`useLocalizationTree()`](#uselocalizationtree)
  - [Storage strategies](#storage-strategies)
  - [`createLocalizationStore`](#createlocalizationstore)
  - [`createLazyLocaleLoader`](#createlazyloacaleloader)
  - [`createSsrLocalizationState`](#createssrlocalizationstate)
- [Type Reference](#type-reference)
- [Development Usage](#development-usage)
- [License](#license)

---

## Quick Start

```tsx
import { createSchema } from "@valfuse-node/core";
import { useValfuseForm } from "@valfuse-node/react";

const schema = createSchema({
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required" } },
      { name: "email", error: { message: "Invalid" } },
    ],
  },
  password: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required" } },
      { name: "minLength", value: 8, error: { message: "Min 8 chars" } },
    ],
  },
});

export function LoginForm() {
  const form = useValfuseForm({ schema, defaultValues: { email: "", password: "" } });

  const handleSubmit = form.handleSubmit(async (values) => {
    await loginApi(values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <input {...form.register("email")} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}

      <input type="password" {...form.register("password")} />
      {form.formState.errors.password && <span>{form.formState.errors.password.message}</span>}

      <button type="submit" disabled={form.formState.isSubmitting}>
        Log in
      </button>
    </form>
  );
}
```

---

## `useValfuseForm(options)`

```ts
function useValfuseForm<TFieldValues extends Record<string, unknown>>(
  props: UseValfuseFormProps<TFieldValues>
): UseValfuseFormReturn<TFieldValues>;
```

### Options

```ts
interface UseValfuseFormProps<TFieldValues> {
  schema: ValfuseSchema; // required — from @valfuse-node/form
  defaultValues: TFieldValues; // required — values shape (inferred)
  mode?: "onSubmit" | "onChange" | "onBlur"; // default: "onSubmit"
  reValidateMode?: "onChange" | "onBlur" | "onSubmit"; // default: "onChange"
}
```

| Option           | Type            | Default      | Notes                                                                                                                                |
| ---------------- | --------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `schema`         | `ValfuseSchema` | — (required) | The rule-based schema                                                                                                                |
| `defaultValues`  | object literal  | — (required) | The generic `TFieldValues` is **inferred** from this. The same shape flows through `form.handleSubmit(fn)`, `formState.errors`, etc. |
| `mode`           | union           | `"onSubmit"` | When validation first runs. `"onChange"` validates on every keystroke; `"onBlur"` validates when a field loses focus                 |
| `reValidateMode` | union           | `"onChange"` | Mode used **after the first submit attempt** to re-validate fields the user fixes                                                    |

### Return value

```ts
interface UseValfuseFormReturn<TFieldValues> {
  register: (name) => { name; value; onChange; onBlur; ref };
  control: ValfuseFormControl<TFieldValues>;
  formState: ValfuseFormState<TFieldValues>;
  handleSubmit: (onValid) => (e?) => Promise<void>;
  setErrors: (errors) => void;
  clearErrors: (fields?) => void;
  setValue: (name, value, options?) => void;
  trigger: (name?) => boolean;
  watch: ValfuseWatchFunction<TFieldValues>;
  reset: (values?) => void;
}
```

### `form.register(name)`

Returns props to spread onto an `<input>`:

```tsx
<input {...form.register("email")} />
// expands to: name="email" value={...} onChange={...} onBlur={...}
```

### `form.formState`

| Field                | Type                                          | Description                                                 |
| -------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| `errors`             | `Partial<Record<keyof T, ValfuseFieldError>>` | Current field errors (validation + server + manual)         |
| `isSubmitting`       | `boolean`                                     | `true` while the async submit handler is running            |
| `isSubmitted`        | `boolean`                                     | `true` after the first submit attempt                       |
| `isSubmitSuccessful` | `boolean`                                     | `true` if the most recent submit completed without throwing |
| `submitCount`        | `number`                                      | Total submit attempts                                       |
| `isDirty`            | `boolean`                                     | `true` if any field differs from `defaultValues`            |
| `isValid`            | `boolean`                                     | `true` when no errors are present                           |
| `dirtyFields`        | `Partial<Record<keyof T, true>>`              | Fields that differ from `defaultValues`                     |
| `touchedFields`      | `Partial<Record<keyof T, true>>`              | Fields the user has blurred                                 |
| `defaultValues`      | `Readonly<T>`                                 | The defaults passed at hook initialization                  |

### `form.handleSubmit(onValid)`

```tsx
const onSubmit = form.handleSubmit(async (values) => {
  // values: TFieldValues  (already transformed + validated)
  await api.save(values);
});

return <form onSubmit={onSubmit}>…</form>;
```

Validates first; calls `onValid(values)` only when validation passes. Sets `isSubmitting = true` for the duration of the (possibly async) handler.

### `form.setErrors(errors)` / `form.clearErrors(fields?)`

```tsx
form.setErrors({ email: { message: "Account exists", code: "auth.duplicate" } });
form.clearErrors(); // clear all
form.clearErrors("email"); // clear one
form.clearErrors(["email", "password"]); // clear many
```

### `form.setValue(name, value, options?)`

Programmatically set a field value:

```tsx
form.setValue("email", "alice@example.com");
form.setValue("email", "alice@example.com", { shouldValidate: true });
```

By default, setting a value **does not** trigger validation. Pass `{ shouldValidate: true }` to run validation immediately.

### `form.trigger(name?)`

Manually trigger validation:

```tsx
form.trigger(); // all fields
form.trigger("email"); // one field
form.trigger(["email", "password"]); // many
// returns boolean — true if all triggered fields are valid
```

### `form.watch(...)` — multi-overload

```tsx
const all = form.watch(); // TFieldValues snapshot
const email = form.watch("email"); // TFieldValues["email"]
const pair = form.watch(["email", "name"]); // Array of values

const unsub = form.watch((values, info) => {
  // subscribe
  console.log("changed:", info?.name, values);
});

// later
unsub();
```

### `form.reset(values?)`

```tsx
form.reset(); // back to defaultValues
form.reset({ email: "" }); // partial override
```

Resets values, errors, touched, dirty, and submission state.

### `form.control`

Opaque control object — pass it to `<ValfuseController>` for custom inputs.

---

## `ValfuseController`

For controlled inputs that don't work with `register` (custom select, date picker, checkbox group, etc.).

```tsx
import { useValfuseForm, ValfuseController } from "@valfuse-node/react";

const form = useValfuseForm({ schema, defaultValues: { role: "" } });

<ValfuseController
  control={form.control}
  name="role"
  render={({ field, fieldState }) => (
    <RoleSelect
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )}
/>;
```

### Render-prop shape

```ts
interface ValfuseControllerRenderProps<T, TName extends keyof T & string> {
  field: {
    name: string;
    value: T[TName];
    onChange: (value: T[TName]) => void; // receives raw value, not a DOM event
    onBlur: () => void;
  };
  fieldState: {
    error?: ValfuseFieldError;
    isTouched: boolean;
  };
}
```

> **Stable references:** the `field` and `fieldState` objects are memoized per-name. Unrelated field updates do not invalidate the props passed to the render child — `React.memo`'d inputs won't re-render unnecessarily.

---

## Localization Runtime

### `LocalizationProvider`

```tsx
import { LocalizationProvider, localStorageStrategy } from "@valfuse-node/react";
import localization from "./assets/localizations/localization.manifest.json";

<LocalizationProvider
  manifest={localization}
  storage={localStorageStrategy({ key: "app-locale" })}
  initialLocale="en"
>
  <App />
</LocalizationProvider>;
```

| Prop            | Type              | Description                                                          |
| --------------- | ----------------- | -------------------------------------------------------------------- |
| `manifest`      | `RuntimeManifest` | The generated manifest JSON                                          |
| `initialLocale` | `string`          | Locale to use when no value is stored. Must be in `manifest.locales` |
| `storage`       | `LocaleStorage`   | Pluggable persistence (defaults to no persistence — in-memory only)  |

The provider resolves the initial locale in this order: **storage value** → `initialLocale` → `manifest.base_locale`.

### `useLocalization(options?)` — full localizer API

```tsx
import { useLocalization } from "@valfuse-node/react";

const {
  // Translation methods
  translate,
  translateOrNull,
  format,
  formatOrNull,
  plural,
  pluralOrNull,
  gender,
  context,
  namespace,

  // Iteration
  entriesForLocale,

  // Provider context
  locale,
  setLocale,
  store,
  manifest,
} = useLocalization();
```

#### `translate(key, fallback?)`

```tsx
translate("common.welcome"); // → "Hello!"
translate("common.missing", "Default greeting"); // → "Default greeting"
translate("common.missing", null); // → key (returns key when missing & no fallback)
```

#### `translateOrNull(key)` — null-safe variant

```tsx
translateOrNull("common.welcome"); // → "Hello!"
translateOrNull("common.missing"); // → null
translateOrNull(null); // → null
translateOrNull(undefined); // → null
```

#### `format(key, params)` / `formatOrNull(key, params)`

```tsx
format("common.welcome", { name: "Alfin" }); // → "Hello, Alfin!"
formatOrNull("common.welcome", { name: "Alfin" }); // → "Hello, Alfin!" or null
```

#### `plural(key, count)` / `pluralOrNull(key, count)`

```tsx
plural("common.items.count", 0); // → "No items"
plural("common.items.count", 1); // → "1 item"
plural("common.items.count", 5); // → "5 items"
```

#### `gender(key, value, params)`

```tsx
gender("common.profile.followers", "male", { count: 3 }); // → "3 male followers"
gender("common.profile.followers", "female", { count: 3 }); // → "3 female followers"
gender("common.profile.followers", "other", { count: 3 }); // → "3 followers"
```

#### `context(key, value, params?)`

```tsx
context("common.word.open", "verb"); // → "Open the file"
context("common.word.open", "adjective", {}); // → "The file is open"
```

#### `namespace(scope)` — scoped sub-localizer

```tsx
const t = useLocalization().namespace("common.errors");
t.translate("required"); // looks up "common.errors.required"
t.format("min_length", { min: 8 });
t.plural("items.count", 5);
```

`namespace(scope)` returns a `NamespacedLocalizer` with the same 8 methods (`translate`, `translateOrNull`, `format`, `formatOrNull`, `plural`, `pluralOrNull`, `gender`, `context`), all automatically prefixed.

#### `entriesForLocale`

```tsx
const entries = useLocalization().entriesForLocale;
// → Array<[key, value]> sorted alphabetically by key
// Useful for building a search interface over your translations.
```

#### `locale` / `setLocale(locale)`

```tsx
const { locale, setLocale } = useLocalization();
setLocale("id"); // switch to Indonesian
console.log(locale); // → "id"
```

`setLocale` also writes the new value to the configured `storage` (if any).

#### `store`

Lower-level mutable store for when you want to bypass the hook overhead:

```ts
interface LocalizationStore {
  getLocale(): string;
  setLocale(locale: string): void;
  t(key: string, params?: Record<string, string | number>): string;
}
```

`store.t("common.welcome", { name: "Alfin" })` does a single lookup + interpolation.

#### `manifest`

The raw `RuntimeManifest` object you passed to the provider. Useful for introspection, building custom selectors, etc.

### `useLocalizationTree()`

Returns a nested object built from the manifest, with placeholders turned into functions:

```ts
const { strings, placeholders } = useLocalizationTree();

// strings.app.title              → "My App"
// strings.errors.required        → "This field is required"
// placeholders.welcome({ name })  → "Hello, {name}".replace("{name}", name)
```

Use it when you want a deeply-nested "namespace" shape (e.g. for I18n-style consumers) rather than flat keys.

### Storage strategies

| Strategy                   | Persistence             | SSR-safe | Options                                           |
| -------------------------- | ----------------------- | -------- | ------------------------------------------------- |
| `localStorageStrategy()`   | `window.localStorage`   | partial  | `{ key }` (default `"locale"`)                    |
| `sessionStorageStrategy()` | `window.sessionStorage` | partial  | `{ key }`                                         |
| `cookieStrategy({ … })`    | HTTP cookie             | yes      | `{ key, domain, path, maxAge, secure, sameSite }` |
| `memoryStrategy()`         | in-process memory       | yes      | `{ initialLocale }`                               |
| `composeStorage(a, b, …)`  | union of multiple       | mixed    | —                                                 |

```tsx
// Persist in BOTH a cookie (for SSR) and localStorage (for the client)
const storage = composeStorage(
  cookieStrategy({ domain: ".example.com" }),
  localStorageStrategy({ key: "locale" })
);

<LocalizationProvider manifest={manifest} storage={storage}>
  …
</LocalizationProvider>;
```

### `createLocalizationStore`

Build a standalone, mutable store (useful outside React):

```ts
import { createLocalizationStore } from "@valfuse-node/react";

const store = createLocalizationStore(manifest, "id");
store.t("common.welcome", { name: "Alfin" }); // → "Halo, Alfin!"
store.setLocale("en");
store.getLocale(); // → "en"
```

### `createLazyLocaleLoader`

```ts
import { createLazyLocaleLoader } from "@valfuse-node/react";

const loadLocale = createLazyLocaleLoader(manifest);
const enMessages = await loadLocale("en"); // → Record<string, string>
```

Useful for code-splitting per-locale payloads.

### `createSsrLocalizationState`

```ts
import { createSsrLocalizationState } from "@valfuse-node/react";

const ssrState = createSsrLocalizationState(manifest, "id");
// → { locale: "id", messages: { "common.welcome": "Halo, {name}!", … } }
```

Pre-render localized content on the server and pass `messages` + `locale` into the client provider to avoid a flash of incorrect locale.

---

## Type Reference

```ts
import type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFormMode,
  ValfuseFormState,
  ValfuseFormErrors,
  ValfuseFormControl,
  ValfuseFieldError,
  ValfuseRegisterReturn,
  ValfuseDirtyFields,
  ValfuseTouchedFields,
  ValfuseWatchCallback,
  ValfuseWatchFunction,
  ValfuseControllerProps,
  ValfuseControllerField,
  ValfuseControllerFieldState,
  ValfuseControllerRenderProps,
  LocalizationProviderProps,
  LocalizationContextValue,
  UseLocalizationOptions,
  NamespacedLocalizer,
  InterpolationParams,
  GenderVariant,
  TranslationFallback,
  LocalizationStore,
  LocaleStorage,
} from "@valfuse-node/react";
```

---

## Development Usage

### Set up the validation schema

The schema is shared with `@valfuse-node/form`. Define it once, reuse everywhere.

```ts
// schemas/user.ts
import { createSchema } from "@valfuse-node/form";

export const userSchema = createSchema({
  name: { type: "string", rules: [{ name: "required", error: { message: "Required" } }] },
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required" } },
      { name: "email", error: { message: "Invalid" } },
    ],
  },
  age: { type: "number", rules: [{ name: "min", value: 18, error: { message: "18+" } }] },
});

export type UserValues = {
  name: string;
  email: string;
  age: number;
};
```

### Build a form with all features

```tsx
import { useReactValfuseForm, ValfuseController } from "@valfuse-node/core";
import { userSchema, type UserValues } from "./schemas/user";

export function UserForm() {
  const form = useReactValfuseForm<UserValues>({
    schema: userSchema,
    defaultValues: { name: "", email: "", age: 0 },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await api.updateUser(values);
    } catch (err) {
      form.setErrors({
        email: { message: "Email already in use", code: "auth.duplicate", type: "server" },
      });
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register("name")} placeholder="Name" />
      {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}

      <input {...form.register("email")} placeholder="Email" />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}

      <ValfuseController
        control={form.control}
        name="age"
        render={({ field, fieldState }) => (
          <NumberPicker
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <button type="submit" disabled={form.formState.isSubmitting}>
        Save
      </button>
      <button type="button" onClick={() => form.reset()}>
        Reset
      </button>
      <pre>{JSON.stringify(form.watch(), null, 2)}</pre>
    </form>
  );
}
```

### Subscribe to field changes

```tsx
useEffect(() => {
  const unsub = form.watch("email", (value) => {
    console.log("email changed:", value);
  });
  return unsub;
}, [form]);
```

### Localize the form

```tsx
import { LocalizationProvider, useLocalization, localStorageStrategy } from "@valfuse-node/react";
import manifest from "./loc/manifest.json";

export function App() {
  return (
    <LocalizationProvider manifest={manifest} storage={localStorageStrategy()}>
      <UserForm />
    </LocalizationProvider>
  );
}

function UserFormHeader() {
  const { translate, locale, setLocale } = useLocalization();
  return (
    <header>
      <h1>{translate("user.form.title")}</h1>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="id">Bahasa Indonesia</option>
      </select>
    </header>
  );
}
```

---

## License

[MIT](../../LICENSE)
