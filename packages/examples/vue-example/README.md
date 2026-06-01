# @valfuse-node/example-vue

Reference implementation dan playground untuk `valfuse-node` — Vue 3.

Package ini bukan production package. Digunakan sebagai:
- Reference implementation
- Manual playground
- Documentation by example

## Cara Menjalankan

### Prerequisites

Pastikan sudah menjalankan build dari root terlebih dahulu:

```bash
# Di root valfuse-node
npm install
npm run build
```

### Menjalankan Development Server

```bash
# Di root valfuse-node
npm run dev

# Atau langsung di package ini
cd packages/examples/vue-example
npm run dev
```

Server akan berjalan di `http://localhost:5174` (atau port berikutnya tersedia).

## Isi Example

### AllFeaturesForm

Demonstrasi lengkap semua API `useValfuseForm` di satu form:

- `register()` — spread ke komponen wrapper (`TextInput`) via `v-bind`
- `getValue` / `setValue` — binding manual untuk custom select
- `watch(name, cb)` — reactive per-field watcher dengan unsubscribe
- `setErrors()` — simulasi server validation error
- `clearErrors()` — clear semua atau field tertentu
- `setValue()` — programmatic value set
- `reset()` — reset ke defaultValues atau nilai override
- `handleSubmit()` — async submit dengan loading state
- `formState` debug panel — errors, isValid, isDirty, dirtyFields, touchedFields
- Mode selector — `onSubmit` | `onChange` | `onBlur` | `all` (remount via `:key`)

### UserObjectForm

Form yang menyimpan role sebagai object penuh `Role | null`.

Mendemonstrasikan:
- `register()` untuk field `name` dan `email`
- `getValue` / `setValue` untuk field `role` (custom dropdown)
- `form.setErrors()` untuk server error
- Object value pattern

### UserIdForm

Form yang menyimpan role sebagai ID string.

Mendemonstrasikan:
- `register()` untuk field `name` dan `email`
- `getValue` / `setValue` untuk field `roleId` (custom dropdown)
- `form.setErrors()` untuk server error
- ID value pattern

## Perbedaan API Vue vs React

| Fitur | React (`@valfuse-node/react`) | Vue (`@valfuse-node/vue`) |
|---|---|---|
| Field binding | `{...form.register('f')}` (JSX spread) | `v-bind="form.register('f')"` |
| Custom field | `ValfuseController` + `control` | `getValue` / `setValue` langsung |
| Watch global | `form.watch()` snapshot | — tidak tersedia |
| Watch field | `form.watch('f')` snapshot | `form.watch('f', cb)` callback |
| Watch multi | `form.watch(['a','b'])` | — gunakan multiple `watch(name, cb)` |
| Trigger | `form.trigger()` | — tidak tersedia |
| Mode | `onSubmit\|onChange\|onBlur\|onTouched\|all` | `onSubmit\|onChange\|onBlur\|all` |

## Struktur

```
src/
  features/
    users/
      components/
        TextInput.vue             ← input wrapper, kompatibel v-bind register()
        RoleDropdownObject.vue    ← dropdown yang menyimpan object
        RoleDropdownId.vue        ← dropdown yang menyimpan ID
      schemas/
        user-object.schema.ts     ← schema untuk UserObjectForm
        user-id.schema.ts         ← schema untuk UserIdForm
      types/
        user-form.types.ts        ← type definitions
      user.api.ts                 ← mock API + error mapping
      UserObjectForm.vue          ← form dengan role object
      UserIdForm.vue              ← form dengan role ID
    demo/
      AllFeaturesForm.vue         ← mode selector wrapper
      AllFeaturesFormInner.vue    ← form demonstrasi semua API
  App.vue
  main.ts
```

