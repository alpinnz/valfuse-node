# @valfuse-node/example-vue

> Reference implementation dan playground untuk `valfuse-node` — Vue 3.

Package ini **bukan production package**. Digunakan sebagai:

- 📖 **Reference implementation** — copy-paste pola Vue-native yang sudah jadi
- 🎮 **Manual playground** — coba-coba API di dev server tanpa setup project baru
- 🧪 **Documentation by example** — lebih hidup dari sekadar README

---

## Daftar Isi

- [Cara Menjalankan](#cara-menjalankan)
- [Forms yang Tersedia](#forms-yang-tersedia)
- [Apa yang Didemonstrasikan](#apa-yang-didemonstrasikan)
- [Perbedaan API Vue vs React](#perbedaan-api-vue-vs-react)
- [Struktur Project](#struktur-project)
- [Scripts](#scripts)

---

## Cara Menjalankan

### Prerequisites

Pastikan package utama `valfuse-node` sudah di-build dari root:

```bash
# Di root valfuse-node
npm install
npm run build
```

### Development Server

```bash
# Opsi A: dari root (menjalankan semua contoh sekaligus)
npm run dev

# Opsi B: langsung di package ini
cd examples/vue-example
npm run dev
```

Server akan berjalan di `http://localhost:5174` (atau port berikutnya yang tersedia).

### Typecheck / Build

```bash
npm run typecheck     # vue-tsc --noEmit
npm run build         # vue-tsc -b && vite build
```

---

## Forms yang Tersedia

### 🔹 `AllFeaturesForm`

Demonstrasi lengkap **semua** API `useValfuseForm` di satu form. Inner component (`AllFeaturesFormInner.vue`) dirender ulang via `:key` ketika mode validation berubah — cara elegan untuk reset state.

**Mencakup:**

- `register()` — spread ke komponen wrapper (`TextInput`) via `v-bind`
- `getValue` / `setValue` — binding manual untuk custom select
- `watch(name, cb)` — reactive per-field watcher dengan unsubscribe
- `setErrors()` — simulasi server validation error
- `clearErrors()` — clear semua atau field tertentu
- `setValue()` — programmatic value set
- `reset()` — reset ke `defaultValues` atau nilai override
- `handleSubmit()` — async submit dengan loading state
- `formState` debug panel — `errors`, `isValid`, `isDirty`, `dirtyFields`, `touchedFields`
- Mode selector — `onSubmit` | `onChange` | `onBlur` | `all` (remount via `:key`)

### 🔹 `UserObjectForm`

Form yang menyimpan `role` sebagai **object penuh** (`Role | null`).

```vue
<script setup lang="ts">
const role = computed({
  get: () => form.getValue("role") as Role | null,
  set: (v) => form.setValue("role", v),
});
</script>

<template>
  <RoleDropdownObject v-model="role" />
</template>
```

**Berguna saat:** kamu butuh seluruh object `Role` (label, icon, permissions, dst.) tersedia di nilai form.

### 🔹 `UserIdForm`

Form yang menyimpan `role` sebagai **ID string** (`roleId: string`).

```vue
<script setup lang="ts">
const roleId = computed({
  get: () => form.getValue("roleId") as string,
  set: (v) => form.setValue("roleId", v),
});
</script>

<template>
  <RoleDropdownId v-model="roleId" />
</template>
```

**Berguna saat:** kamu cuma butuh foreign key ke data di server.

---

## Apa yang Didemonstrasikan

| Fitur                                                   | Di Mana                        | Kode Inti                                                      |
| ------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------- |
| `register()` untuk native input                         | `TextInput.vue`                | `<input v-bind="form.register('email')" />`                    |
| `getValue` / `setValue` untuk custom input              | `UserObjectForm`, `UserIdForm` | `computed({ get, set })` wrapper                               |
| `form.setErrors()` — inject server errors               | `user.api.ts` simulate         | `form.setErrors({ email: { message, code, type: "server" } })` |
| `form.clearErrors()` — manual reset                     | error UI                       | `form.clearErrors()` / `form.clearErrors(["email"])`           |
| `form.watch(name, cb)` — per-field subscription         | effect / `onUnmounted` cleanup | `const unsub = form.watch("email", cb); onUnmounted(unsub)`    |
| `form.watch((values, info) => …)` — global subscription | reactive debug panel           | `form.watch((values) => { … })`                                |
| `form.handleSubmit()` — async submit                    | `@submit` handler              | `form.handleSubmit(async (values) => { … })`                   |
| `formState.isSubmitting` — disable button               | submit button                  | `<button :disabled="form.formState.isSubmitting">`             |
| `formState.isDirty` — unsaved indicator                 | debug panel                    | `form.formState.isDirty`                                       |
| `formState.errors.*.code` — semantic code               | error renderer                 | `form.formState.errors.email?.code`                            |
| `formState.touchedFields` — blur tracking               | error UI (touched-only)        | `form.formState.touchedFields.email`                           |
| Object value pattern                                    | `UserObjectForm`               | `defaultValues: { role: null }`                                |
| ID value pattern                                        | `UserIdForm`                   | `defaultValues: { roleId: "" }`                                |
| Cross-field validation (`matchField`)                   | password confirm               | `matchField: "password"` di schema                             |
| Custom rule                                             | `user.api.ts` simulate         | `validate: (v, all) => !usedEmails.has(v)`                     |
| Mode switching via remount                              | `AllFeaturesForm`              | `<AllFeaturesFormInner :key="mode" :mode="mode" />`            |
| Reactive debug panel                                    | `AllFeaturesFormInner`         | `computed(() => form.getValues())`                             |

---

## Perbedaan API Vue vs React

Adapter Vue menjaga **kontrak yang sama** dengan React, dengan dua perbedaan utama:

| Fitur                       | React (`@valfuse-node/react`)                        | Vue (`@valfuse-node/vue`)                                                            |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Field binding               | `{...form.register('f')}` (JSX spread)               | `v-bind="form.register('f')"`                                                        |
| Custom field                | `<ValfuseController>` + `form.control`               | `getValue` / `setValue` (no controller yet)                                          |
| Watch snapshot              | `form.watch()`                                       | `form.watch()`                                                                       |
| Watch subscribe (global)    | `form.watch((values, info) => …)`                    | `form.watch((values, info) => …)`                                                    |
| Watch subscribe (one field) | `form.watch('f', cb)`                                | `form.watch('f', cb)` (legacy)                                                       |
| Watch subscribe (multi)     | `form.watch(['a','b'], cb)`                          | — gunakan multiple `watch(name, cb)`                                                 |
| Manual trigger              | `form.trigger()`                                     | `form.trigger()`                                                                     |
| Localization runtime        | `<LocalizationProvider>` + `useLocalization()`       | — tidak tersedia di adapter Vue; pakai package `@valfuse-node/localization` langsung |
| Mode values                 | `onSubmit \| onChange \| onBlur \| onTouched \| all` | `onSubmit \| onChange \| onBlur \| onTouched \| all`                                 |

> **Kontrak TypeScript identik:** `UseValfuseFormReturn<T>` didefinisikan sama persis di kedua adapter. Skema + `defaultValues` yang sama bisa dipakai ulang.

> **Catatan:** `<ValfuseController>` belum tersedia di Vue. Untuk input custom (dropdown, date picker, checkbox group), gunakan pola `computed({ get, set })` dengan `form.getValue` / `form.setValue` — lihat `UserObjectForm.vue` untuk contoh.

---

## Struktur Project

```
src/
├── App.vue                                    ← root component dengan tab switcher
├── main.ts                                    ← createApp + mount
└── features/
    ├── users/
    │   ├── components/
    │   │   ├── TextInput.vue                  ← input wrapper, kompatibel v-bind register()
    │   │   ├── RoleDropdownObject.vue         ← dropdown yang menyimpan object
    │   │   └── RoleDropdownId.vue             ← dropdown yang menyimpan ID
    │   ├── schemas/
    │   │   ├── user-object.schema.ts          ← schema untuk UserObjectForm
    │   │   └── user-id.schema.ts              ← schema untuk UserIdForm
    │   ├── types/
    │   │   └── user-form.types.ts             ← type definitions
    │   ├── user.api.ts                        ← mock API + error mapping
    │   ├── UserObjectForm.vue                 ← form dengan role object
    │   └── UserIdForm.vue                     ← form dengan role ID
    └── demo/
        ├── AllFeaturesForm.vue                ← mode selector wrapper
        └── AllFeaturesFormInner.vue           ← form demonstrasi semua API
```

---

## Scripts

| Script      | Perintah                   | Fungsi                                |
| ----------- | -------------------------- | ------------------------------------- |
| `dev`       | `vite`                     | Dev server di `http://localhost:5174` |
| `build`     | `vue-tsc -b && vite build` | Production build                      |
| `typecheck` | `vue-tsc --noEmit`         | Cek TypeScript di `.vue`              |
| `lint`      | `eslint src`               | ESLint                                |
| `clean`     | `rm -rf dist`              | Hapus output                          |

---

## Tips

- **Mulai dari `AllFeaturesForm`** — paling lengkap demonstrasi API.
- **Lihat `UserObjectForm` vs `UserIdForm`** untuk pola value pattern.
- **Coba ganti `mode` di `AllFeaturesForm`** — form akan re-mount via `:key` dan reset state. Bandingkan UX-nya.
- **Untuk input custom, pakai pola `computed({ get, set })`** — itu cara Vue-native untuk "control"-style binding tanpa butuh komponen controller.

---

## Cakupan Library dan Build-time Generator

Contoh ini memakai setiap lapisan Valfuse yang relevan untuk aplikasi Vue:

| Package                      | Demo yang bisa dicoba                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `@valfuse-node/core`         | Facade runtime di `App.vue`; adapter Vue; subpath Node.js `core/assets` dan `core/barrel`              |
| `@valfuse-node/form`         | Validasi dan transformasi framework-neutral di `FormDomainDemo.vue`, serta schema yang dipakai adapter |
| `@valfuse-node/vue`          | `useValfuseForm`, binding `v-model`, state reaktif, custom value object dan ID                         |
| `@valfuse-node/localization` | CLI generate/validate/coverage/watch dan browser-safe runtime dengan interpolasi serta plural          |
| `@valfuse-node/assets`       | Registry typed dari `public/assets`, ditampilkan di galeri assets                                      |
| `@valfuse-node/barrel`       | Membuat `src/features/demo/index.ts`, yang dipakai `App.vue` untuk mengimpor demo                      |

Adapter React ada di `examples/react-example`. Vue belum memiliki provider
localization; contoh ini memakai runtime framework-neutral dari
`@valfuse-node/localization/runtime` langsung.

### Jalankan di workspace ini

Jalankan perintah dari direktori `examples/vue-example`, atau tambahkan
`--workspace=examples/vue-example` saat menjalankannya dari root monorepo:

```bash
npm run generate               # assets + barrel + localization
npm run dev                    # generate otomatis lalu buka Vite
npm run build                  # generate otomatis lalu build production
npm run generate:check         # validasi output tanpa menulis file
npm run codegen:core           # assets/barrel melalui API core Node.js
npm run codegen:core:check     # cek API core tanpa menulis file
```

`valfuse.yaml` memuat section `assets`, `barrel`, dan `localization`.
Asset SVG berada di `public/assets`; generator hanya membuat URL typed dan tidak
menyalin file. CLI tersedia sebagai script
`assets:*`, `barrel:*`, dan `localization:*`.

`npm run typecheck` juga membangkitkan output lebih dahulu. File registry assets
dan barrel dapat dibuat ulang; jangan edit manual. Karena adapter Vue belum
menyediakan provider localization, demo locale dan plural memakai runtime
langsung dan state `ref`/`computed` Vue.

## License

[MIT](../../LICENSE)
