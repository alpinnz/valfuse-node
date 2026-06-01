# @valfuse-node/example-react

Reference implementation dan playground untuk `valfuse-node`.

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
cd packages/examples/react-example
npm run dev
```

Server akan berjalan di `http://localhost:5173`.

## Isi Example

### UserObjectForm

Form yang menyimpan role sebagai object penuh `Role | null`.

Mendemonstrasikan:
- `register()` untuk field `name` dan `email`
- `Controller` untuk field `role` (custom dropdown)
- `form.setErrors()` untuk server error
- Object value pattern

### UserIdForm

Form yang menyimpan role sebagai ID string.

Mendemonstrasikan:
- `register()` untuk field `name` dan `email`
- `Controller` untuk field `roleId` (custom dropdown)
- `form.setErrors()` untuk server error
- ID value pattern

## Struktur

```
src/
  features/
    users/
      components/
        text-input.tsx          ← input dengan forwardRef, kompatibel register()
        role-dropdown-object.tsx ← dropdown yang menyimpan object
        role-dropdown-id.tsx     ← dropdown yang menyimpan ID
      schemas/
        user-object.schema.ts   ← schema untuk UserObjectForm
        user-id.schema.ts       ← schema untuk UserIdForm
      types/
        user-form.types.ts      ← type definitions
      user.api.ts               ← mock API + error mapping
      user-object-form.tsx      ← form dengan role object
      user-id-form.tsx          ← form dengan role ID
  app.tsx
  main.tsx
```
