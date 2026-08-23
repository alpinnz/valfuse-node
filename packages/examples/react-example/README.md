# @valfuse-node/example-react

> Reference implementation dan playground untuk `valfuse-node` — React 18.

Package ini **bukan production package**. Digunakan sebagai:

- 📖 **Reference implementation** — copy-paste pola yang sudah jadi ke project kamu
- 🎮 **Manual playground** — coba-coba API di dev server tanpa setup project baru
- 🧪 **Documentation by example** — lebih hidup dari sekadar README

---

## Daftar Isi

- [Cara Menjalankan](#cara-menjalankan)
- [Forms yang Tersedia](#forms-yang-tersedia)
- [Apa yang Didemonstrasikan](#apa-yang-didemonstrasikan)
- [Localization di Example Ini](#localization-di-example-ini)
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
cd packages/examples/react-example
npm run dev
```

Server akan berjalan di `http://localhost:5173`.

### Typecheck / Build

```bash
npm run typecheck     # tsc --noEmit
npm run build         # tsc -b && vite build
```

---

## Forms yang Tersedia

### 🔹 `UserObjectForm`

Form yang menyimpan `role` sebagai **object penuh** (`Role | null`).

```tsx
<form>
  <input {...form.register("name")} />
  <input {...form.register("email")} />

  {/* role di-handle via <ValfuseController> */}
  <ValfuseController
    control={form.control}
    name="role"
    render={({ field, fieldState }) => (
      <RoleDropdownObject
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        error={fieldState.error?.message}
      />
    )}
  />
</form>
```

**Berguna saat:** kamu butuh seluruh object `Role` (label, icon, permissions, dst.) tersedia di nilai form — bukan hanya ID-nya.

### 🔹 `UserIdForm`

Form yang menyimpan `role` sebagai **ID string** (`roleId: string`).

```tsx
<ValfuseController
  control={form.control}
  name="roleId"
  render={({ field, fieldState }) => (
    <RoleDropdownId
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )}
/>
```

**Berguna saat:** kamu cuma butuh reference (foreign key) ke data di server; object lengkap di-resolve di tempat lain.

### 🔹 `AllFeaturesForm`

Demonstrasi lengkap **semua** API `useValfuseForm` di satu form (jika ada di example ini).

---

## Apa yang Didemonstrasikan

| Fitur                                     | Di Mana                         | Kode Inti                                                                     |
| ----------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| `register()` untuk native `<input>`       | `TextInput` component           | `{...form.register("name")}`                                                  |
| `<ValfuseController>` untuk custom input  | `UserObjectForm`, `UserIdForm`  | `<ValfuseController control={form.control} name="…" render={…} />`            |
| `form.setErrors()` — inject server errors | submit handler di `user.api.ts` | `form.setErrors({ email: { message, code, type: "server" } })`                |
| `form.clearErrors()` — manual reset       | error UI                        | `form.clearErrors("email")`                                                   |
| `form.watch()` — subscribe per-field      | effect di komponen              | `const unsub = form.watch("email", cb)`                                       |
| `form.handleSubmit()` — async submit      | form onSubmit                   | `form.handleSubmit(async (values) => { … })`                                  |
| `formState.isSubmitting` — disable button | submit button                   | `<button disabled={form.formState.isSubmitting}>`                             |
| `formState.isDirty` — unsaved indicator   | header                          | `form.formState.isDirty`                                                      |
| `formState.errors.*.code` — semantic code | error renderer                  | `form.formState.errors.email?.code`                                           |
| `formState.touchedFields` — blur tracking | error UI (touched-only)         | `form.formState.touchedFields.email`                                          |
| Object value pattern                      | `UserObjectForm`                | `defaultValues: { role: null }`                                               |
| ID value pattern                          | `UserIdForm`                    | `defaultValues: { roleId: "" }`                                               |
| Cross-field validation (`matchField`)     | password confirm                | `matchField: "password"` di schema                                            |
| Custom rule                               | `user.api.ts` simulate          | `validate: (v, all) => !usedEmails.has(v)`                                    |
| Localization (full i18n)                  | `app.tsx` + `useLocalization`   | `<LocalizationProvider manifest={manifest} storage={localStorageStrategy()}>` |

---

## Localization di Example Ini

Example ini sudah **fully wired** dengan `@valfuse-node/localization`.

### Module yang tersedia

```
assets/localizations/
├── common/        ← app-wide strings (titles, buttons)
├── auth/          ← login/register screens
├── user/          ← user form labels
├── error/         ← generic error messages
├── role/          ← role dropdown labels
├── http/          ← HTTP error mapping
├── fallback/      ← fallback strings
├── settings/
├── profile/
├── onboarding/
├── workspace/, workspace_detail/
├── company/, company_add/, company_detail/, company_and_workspace/
├── business_unit/
├── auth_privacy_policy/, auth_terms_condition/
└── delete/
```

Setiap module punya minimal `en.json` dan `id.json`.

### Commands

```bash
# Compile (satu kali)
npm run localization:generate

# Watch mode (otomatis re-compile saat source berubah)
npm run localization:watch

# Validasi key parity, placeholder parity, structured parity
npm run localization:validate

# Coverage report (JSON default, atau HTML)
npm run localization:coverage
npm run localization:coverage -- --format html --output coverage.html

# Hapus generated output
npm run localization:clean
```

### Runtime API yang dipakai

```tsx
import { LocalizationProvider, useLocalization, localStorageStrategy } from "@valfuse-node/core";
import manifest from "./assets/localizations/localization.manifest.json";

<LocalizationProvider manifest={manifest} storage={localStorageStrategy()}>
  <App />
</LocalizationProvider>;

function Header() {
  const { translate, locale, setLocale } = useLocalization();
  return (
    <header>
      <h1>{translate("common.app.title")}</h1>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="id">Bahasa Indonesia</option>
      </select>
    </header>
  );
}
```

---

## Struktur Project

```
src/
├── app.tsx                                    ← root component + LocalizationProvider
├── main.tsx                                   ← ReactDOM.createRoot
└── features/
    └── users/
        ├── components/
        │   ├── text-input.tsx                 ← input dengan forwardRef, kompatibel register()
        │   ├── role-dropdown-object.tsx       ← dropdown yang menyimpan object Role
        │   └── role-dropdown-id.tsx           ← dropdown yang menyimpan ID string
        ├── schemas/
        │   ├── user-object.schema.ts          ← schema untuk UserObjectForm
        │   └── user-id.schema.ts              ← schema untuk UserIdForm
        ├── types/
        │   └── user-form.types.ts             ← type definitions (Role, User, dll.)
        ├── user.api.ts                        ← mock API + error mapping
        ├── user-object-form.tsx               ← form dengan role object
        └── user-id-form.tsx                   ← form dengan role ID

assets/
└── localizations/                             ← source YAML/JSON untuk CLI
    ├── auth/{en,id}.json
    ├── common/{en,id}.json
    ├── user/{en,id}.json
    └── …

valfuse-localization.yaml                      ← config untuk CLI
```

---

## Scripts

| Script                  | Perintah                                | Fungsi                                |
| ----------------------- | --------------------------------------- | ------------------------------------- |
| `dev`                   | `vite`                                  | Dev server di `http://localhost:5173` |
| `build`                 | `tsc -b && vite build`                  | Production build                      |
| `typecheck`             | `tsc --noEmit`                          | Cek TypeScript tanpa emit             |
| `lint`                  | `eslint src`                            | ESLint                                |
| `clean`                 | `rm -rf dist`                           | Hapus output                          |
| `localization:generate` | `valfuse-localization generate`         | Compile sources → TS/JSON             |
| `localization:watch`    | `valfuse-localization generate --watch` | Watch mode                            |
| `localization:validate` | `valfuse-localization validate`         | Cek parity & validators               |
| `localization:coverage` | `valfuse-localization coverage`         | Coverage report                       |
| `localization:clean`    | `valfuse-localization clean`            | Hapus generated output                |

---

## Tips

- **Bandingkan pola object vs ID** di `UserObjectForm` vs `UserIdForm` — keduanya legitimate, pilih sesuai use case.
- **Cek `user.api.ts`** untuk pola mapping `HTTP status → ValfuseError` (cara inject server errors).
- **Buka `app.tsx`** untuk melihat setup `LocalizationProvider` lengkap dengan storage strategy.
- **Coba ganti `mode: "onSubmit"` ke `"onChange"` atau `"onBlur"`** di salah satu schema untuk lihat perbedaan UX.

---

## License

[MIT](../../../LICENSE)
