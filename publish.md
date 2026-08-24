# CI/CD & Publikasi — @valfuse-node (Monorepo)

Dokumentasi ini menjelaskan pipeline _Continuous Integration_ (CI) dan alur
publikasi paket **@valfuse-node** (monorepo) ke npm yang dijalankan oleh GitHub
Actions, beserta tooling _git governance_ lokal yang mengontrol kualitas commit.

Monorepo berisi **5 paket library** yang dipublikasikan ke npm, semuanya
scoped di bawah `@valfuse-node/*`:

| Package                      | Workspace path          | Ekspor utama                                           |
| ---------------------------- | ----------------------- | ------------------------------------------------------ |
| `@valfuse-node/core`         | `packages/core`         | Umbrella entry (re-export form/localization/react/vue) |
| `@valfuse-node/form`         | `packages/form`         | Validasi & state form framework-agnostic               |
| `@valfuse-node/localization` | `packages/localization` | Compiler, CLI, runtime i18n                            |
| `@valfuse-node/react`        | `packages/react`        | React adapter (hooks + controller)                     |
| `@valfuse-node/vue`          | `packages/vue`          | Vue adapter (composables)                              |

Dua workflow GitHub Actions dikelola di `.github/workflows/`:

| File          | Workflow  | Tujuan                                                |
| ------------- | --------- | ----------------------------------------------------- |
| `ci.yml`      | `CI`      | Validasi setiap push/PR ke `master`/`main`            |
| `publish.yml` | `Publish` | Rilis otomatis ke npm saat tag `v<ver>-<pkg>` di-push |

Script agregat root `validate` menjalankan seluruh gerbang kualitas secara
lokal agar apa yang di-push sudah lolos mayoritas gate CI:

```bash
npm run validate   # format:check && lint && typecheck && test
```

---

## 1. Pekerjaan Prasyarat / Setup

### 1.1 Secret `NPM_PUBLISH_TOKEN`

Workflow `Publish` meng-autentikasi ke registry npm melalui GitHub secret
`NPM_PUBLISH_TOKEN`. Setup sekali:

1. [npmjs.com → Access Tokens → Generate New Token](https://www.npmjs.com/settings/%3Cyour-username%3E/tokens)
   — pilih tipe **Automation**, scope `read/write publish`.
2. GitHub → _repo_ → **Settings → Secrets and variables → Actions →
   New repository secret**.
3. Nama **persis** `NPM_PUBLISH_TOKEN`, lalu simpan.

> Tanpa secret ini, langkah `Publish package` gagal dengan `401`.
> Tipe _Automation_ (bukan _Publish_ klasik) adalah rekomendasi npm untuk CI.

### 1.2 `.nvmrc`

Repo memuat file `.nvmrc` berisi versi Node LTS (misal `20`) yang dipakai oleh
`actions/setup-node` (`node-version-file: ".nvmrc"`) sehingga versi runner
selalu konsisten dengan pengembangan lokal. Setiap paket juga mendeklarasikan
`engines.node: ">=20.0.0"` di `package.json`-nya sebagai kontrak minimum Node.

---

## 2. Workflow CI (`ci.yml`)

### 2.1 Trigger

| Event          | Detail                                     |
| -------------- | ------------------------------------------ |
| `push`         | Branch `master` dan `main`                 |
| `pull_request` | Semua pull request (tidak dibatasi branch) |

### 2.2 Job: `validate`

Job `validate` berjalan sebagai single job di runner `ubuntu-latest` dan
menjalankan pipeline lengkap secara berurutan:

1. **Checkout** — `actions/checkout@v6`.
2. **Setup Node** — `actions/setup-node@v6`, node versi dari `.nvmrc`,
   cache npm.
3. **Install** — `npm ci` (deterministik berdasar `package-lock.json`).
4. **Format check** — `npm run format:check` (Prettier, `--check .`).
5. **Lint** — `npm run lint` (Turborepo → ESLint di setiap workspace).
6. **Typecheck** — `npm run typecheck` (Turborepo → `tsc --noEmit`).
7. **Test with coverage** — `npm run test:coverage`
   (Turborepo → Vitest `--coverage`, provider `@vitest/coverage-v8`).
8. **Build** — `npm run build` (Turborepo → tsup di semua package).
9. **Security audit** — `npm audit --audit-level=high`.

Output: CI **pass** hanya jika seluruh langkah sukses; satu langkah gagal →
workflow `failure` dan terlihat di commit/PR.

Badge status CI dapat ditambahkan ke README:

```md
[![CI](https://github.com/alpinnz/valfuse-node/actions/workflows/ci.yml/badge.svg)](https://github.com/alpinnz/valfuse-node/actions/workflows/ci.yml)
```

---

## 3. Workflow Publish (`publish.yml`)

### 3.1 Trigger

```yaml
on:
  push:
    tags: ["v*"]
```

Artinya: setiap kali **tag berprefiks `v`** di-push ke remote
(`git push origin <tag>`), GitHub Actions menjalankan workflow. Karena repo
monorepo, **tag menentukan paket mana** yang diterbitkan.

### 3.2 Skema tag: `v<semver>-<package>`

Penerbitan selalu per-package. Untuk menerbitkan **satu** paket, buat tag
berformat berikut (package = path di `packages/`):

```
v<semver>-<package>
```

Contoh:

| Tag                   | Paket diterbitkan            |
| --------------------- | ---------------------------- |
| `v0.4.0-core`         | `@valfuse-node/core`         |
| `v0.4.0-form`         | `@valfuse-node/form`         |
| `v0.3.1-localization` | `@valfuse-node/localization` |
| `v0.4.0-react`        | `@valfuse-node/react`        |
| `v0.4.0-vue`          | `@valfuse-node/vue`          |

- Tag **tanpa suffix** seperti `v0.3.0` atau nama paket yang **tidak dikenal**
  (mis `v0.3.0-foo`) **diabaikan** — workflow akan _skip_ tanpa menerbitkan apa
  pun.
- Gunakan **semver** pada `<semver>` (contoh `0.4.0`, `0.4.1`).

### 3.3 Job: `publish` (single job)

Langkah lengkap:

1. `actions/checkout@v6`.
2. `actions/setup-node@v6` dengan
   `registry-url: https://registry.npmjs.org` (menyiapkan kredensial npm).
3. `npm ci`.
4. **Resolve target package dari tag** — memisahkan `<pkg>` dan `<semver>`,
   whitelist `core|form|localization|react|vue`; jika tag tidak pas → skip.
5. **Verify version matches tag** — membandingkan `<semver>` pada tag dengan
   field `version` pada `packages/<pkg>/package.json`. Jika tidak sama;
   workflow **gagal (exit 1) tanpa publish** (lihat §6.3).
6. `npm test --workspace=packages/<pkg>` — gerbang pengujian.
7. `npm run build --workspace=packages/<pkg>`.
8. `npm publish --workspace=packages/<pkg> --provenance --access public`
   dengan env `NODE_AUTH_TOKEN: ${{ secrets.NPM_PUBLISH_TOKEN }}` —
   hanya `dist/` + `README.md` + `LICENSE` (sesuai `files` di tiap
   `package.json`) yang diunggah. Flag `--provenance` menempelkan bukti asal
   build (SLSA) ke metada paket (lihat §3.5); `--access public` valid untuk
   scoped package publik meski `publishConfig.access` sudah mengatur hal yang
   sama.

> Workflow memakai `--workspace`, sehingga hanya paket target yang diuji,
> dibangun, dan diterbitkan — tidak seluruh monorepo, dan tidak pernah
> menerbitkan dua paket sekaligus.

### 3.4 Guard tambahan

- `permissions: contents: read` — workflow tidak meminta izin menulis ke repo
  (kecuali `id-token: write` khusus provenance, lihat §3.5).
- `timeout-minutes: 20` — membatasi durasi job supaya tidak berjalan abadi.
- `concurrency: group: publish-${{ github.ref }}` — tag yang sama hanya punya
  satu run aktif; run baru menggantikan yang lama tanpa tumpang-tindih.
- **Check version not already published** — sebelum build/publish, workflow
  menjalankan `npm view "<pkg>@<ver>" version`; jika versi sudah ada di npm,
  workflow **gagal cepat** dengan pesan jelas (bukan `EPUBLISHCONFLICT`
  tersembunyi di langkah publish).

### 3.5 Provenance (SLSA)

Workflow menerbitkan dengan **npm provenance**:

```yaml
permissions:
  contents: read
  id-token: write
```

- `npm publish --provenance` membuat GitHub Actions menempelkan _signed
  provenance_ (asal build) ke metada paket di npm — bukti bahwa paket
  benar-benar dibangun dari repo ini, bukan kompromi rantai pasok.
- Dipublikasikan ke registry publik; dapat diinspeksi konsumen via
  `npm view @valfuse-node/<pkg> provenance`.
- Tidak ada secret ekstra yang diperlukan selain `NPM_PUBLISH_TOKEN`;
  provenance memakai OIDC yang aktif default di GitHub.

---

## 4. Tooling Git Governance Lokal

Semua alat ini berjalan **lokal sebelum commit** sehingga kode yang di-push
sudah lolos sebagian besar gate CI.

| Tool        | File config                           | Peran                                        |
| ----------- | ------------------------------------- | -------------------------------------------- |
| ESLint      | `eslint.config.mjs`                   | lint source (flat config, TS)                |
| Prettier    | `.prettierrc.json`, `.prettierignore` | format source & docs                         |
| Husky       | `husky/`                              | menjalankan git hooks                        |
| Commitlint  | `commitlint.config.mjs`               | validasi pesan commit (Conventional Commits) |
| Lint-staged | `package.json` (`lint-staged`)        | lint/format pada file yang di-stage          |

### 4.1 Husky hooks → terautomasi saat `npm install` lewat `prepare`

Setiap install (termasuk `npm ci` di CI) menjalankan `prepare: husky` yang
mengaktifkan hooks. Hook yang aktif:

- **`pre-commit`** → `npx lint-staged` — memformat & me-lint file staged
  sebelum commit _created_**.
- **`commit-msg`** → `npx --no -- commitlint --edit "$1"` — memvalidasi pesan
  commit mengikuti **Conventional Commits**.

### 4.2 Aturan Commitlint (commitlint.config.mjs)

```js
type-enum: ['feat','fix','docs','style','refactor','perf','test','build','ci','chore','revert']
scope-enum: ['core','form','localization','react','vue','examples', 'react-example','vue-example','adapter','repository','release','changelog','eslint','prettier','husky','commitlint','ci','deps','docs','adr','tools','package','cli']
header-max-length: 72
subject-case: never sentence/start/pascal/upper
```

Contoh pesan yang valid:

```bash
feat(form): add date-field validation
fix(react): sync valuesRef before submit
test(localization): cover enum interpolation
ci: add per-package tag publish workflow
chore(release): bump @valfuse-node/react to 0.4.0
```

Pesan yang ditolak hook:

```bash
release: v0.4.0                 # invalid type
Feature(react): add X           # uppercase, wrong case
feat(react): Add X              # subject capitalize  → rejected
feat: add x                     # scope tidak terdaftar → ditolak
```

---

## 5. Perbedaan `ci.yml` vs `publish.yml`

| Aspek             | `ci.yml`                                | `publish.yml`                                 |
| ----------------- | --------------------------------------- | --------------------------------------------- |
| Trigger           | push `master`/`main`, semua PR          | push tag `v*`                                 |
| Skema tag         | —                                       | `v<ver>-<pkg>` (per package)                  |
| Setup runner      | Node (`.nvmrc`)                         | Node (`.nvmrc`) + registry-url                |
| Instalasi         | `npm ci`                                | `npm ci`                                      |
| Cakupan           | seluruh workspace (turbo)               | satu package (`--workspace`)                  |
| Urutan langkah    | fmt → lint → tsc → test → build → audit | resolve tag → verify → test → build → publish |
| Akses keluar      | read-only (read)                        | menulis ke npm registry                       |
| Secret dibutuhkan | tidak                                   | `NPM_PUBLISH_TOKEN`                           |

---

## 6. Alur Release Lengkap (Per-Package)

Contoh rilis `@valfuse-node/react` ke `0.4.0`:

1. **Naikkan versi** di `packages/react/package.json` (semver).
   Bila ada perubahan dependency workspace (mis. menaikkan `@valfuse-node/form`
   rilis), rilis dimulai dari paket dependensi dulu — lihat [§6.2](#62-dependency-order-untuk-release).

2. **Commit & push** ke `master` — pesan commit konvensional:

   ```bash
   git add packages/react/package.json package-lock.json
   git commit -m "chore(release): bump @valfuse-node/react to 0.4.0"
   git push origin master        # trigger CI
   ```

3. **Verifikasi tag lokal** sebelum push (guard CLI):

   ```bash
   npm run release:verify -- v0.4.0-react
   ```

   Skrip ini memastikan tag `v<semver>-<pkg>` valid, paket dikenali, dan versi
   sama dengan `package.json` di `packages/<pkg>`. Tidak cocok → exit 1.

4. **Buat tag rilis**:

   ```bash
   git tag v0.4.0-react
   git push origin v0.4.0-react  # trigger Publish
   ```

5. **Tunggu workflow `Publish`** → tab **Actions** → run terbaru. Pastikan
   langkah **Verify version matches tag** hijau.

6. **Verifikasi di npm** → buka
   `https://www.npmjs.com/package/@valfuse-node/react`.

### 6.1 Checklist rilis

| Kondisi                                      | Konsekuensi jika gagal                 |
| -------------------------------------------- | -------------------------------------- |
| `package.json` version == tag (tanpa prefix) | Publish ditolak di guard (exit 1)      |
| Pesan commit lint-valid (commitlint)         | Commit ditolak oleh hook               |
| Lint + format + typecheck + test lulus       | Workflow gagal sebelum publish         |
| Secret `NPM_PUBLISH_TOKEN` tersedia          | `npm publish` gagal autentikasi (401)  |
| Versi belum pernah dipublish sebelumnya      | `npm publish` error `EPUBLISHCONFLICT` |

### 6.2 Dependency-Order untuk RELEASE

Package adapter (`react`, `vue`, `core`) mengimpor `@valfuse-node/*` (misal
laris `react` memakai `form` + `localization`). Ada _dependency order_ yang
disarankan saat rilis:

1. `@valfuse-node/localization` dan/atau `@valfuse-node/form`
2. `@valfuse-node/react` (tergantung form + localization)
3. `@valfuse-node/vue` (tergantung form)
4. `@valfuse-node/core` (umbrella — re-export semua)

> Publikasikan packages dependensi terlebih dahulu bila versi constraintnya
> berubah; bukan wajib bila hanya bump versi minor adaptor tanpa mengubah
> dependency.

---

## 7. Troubleshooting

### 7.1 Lint/format gagal di CI tapi lewat lokal

- Penyebab: versi configulkilit beda / file tak diformat.
- Solusi: `npm run format && npm run lint` di lokal; periksa `npx turbo run
lint` cakupan seluruh workspace.

### 7.2 Tag X tidak match package.json version

- Penyebab: tag dibuat dari versi yang tidak sinkron.
- Solusi: `npm` bump `packages/<pkg>/package.json` dulu, commit, lalu buat tag baru.

### 7.3 Publish gagal auth / 401

- Penyebab: `NPM_PUBLISH_TOKEN` belum/keliru di-set, atau token kedaluwarsa.
- Solusi: regenerasi token Automation, update secret, hapus token lama.

### 7.4 `EPUBLISHCONFLICT`

- Versi sudah pernah terbit → naikkan lagi (patch/minor) dan buat tag baru.

### 7.5 Workflow publish skip (tidak publish)

- Penyebab: tag bare `v0.3.0` atau tag unknown package — sesuai desain.
- Solusi: gunakan format `v<semver>-<package>`.

---

## 8. Ringkasan Visual

```mermaid
flowchart LR
    A[Push commit / PR on master] --> CI[Workflow CI<br/>format + lint + typecheck<br/>+ test:coverage + build + audit]
    T[Push tag v0.4.0-react] --> P[Publish workflow<br/>test + build + verify version]
    CI -->|pass| OK[Green]
    P -->|verify ok| PUB[npm publish<br/>NPM_PUBLISH_TOKEN]
    PUB --> NPMWEB[npmjs.com/package/@valfuse-node/react]
    C0[Create tag v0.4.0-react] --> T
    B0[git commit -m 'chore(release): bump @valfuse-node/react to 0.4.0'] --> C0
```

Jika salah satu langkah gagal, pipeline berhenti di langkah tsb dan tidak ada
paket yang diterbitkan.
