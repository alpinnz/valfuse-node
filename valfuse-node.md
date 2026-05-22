# Perencanaan Library `valfuse-node`

## 1. Ringkasan

`valfuse-node` adalah library form validation generic untuk ekosistem frontend berbasis Node.js.

Fokus utama:

```txt
native schema validation
React Hook Form adapter
unified error handling
adapter-react-example sebagai reference implementation
```

Library ini tidak bergantung pada:

```txt
Zod
localization package
UI component library
backend response format tertentu
```

Tujuan utama:

- membuat standard validation yang config-first;
- mudah dibaca;
- mudah digunakan di React;
- kompatibel dengan `react-hook-form`;
- support `register()`;
- support `Controller`;
- support server/manual errors melalui `form.setErrors()`;
- tidak terikat pada UI tertentu;
- punya example package yang bisa dijalankan sebagai playground.

---

## 2. Nama Repository

```txt
valfuse-node
```

Makna:

```txt
val     = validation
fuse    = menggabungkan / menyatukan
node    = ekosistem Node.js
```

---

## 3. Tooling yang Digunakan

### 3.1 Package Manager

Package manager yang digunakan:

```txt
npm
```

Tidak menggunakan:

```txt
pnpm
yarn
bun
```

Konsekuensi:

- workspace menggunakan `npm workspaces`;
- script dijalankan melalui `npm run ...`;
- dependency internal menggunakan workspace protocol jika diperlukan;
- lockfile utama adalah `package-lock.json`.

---

### 3.2 Monorepo Tool

Monorepo orchestration menggunakan:

```txt
Turborepo
```

File utama:

```txt
turbo.json
```

Tugas Turborepo:

- menjalankan build per package;
- menjalankan lint per package;
- menjalankan test per package;
- menjalankan dev/example package;
- mengatur cache task;
- menjaga pipeline monorepo tetap konsisten.

---

## 4. Package / Folder Final

Package/folder final:

```txt
@valfuse-node/core
@valfuse-node/adapter-react
@valfuse-node/adapter-react-example
```

Catatan:

```txt
@valfuse-node/core                  = package utama native schema
@valfuse-node/adapter-react         = package adapter React Hook Form
@valfuse-node/adapter-react-example = private example package / playground
```

`adapter-react-example` bukan package production utama. Package ini berfungsi sebagai reference implementation, playground, dan dokumentasi hidup.

---

## 5. Struktur Repository

```txt
valfuse-node
├── packages
│   ├── core
│   │   ├── src
│   │   │   ├── create-schema.ts
│   │   │   ├── validate-schema.ts
│   │   │   ├── rules
│   │   │   │   ├── string.rules.ts
│   │   │   │   ├── number.rules.ts
│   │   │   │   ├── boolean.rules.ts
│   │   │   │   ├── array.rules.ts
│   │   │   │   ├── object.rules.ts
│   │   │   │   └── custom.rules.ts
│   │   │   ├── errors
│   │   │   │   ├── normalize-error.ts
│   │   │   │   └── set-errors.types.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── adapter-react
│   │   ├── src
│   │   │   ├── use-valfuse-form.ts
│   │   │   ├── create-valfuse-resolver.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── adapter-react-example
│       ├── src
│       │   ├── features
│       │   │   └── users
│       │   │       ├── components
│       │   │       │   ├── role-dropdown-id.tsx
│       │   │       │   ├── role-dropdown-object.tsx
│       │   │       │   └── text-input.tsx
│       │   │       ├── schemas
│       │   │       │   ├── user-id.schema.ts
│       │   │       │   └── user-object.schema.ts
│       │   │       ├── types
│       │   │       │   └── user-form.types.ts
│       │   │       ├── user.api.ts
│       │   │       ├── user-id-form.tsx
│       │   │       └── user-object-form.tsx
│       │   ├── app.tsx
│       │   └── main.tsx
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── README.md
│
├── package.json
├── package-lock.json
├── turbo.json
├── tsconfig.base.json
├── eslint.config.mjs
├── README.md
├── CHANGELOG.md
├── LICENSE
└── SECURITY.md
```

---

## 6. Root `package.json`

Contoh root `package.json`:

```json
{
  "name": "valfuse-node",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "latest",
    "eslint": "latest"
  }
}
```

---

## 7. `turbo.json`

Contoh `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

# Prinsip yang Dipegang

## 8. Clean Architecture

Pisahkan concerns:

```txt
domain → application → infrastructure ← presentation
```

Aturan dependency:

- arah dependency tidak boleh terbalik;
- domain tidak tahu tentang UI;
- UI tidak tahu tentang database;
- core tidak boleh bergantung pada React;
- adapter-react boleh bergantung pada core;
- adapter-react-example boleh bergantung pada core dan adapter-react.

Mapping pada `valfuse-node`:

```txt
domain/application:
@valfuse-node/core

presentation adapter:
@valfuse-node/adapter-react

presentation example:
@valfuse-node/adapter-react-example
```

---

## 9. SOLID

### S — Single Responsibility

Satu unit, satu tanggung jawab.

Contoh:

```txt
createSchema.ts           → membuat schema
validate-schema.ts        → menjalankan validasi
normalize-error.ts        → menormalisasi error
use-valfuse-form.ts       → menghubungkan Valfuse ke React Hook Form
role-dropdown-object.tsx  → render dropdown role object
```

### O — Open/Closed

Terbuka untuk ekstensi, tertutup untuk modifikasi.

Contoh:

- rule baru ditambahkan sebagai module rule baru;
- adapter baru dapat dibuat tanpa mengubah core;
- UI example baru dapat ditambahkan tanpa mengubah package core.

### L — Liskov Substitution

Implementasi rule/adapter harus bisa diganti tanpa mengubah perilaku kontrak utama.

### I — Interface Segregation

Interface kecil dan spesifik.

Contoh:

```ts
ValfuseRule
ValfuseError
ValfuseFieldSchema
ValfuseFieldErrors
```

Jangan membuat satu type besar yang memaksa semua consumer memakai property yang tidak dibutuhkan.

### D — Dependency Inversion

Bergantung pada abstraksi, bukan implementasi konkret.

Contoh:

- adapter-react bergantung pada kontrak schema/core, bukan detail internal rule;
- core tidak tahu React Hook Form;
- example tidak mengakses file internal package lain secara langsung.

---

## 10. Clean Code

Kode yang baik tidak butuh komentar penjelasan; ia berbicara sendiri.

Tidak boleh ada:

- magic number/string tanpa nama;
- dead code;
- komentar yang menjelaskan kode buruk;
- singkatan yang tidak jelas;
- function terlalu panjang;
- file terlalu banyak responsibility.

Contoh buruk:

```ts
const x = 8;
```

Contoh baik:

```ts
const MIN_PASSWORD_LENGTH = 8;
```

---

## 11. Naming Best Practice

Nama adalah dokumentasi pertama.

Ikuti konvensi yang sudah ada di proyek, bukan memaksakan gaya sendiri.

Prinsip universal:

| Unit | Pola Nama | Contoh |
|---|---|---|
| Unit render | nama benda deskriptif | `UserProfileCard`, `OrderSummaryList` |
| Unit logic | nama aksi/domain | `getWorkspaceList`, `submitLoginForm` |
| Helper/utility | nama transformasi | `formatCurrency`, `parseErrorMessage` |
| Konstanta | uppercase underscore | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| File | konsisten sesuai proyek | `user-form.tsx`, `create-schema.ts` |

Hindari nama ambigu:

```txt
data
info
item
stuff
handler
util
```

Kecuali diberi konteks yang jelas.

---

## 12. No Redundancy

Logika yang muncul 2+ kali adalah hutang teknis.

Aturan:

- ekstrak ke helper jika logic berulang;
- ekstrak ke service/unit jika behavior berulang;
- komponen identik dengan variasi kecil harus menggunakan parameter;
- jangan copy-paste rule validation;
- jangan copy-paste error normalization.

Contoh:

```txt
normalizeError()
mapApiValidationErrors()
createValfuseResolver()
```

---

## 13. Scalable Structure

Folder dan modul harus bisa tumbuh tanpa refactor besar.

Aturan:

- fitur baru tidak memerlukan perubahan pada fitur lain;
- struktur mencerminkan domain, bukan detail teknis semata;
- example package memakai struktur feature-based;
- core package memakai struktur responsibility-based.

---

## 14. Maintainable Structure

Kode harus mudah dipahami oleh anggota baru.

Target:

```txt
developer baru bisa memahami struktur dasar dalam waktu singkat
kode tetap dapat dibaca 6 bulan kemudian
API publik mudah dipelajari dari README dan example
```

---

## 15. Reusability

Aturan:

- komponen/helper generic masuk ke shared/common layer;
- logic domain-specific tetap di fitur masing-masing;
- core tidak membawa logic UI;
- adapter-react tidak membawa business use case;
- example package boleh memiliki UI sederhana untuk demonstrasi.

---

## 16. Testing Mindset

Test membuktikan behavior, bukan mengunci implementasi.

Jenis test:

```txt
Unit test        → validasi logic murni
Integration test → interaksi antar unit
E2E test         → alur pengguna dari awal ke akhir
```

Mock hanya di boundary:

```txt
network
storage
timer
external service
```

---

## 17. Testing Label Consistency

Nama test harus komunikatif.

Format:

```txt
Suite: nama unit yang diuji
Case : should [expected behavior] when [condition]
```

Contoh:

```txt
describe("validateSchema")
it("should return required error when string value is empty")
```

```txt
describe("useValfuseForm")
it("should set field errors when setErrors is called")
```

---

## 18. Barrel Export Terkendali

Setiap modul mengekspor hanya melalui satu entry point.

Aturan:

- public API diexport dari `index.ts`;
- tidak ada import langsung ke implementasi internal dari luar modul;
- example tidak boleh import file internal core seperti `rules/string.rules.ts`;
- consumer hanya boleh import dari package entry point.

Contoh benar:

```ts
import { createSchema } from "@valfuse-node/core";
import { useValfuseForm } from "@valfuse-node/adapter-react";
```

Contoh salah:

```ts
import { validateStringRule } from "@valfuse-node/core/src/rules/string.rules";
```

---

## 19. Native Schema Concept

`valfuse-node` memakai native schema melalui `createSchema()`.

Contoh:

```ts
import { createSchema } from "@valfuse-node/core";

export const loginSchema = createSchema({
  email: {
    type: "string",
    rules: [
      {
        name: "required",
        error: {
          message: "Email wajib diisi",
          code: "login.form.email.required",
        },
      },
      {
        name: "email",
        error: {
          message: "Format email tidak valid",
          code: "login.form.email.invalid",
        },
      },
    ],
  },

  password: {
    type: "string",
    rules: [
      {
        name: "required",
        error: {
          message: "Password wajib diisi",
          code: "login.form.password.required",
        },
      },
      {
        name: "min",
        value: 8,
        error: {
          message: "Password minimal 8 karakter",
          code: "login.form.password.min",
        },
      },
      {
        name: "regex",
        value: /^(?=.*[A-Z])(?=.*\\d).+$/,
        error: {
          message: "Password harus mengandung huruf besar dan angka",
          code: "login.form.password.regex",
        },
      },
    ],
  },
});
```

---

## 20. Rule Naming Strategy

Rule name meniru nama validasi yang familiar seperti Zod, tetapi implementasi tetap native Valfuse.

Aturan:

```txt
Tidak ada Zod dependency.
Tidak ada schema-zod package.
Nama rule boleh Zod-like agar familiar.
Valfuse tetap memiliki validator sendiri.
```

---

## 21. Native Rule List V1

### 21.1 String Rules

```txt
required
min
max
length
email
url
uuid
regex
includes
startsWith
endsWith
```

### 21.2 Number Rules

```txt
required
min
max
gt
gte
lt
lte
int
positive
nonnegative
negative
nonpositive
multipleOf
```

### 21.3 Boolean Rules

```txt
required
literal
accepted
```

### 21.4 Array Rules

```txt
required
min
max
length
nonempty
```

### 21.5 Object Rules

```txt
required
shape
```

### 21.6 Generic Rules

```txt
custom
refine
matchField
oneOf
notOneOf
```

---

## 22. Regex Rule

Rule `regex` harus mendukung dua format.

### 22.1 RegExp langsung

```ts
{
  name: "regex",
  value: /^[a-zA-Z0-9_]+$/,
  error: {
    message: "Username hanya boleh berisi huruf, angka, dan underscore",
    code: "user.form.username.regex",
  },
}
```

### 22.2 Pattern config

```ts
{
  name: "regex",
  value: {
    pattern: "^[a-zA-Z0-9_]+$",
    flags: "i",
  },
  error: {
    message: "Username hanya boleh berisi huruf, angka, dan underscore",
    code: "user.form.username.regex",
  },
}
```

Type:

```ts
export type ValfuseRegexValue =
  | RegExp
  | {
      pattern: string;
      flags?: string;
    };
```

---

## 23. Error Model

Semua sumber error harus dinormalisasi ke model yang sama:

```txt
schema validation
manual validation
server/API validation
custom validation
```

Type:

```ts
export type ValfuseErrorType =
  | "validation"
  | "server"
  | "manual"
  | "custom";

export type ValfuseError = {
  message: string;
  type?: ValfuseErrorType | string;
  code?: string;
  metadata?: Record<string, unknown>;
};

export type ValfuseFieldErrors<TFieldName extends string = string> =
  Partial<Record<TFieldName, string | ValfuseError>>;
```

---

## 24. `form.setErrors()`

`form.setErrors()` menerima format simple:

```ts
form.setErrors({
  email: "Email salah",
  password: "Password salah",
});
```

Dan format detail:

```ts
form.setErrors({
  email: {
    message: "Email salah",
    type: "server",
    code: "login.form.email.error.not_valid",
  },
  password: {
    message: "Password salah",
    type: "server",
    code: "login.form.password.error.mismatch",
  },
});
```

UI tetap membaca:

```tsx
form.formState.errors.email?.message
form.formState.errors.password?.message
```

---

## 25. `useValfuseForm()`

API minimal:

```ts
const form = useValfuseForm<FormValues>({
  schema,
  defaultValues,
  mode: "onSubmit",
});
```

Return wajib expose:

```ts
form.register
form.control
form.handleSubmit
form.formState
form.setValue
form.watch
form.reset
form.clearErrors
form.setErrors
```

---

## 26. React Pattern: `register()`

Gunakan `register()` untuk input native atau component `forwardRef`.

```tsx
<TextInput
  id="email"
  label="Email"
  placeholder="Masukkan email"
  error={form.formState.errors.email?.message}
  {...form.register("email")}
/>
```

---

## 27. React Pattern: `Controller`

Gunakan `Controller` resmi dari `react-hook-form` untuk custom/controlled component.

```tsx
import { Controller } from "react-hook-form";

<Controller
  control={form.control}
  name="role"
  render={({ field, fieldState }) => (
    <CustomDropdown
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )}
/>
```

`valfuse-node` tidak perlu membuat pengganti `Controller` pada MVP.

---

## 28. Dropdown Value Pattern

### 28.1 Simpan ID

Gunakan jika form sederhana dan API hanya membutuhkan ID:

```ts
type UserFormValues = {
  name: string;
  roleId: string;
};
```

### 28.2 Simpan Object

Gunakan jika UI membutuhkan object penuh:

```ts
type Role = {
  id: string;
  name: string;
};

type UserFormValues = {
  name: string;
  role: Role | null;
};
```

### 28.3 Hindari Union Jika Tidak Diperlukan

Hindari default pattern seperti:

```ts
type UserFormValues = {
  role: Role | string;
};
```

Union hanya dipakai jika ada kebutuhan nyata seperti createable dropdown.

---

## 29. Adapter React Example Package

`adapter-react-example` harus berada di:

```txt
valfuse-node/packages/adapter-react-example
```

Package ini berfungsi sebagai:

```txt
reference implementation
example app
manual playground
documentation by example
```

Package ini harus memiliki minimal dua form:

```txt
UserObjectForm → role: Role | null
UserIdForm     → roleId: string
```

---

## 30. Adapter React Example: Types

```ts
// packages/adapter-react-example/src/features/users/types/user-form.types.ts

export type Role = {
  id: string;
  name: string;
};

export type UserObjectFormValues = {
  name: string;
  email: string;
  role: Role | null;
};

export type UserIdFormValues = {
  name: string;
  email: string;
  roleId: string;
};
```

---

## 31. Adapter React Example: Object Schema

```ts
// packages/adapter-react-example/src/features/users/schemas/user-object.schema.ts

import { createSchema } from "@valfuse-node/core";

export const userObjectSchema = createSchema({
  name: {
    type: "string",
    rules: [
      {
        name: "required",
        error: {
          message: "Nama wajib diisi",
          code: "user.form.name.required",
        },
      },
      {
        name: "min",
        value: 3,
        error: {
          message: "Nama minimal 3 karakter",
          code: "user.form.name.min",
        },
      },
    ],
  },

  email: {
    type: "string",
    rules: [
      {
        name: "required",
        error: {
          message: "Email wajib diisi",
          code: "user.form.email.required",
        },
      },
      {
        name: "email",
        error: {
          message: "Format email tidak valid",
          code: "user.form.email.invalid",
        },
      },
    ],
  },

  role: {
    type: "object",
    rules: [
      {
        name: "required",
        error: {
          message: "Role wajib dipilih",
          code: "user.form.role.required",
        },
      },
    ],
  },
});
```

---

## 32. Adapter React Example: ID Schema

```ts
// packages/adapter-react-example/src/features/users/schemas/user-id.schema.ts

import { createSchema } from "@valfuse-node/core";

export const userIdSchema = createSchema({
  name: {
    type: "string",
    rules: [
      {
        name: "required",
        error: {
          message: "Nama wajib diisi",
          code: "user.form.name.required",
        },
      },
      {
        name: "min",
        value: 3,
        error: {
          message: "Nama minimal 3 karakter",
          code: "user.form.name.min",
        },
      },
    ],
  },

  email: {
    type: "string",
    rules: [
      {
        name: "required",
        error: {
          message: "Email wajib diisi",
          code: "user.form.email.required",
        },
      },
      {
        name: "email",
        error: {
          message: "Format email tidak valid",
          code: "user.form.email.invalid",
        },
      },
    ],
  },

  roleId: {
    type: "string",
    rules: [
      {
        name: "required",
        error: {
          message: "Role wajib dipilih",
          code: "user.form.role.required",
        },
      },
    ],
  },
});
```

---

## 33. Adapter React Example: Text Input

```tsx
// packages/adapter-react-example/src/features/users/components/text-input.tsx

import { forwardRef } from "react";

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, error, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id}>{label}</label>

        <input id={id} ref={ref} {...props} />

        {error ? <p role="alert">{error}</p> : null}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
```

---

## 34. Adapter React Example: Object Dropdown

```tsx
// packages/adapter-react-example/src/features/users/components/role-dropdown-object.tsx

import type { Role } from "../types/user-form.types";

type RoleDropdownObjectProps = {
  value: Role | null;
  options: Role[];
  error?: string;
  onChange: (value: Role | null) => void;
  onBlur?: () => void;
};

export function RoleDropdownObject({
  value,
  options,
  error,
  onChange,
  onBlur,
}: RoleDropdownObjectProps) {
  return (
    <div>
      <button type="button" onBlur={onBlur}>
        {value ? value.name : "Pilih role"}
      </button>

      <div>
        {options.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role)}
          >
            {role.name}
          </button>
        ))}
      </div>

      {value ? (
        <button type="button" onClick={() => onChange(null)}>
          Hapus pilihan
        </button>
      ) : null}

      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
```

---

## 35. Adapter React Example: ID Dropdown

```tsx
// packages/adapter-react-example/src/features/users/components/role-dropdown-id.tsx

import type { Role } from "../types/user-form.types";

type RoleDropdownIdProps = {
  value: string;
  options: Role[];
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function RoleDropdownId({
  value,
  options,
  error,
  onChange,
  onBlur,
}: RoleDropdownIdProps) {
  const selected = options.find((role) => role.id === value);

  return (
    <div>
      <button type="button" onBlur={onBlur}>
        {selected ? selected.name : "Pilih role"}
      </button>

      <div>
        {options.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
          >
            {role.name}
          </button>
        ))}
      </div>

      {value ? (
        <button type="button" onClick={() => onChange("")}>
          Hapus pilihan
        </button>
      ) : null}

      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
```

---

## 36. Adapter React Example: User Object Form

```tsx
// packages/adapter-react-example/src/features/users/user-object-form.tsx

import { Controller } from "react-hook-form";
import { useValfuseForm } from "@valfuse-node/adapter-react";

import { TextInput } from "./components/text-input";
import { RoleDropdownObject } from "./components/role-dropdown-object";
import { userObjectSchema } from "./schemas/user-object.schema";
import { createUserApi, mapApiValidationErrors } from "./user.api";
import type { Role, UserObjectFormValues } from "./types/user-form.types";

const roleOptions: Role[] = [
  { id: "admin", name: "Admin" },
  { id: "staff", name: "Staff" },
  { id: "viewer", name: "Viewer" },
];

export function UserObjectForm() {
  const form = useValfuseForm<UserObjectFormValues>({
    schema: userObjectSchema,
    defaultValues: {
      name: "",
      email: "",
      role: null,
    },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createUserApi({
        name: values.name,
        email: values.email,
        roleId: values.role?.id,
      });
    } catch (error) {
      const response = error.response.data;
      const fieldErrors = mapApiValidationErrors(response);

      form.setErrors(fieldErrors);
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <TextInput
        id="object-name"
        label="Nama"
        placeholder="Masukkan nama"
        error={form.formState.errors.name?.message}
        {...form.register("name")}
      />

      <TextInput
        id="object-email"
        label="Email"
        placeholder="Masukkan email"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />

      <Controller
        control={form.control}
        name="role"
        render={({ field, fieldState }) => (
          <RoleDropdownObject
            value={field.value}
            options={roleOptions}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <button type="submit" disabled={form.formState.isSubmitting}>
        Simpan
      </button>
    </form>
  );
}
```

---

## 37. Adapter React Example: User ID Form

```tsx
// packages/adapter-react-example/src/features/users/user-id-form.tsx

import { Controller } from "react-hook-form";
import { useValfuseForm } from "@valfuse-node/adapter-react";

import { TextInput } from "./components/text-input";
import { RoleDropdownId } from "./components/role-dropdown-id";
import { userIdSchema } from "./schemas/user-id.schema";
import { createUserApi, mapApiValidationErrors } from "./user.api";
import type { Role, UserIdFormValues } from "./types/user-form.types";

const roleOptions: Role[] = [
  { id: "admin", name: "Admin" },
  { id: "staff", name: "Staff" },
  { id: "viewer", name: "Viewer" },
];

export function UserIdForm() {
  const form = useValfuseForm<UserIdFormValues>({
    schema: userIdSchema,
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createUserApi(values);
    } catch (error) {
      const response = error.response.data;
      const fieldErrors = mapApiValidationErrors(response);

      form.setErrors(fieldErrors);
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <TextInput
        id="id-name"
        label="Nama"
        placeholder="Masukkan nama"
        error={form.formState.errors.name?.message}
        {...form.register("name")}
      />

      <TextInput
        id="id-email"
        label="Email"
        placeholder="Masukkan email"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />

      <Controller
        control={form.control}
        name="roleId"
        render={({ field, fieldState }) => (
          <RoleDropdownId
            value={field.value}
            options={roleOptions}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <button type="submit" disabled={form.formState.isSubmitting}>
        Simpan
      </button>
    </form>
  );
}
```

---

## 38. Adapter React Example: API Error Mapping

```ts
// packages/adapter-react-example/src/features/users/user.api.ts

export type CreateUserPayload = {
  name: string;
  email: string;
  roleId?: string;
};

type ApiValidationErrorResponse = {
  message: string;
  code: string;
  errors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
  metadata?: Record<string, unknown>;
};

export async function createUserApi(payload: CreateUserPayload) {
  console.log("payload", payload);
}

export function mapApiValidationErrors(response: ApiValidationErrorResponse) {
  return Object.fromEntries(
    response.errors?.map((error) => [
      error.field,
      {
        message: error.message,
        type: "server",
        code: error.code,
      },
    ]) ?? []
  );
}
```

---

## 39. Adapter React Example: App Entry

```tsx
// packages/adapter-react-example/src/app.tsx

import { UserObjectForm } from "./features/users/user-object-form";
import { UserIdForm } from "./features/users/user-id-form";

export function App() {
  return (
    <main>
      <section>
        <h1>Valfuse Adapter React Example</h1>
        <p>Example penggunaan native schema, register, Controller, dan setErrors.</p>
      </section>

      <section>
        <h2>Object Value Example</h2>
        <UserObjectForm />
      </section>

      <section>
        <h2>ID Value Example</h2>
        <UserIdForm />
      </section>
    </main>
  );
}
```

---

## 40. Poin yang Harus Terpenuhi

### 40.1 Repository

- Repo bernama `valfuse-node`.
- Menggunakan `npm`.
- Menggunakan `npm workspaces`.
- Menggunakan `Turborepo`.
- Memiliki `turbo.json`.
- Memiliki `package-lock.json`.
- Memiliki folder `packages/core`.
- Memiliki folder `packages/adapter-react`.
- Memiliki folder `packages/adapter-react-example`.
- `adapter-react-example` berada tepat di `valfuse-node/packages/adapter-react-example`.
- `adapter-react-example` bersifat `private: true`.

### 40.2 Core Package

- Menyediakan `createSchema()`.
- Menyediakan native schema validation.
- Tidak bergantung pada Zod.
- Tidak bergantung pada React.
- Tidak bergantung pada localization package.
- Mendukung error object:
  - `message`
  - `type`
  - `code`
  - `metadata`
- Mendukung rule string minimal:
  - `required`
  - `min`
  - `max`
  - `email`
  - `regex`
- Mendukung rule object:
  - `required`
- Mendukung rule generic:
  - `custom`
  - `matchField`
- Semua public API diexport dari `index.ts`.

### 40.3 Adapter React Package

- Menyediakan `useValfuseForm()`.
- Menggunakan `react-hook-form` sebagai form engine.
- Mengekspos `register()`.
- Mengekspos `control`.
- Kompatibel dengan `Controller` resmi dari `react-hook-form`.
- Mengekspos `handleSubmit`.
- Mengekspos `formState`.
- Menyediakan `form.setErrors()`.
- `form.setErrors()` menerima:
  - `Record<string, string>`
  - `Record<string, ValfuseError>`
- Error schema masuk ke `form.formState.errors`.
- Error dari `setErrors()` masuk ke `form.formState.errors`.
- UI cukup membaca `form.formState.errors.field?.message`.
- Semua public API diexport dari `index.ts`.

### 40.4 Adapter React Example Package

- Example dapat dijalankan secara lokal menggunakan `npm`.
- Example menggunakan `@valfuse-node/core` dari workspace.
- Example menggunakan `@valfuse-node/adapter-react` dari workspace.
- Example memiliki minimal dua form:
  - `UserObjectForm`
  - `UserIdForm`
- Example menunjukkan penggunaan `register()`.
- Example menunjukkan penggunaan `Controller`.
- Example menunjukkan custom dropdown object.
- Example menunjukkan custom dropdown ID.
- Example menunjukkan `form.setErrors()`.
- Example menunjukkan mapping API validation response.
- Example tidak memakai Zod.
- Example tidak memakai localization package.
- Example tidak memakai UI component library eksternal sebagai dependency utama.

### 40.5 Documentation

- README root menjelaskan tujuan library.
- README `core` menjelaskan `createSchema()`.
- README `adapter-react` menjelaskan `useValfuseForm()`.
- README `adapter-react-example` menjelaskan cara menjalankan example.
- Dokumentasi menjelaskan kapan memakai:
  - `register()`
  - `Controller`
  - `roleId: string`
  - `role: Role | null`

### 40.6 Testing & Quality

- Core validation memiliki unit test.
- Adapter React memiliki minimal integration/component-level test.
- Example dapat dijalankan tanpa error.
- TypeScript compile harus lolos.
- Lint harus lolos.
- Build harus lolos.
- Tidak ada dependency yang tidak diperlukan.
- Tidak ada import langsung ke internal module package lain.

---

## 41. Definition of Ready

Sebuah task/issue untuk `valfuse-node` dianggap Ready jika memenuhi kriteria berikut.

### 41.1 Requirement Ready

- Tujuan task jelas.
- Package target jelas:
  - `core`
  - `adapter-react`
  - `adapter-react-example`
- Output yang diharapkan jelas.
- API yang akan dibuat/diubah sudah disebutkan.
- Contoh penggunaan sudah tersedia.
- Behavior error sudah dijelaskan.
- Edge case utama sudah disebutkan.
- Tidak ada requirement yang masih ambigu.

### 41.2 Schema Ready

Untuk task terkait schema/rule, harus sudah jelas:

- field type yang terdampak;
- nama rule;
- bentuk `value`;
- bentuk `error`;
- contoh valid input;
- contoh invalid input;
- expected error message;
- expected error code;
- apakah rule sync atau async;
- apakah rule termasuk MVP atau advanced.

Contoh DoR schema rule:

```txt
Rule: regex
Field type: string
Value: RegExp | { pattern: string; flags?: string }
Invalid behavior: jika value tidak match pattern
Error output: error.message dari schema rule
```

### 41.3 Adapter React Ready

Untuk task terkait `adapter-react`, harus sudah jelas:

- API React yang terdampak;
- kompatibilitas dengan `react-hook-form`;
- apakah memakai `register()`;
- apakah memakai `Controller`;
- expected output di `form.formState.errors`;
- behavior `setErrors()`;
- behavior `clearErrors()`;
- default mode validation;
- contoh usage di UI.

### 41.4 Example Ready

Untuk task terkait `adapter-react-example`, harus sudah jelas:

- contoh form yang akan dibuat;
- schema yang digunakan;
- form values type;
- UI component yang digunakan;
- apakah memakai `register()` atau `Controller`;
- expected visual behavior;
- expected validation behavior;
- expected server error behavior;
- cara menjalankan example.

### 41.5 Technical Ready

Sebelum development dimulai:

- struktur folder sudah disepakati;
- package manager `npm` sudah disepakati;
- monorepo tool `Turborepo` sudah disepakati;
- dependency sudah jelas;
- peer dependency sudah jelas;
- naming function sudah jelas;
- tidak ada konflik dengan scope package;
- tidak ada coupling ke Zod/localization/UI library;
- acceptance criteria sudah tersedia.

---

## 42. Definition of Done

Sebuah task dianggap Done jika:

- implementasi sesuai requirement;
- TypeScript compile tanpa error;
- lint tanpa error;
- test terkait lolos;
- example tetap bisa dijalankan;
- dokumentasi diperbarui;
- public API diexport dari `index.ts`;
- tidak ada breaking change tanpa catatan;
- tidak ada dependency tidak perlu;
- error tampil di `form.formState.errors.field?.message`;
- `form.setErrors()` berfungsi untuk string dan object error;
- penggunaan `register()` tetap work;
- penggunaan `Controller` tetap work;
- tidak ada import langsung ke implementasi internal package lain;
- package manager tetap `npm`;
- pipeline Turbo tetap berjalan.

---

## 43. MVP Scope

### 43.1 Core

MVP `@valfuse-node/core`:

```txt
createSchema()
validateSchema()
normalized errors
string rules: required, min, max, email, regex
object rules: required
generic rules: custom, matchField
```

### 43.2 Adapter React

MVP `@valfuse-node/adapter-react`:

```txt
useValfuseForm()
createValfuseResolver()
register support
Controller support via control
form.setErrors()
```

### 43.3 Adapter React Example

MVP `@valfuse-node/adapter-react-example`:

```txt
Vite React app
UserObjectForm
UserIdForm
TextInput
RoleDropdownObject
RoleDropdownId
API error mapping example
README cara menjalankan
```

Out of scope MVP:

```txt
Zod integration
localization package
UI component library
API client sungguhan
toast handling
routing/redirect
advanced transform
complex nested object engine
deep array schema
async validation
```

---

## 44. Kesimpulan

`valfuse-node` dibangun sebagai library generic dengan arah utama:

```txt
Native config-first schema
Zod-like rule naming tanpa dependency Zod
React Hook Form adapter
Support register()
Support Controller
Unified error model
Generic setErrors()
Npm workspaces
Turborepo monorepo
Adapter React Example sebagai reference implementation
No localization dependency
No UI dependency untuk package utama
```

Package/folder final:

```txt
@valfuse-node/core
@valfuse-node/adapter-react
@valfuse-node/adapter-react-example
```

Dengan desain ini, `valfuse-node` tetap ringan, fleksibel, scalable, maintainable, dan tidak terikat ke framework/backend/localization/UI component tertentu.
