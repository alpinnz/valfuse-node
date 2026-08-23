# Deterministic Baseline Report

## 1. Executive Summary

- Overall status: **NOT_READY**
- Repository build status: **GAGAL** — `@valfuse-node/localization` tidak dapat dibangun karena modul `src/coverage/` yang diimpor tidak ada
- Quality gate readiness: Tidak siap. Pipeline build/lint/typecheck terblokir oleh satu defect source code; security audit menemukan 5 vulnerability
- Blocking issues: 1 (modul coverage hilang → build pipeline gagal)
- Non-blocking issues: 4 (vuln devDependency, npm version drift, coverage v8 tidak lengkap, react coverage rusak akibat cascade)
- Main risks: library inti tidak dapat dipublikasikan dalam kondisi saat ini; tanpa CI, regresi seperti ini tidak terdeteksi
- Recommended immediate action: Kembalikan/implementasikan modul `packages/localization/src/coverage/build-coverage-json.ts` dan `build-coverage-html.ts` (atau refactor import), lalu verifikasi `npm run build` lintas workspace

## 2. Repository Profile

| Item             | Result                                                                            |
| ---------------- | --------------------------------------------------------------------------------- |
| Application type | Monorepo library (form validation + localization) untuk React/Vue + 2 contoh Vite |
| Stack            | TypeScript strict, Turborepo, tsup (esbuild), Vitest                              |
| Runtime          | Node.js ≥ 20 (terverifikasi v24.18.0)                                             |
| Package manager  | npm (lockfileVersion 3, workspaces)                                               |
| Build tool       | tsup via Turborepo                                                                |
| Test framework   | Vitest (node + jsdom), @testing-library/react, @vue/test-utils                    |
| CI/CD            | Tidak ada                                                                         |

## 3. Quality Gate Results

| Gate                  | Command                            |                     Result | Errors | Warnings | Root Cause                     |
| --------------------- | ---------------------------------- | -------------------------: | -----: | -------: | ------------------------------ |
| Environment           | `node --version` / `npm --version` |                       PASS |      0 |        1 | —                              |
| Dependency resolution | `npm ls`                           |                       PASS |      0 |        0 | —                              |
| Format                | N/A                                |                    SKIPPED |      — |        — | Prettier tidak tersedia        |
| Lint                  | `npm run lint -- --force` (turbo)  |                       FAIL |      1 |        1 | SOURCE_CODE (build dependency) |
| Lint (per package)    | `npm run lint`                     |                       PASS |      0 |        0 | —                              |
| Typecheck             | `npx tsc --noEmit` per package     |                       FAIL |     12 |        0 | SOURCE_CODE                    |
| Unit test             | `npm run test` per package         |                       PASS |      0 |        0 | —                              |
| Integration test      | vitest (react, jsdom)              |                       PASS |      0 |        0 | —                              |
| Component test        | vitest (vue)                       |                       PASS |      0 |        0 | —                              |
| E2E                   | N/A                                |                    SKIPPED |      — |        — | Tooling tidak tersedia         |
| Build                 | `npm run build` (turbo)            |                       FAIL |      1 |        0 | SOURCE_CODE                    |
| Coverage              | `npx vitest run --coverage`        | PASS (react: gagal report) |      0 |        1 | SOURCE_CODE (cascade)          |
| Security audit        | `npm audit`                        |                       FAIL |      5 |        1 | DEPENDENCY                     |
| CI/CD                 | inspeksi                           |              NOT_AVAILABLE |      — |        — | Tidak ada konfigurasi          |

## 4. Blocking Issues

### BD-FINDING-001 — Modul coverage hilang di `@valfuse-node/localization`

- Severity: **Critical** (blocking build seluruh workspace)
- Category: Source code
- Related task: BD-006, BD-007, BD-012, BD-017
- Command: `npm run build` (turbo); `npx tsc --noEmit` (packages/localization)
- Affected file: `packages/localization/src/cli/coverage.ts` (baris 5–6), `packages/localization/src/emitter/emit-report-files.ts` (baris 5)
- Evidence:
  - `src/cli/coverage.ts(5,35): error TS2307: Cannot find module '../coverage/build-coverage-json'`
  - `src/cli/coverage.ts(6,35): error TS2307: Cannot find module '../coverage/build-coverage-html'`
  - `src/emitter/emit-report-files.ts(5,35): error TS2307: Cannot find module '../coverage/build-coverage-json'`
  - `git log --all -- packages/localization/src/coverage/*` → tidak ada history (modul tidak pernah ada)
  - Direktori `packages/localization/src/coverage/` tidak ada
- Root cause: SOURCE_CODE — dua modul diimpor oleh `cli/coverage.ts` dan `emitter/emit-report-files.ts` tidak pernah dibuat (atau dihapus tanpa menghapus import)
- Impact: Memblokir build `localization`; Turbo tidak mengeksekusi build `react`/`core` dan contoh; `lint`/`typecheck` turbo gagal; error kaskade TS2307 + implicit any menyebar ke react/core/contoh; distribusi npm library tidak mungkin
- Recommended fix: Buat ulang `packages/localization/src/coverage/build-coverage-json.ts` dan `build-coverage-html.ts` sesuai kontrak yang dipakai (`buildCoverageJson(compiled.manifest)`, `buildCoverageHtml(coverage)`) atau refactor kedua caller untuk memakai modul yang ada; tambahkan test untuk `cli/coverage.ts`
- Verification: `npm run build -- --force` exit 0; `npx tsc --noEmit` di localization exit 0; lalu typecheck react/core dan contoh exit 0
- Estimated effort: S (0.5–1 hari, termasuk test)

## 5. Non-Blocking Issues

### BD-FINDING-002 — 5 vulnerability pada devDependency tooling

- Severity: High
- Category: Dependency
- Related task: BD-014
- Command: `npm audit`
- Affected file: `node_modules/undici` (via `jsdom` → `@valfuse-node/react`), `node_modules/vite` (via `vitest`; direct di example)
- Evidence: `npm audit` → `5 vulnerabilities (1 low, 4 high)`; undici 4 advisories (GHSA-vmh5-mc38-953g, GHSA-p88m-4jfj-68fv, GHSA-vxpw-j846-p89q, GHSA-hm92-r4w5-c3mj, dll); vite 2 high (GHSA-v6wh-96g9-6wx3, GHSA-fx2h-pf6j-xcff)
- Root cause: DEPENDENCY — `latest` di devDependencies menghasilkan versi di luar patch aman
- Impact: Terbatas pada dev tooling/test; tidak menyentuh dependency runtime library. Namun contoh aplikasi dev server (`vite`) terdampak
- Recommended fix: `npm audit fix` untuk undici; untuk vite perlu upgrade major (di luar range) — jadwalkan upgrade terkelola, tidak otomatis
- Verification: `npm audit` exit 0
- Estimated effort: S

### BD-FINDING-003 — npm version drift

- Severity: Low
- Category: Configuration
- Related task: BD-001, BD-002
- Command: `npm --version`
- Affected file: `package.json` (`packageManager: npm@11.6.2`)
- Evidence: terpasang npm 11.16.0 vs deklarasi 11.6.2
- Root cause: TOOLING
- Impact: Minor; lockfile v3 tetap kompatibel; determinisme idealnya memakai corepack
- Recommended fix: Pakai `corepack enable` atau pin npm di `packageManager` dan install
- Verification: `npm --version` = 11.6.2
- Estimated effort: XS

### BD-FINDING-004 — Coverage v8 tidak terpasang di `localization`

- Severity: Low
- Category: Configuration
- Related task: BD-013
- Command: `npx vitest run --coverage`
- Affected file: `packages/localization/package.json`
- Evidence: `@vitest/coverage-v8` tidak ada di devDependencies `localization` (core, form, react, vue sudah memilikinya)
- Root cause: CONFIGURATION
- Impact: Tidak ada baseline coverage untuk compiler `localization` padahal test-nya paling banyak (175 test)
- Recommended fix: Tambahkan `@vitest/coverage-v8` ke `packages/localization`, lalu jalankan coverage
- Verification: `npx vitest run --coverage` menghasilkan laporan untuk localization
- Estimated effort: S

## 6. Configuration Gaps

| ID    | Gap                                     | Evidence                                                  | Impact                                                          | Recommendation                                                        | Priority |
| ----- | --------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------- | -------- |
| CFG-1 | Tidak ada formatter (Prettier)          | tidak ada `.prettierrc*`/`prettier.config.*`              | Konsistensi format manual; lint tidak menegakkan gaya           | Tambah Prettier + `format:check`                                      | P2       |
| CFG-2 | Tidak ada threshold coverage            | `vitest.config.ts` tanpa `thresholds`                     | Coverage dapat turun tanpa terdeteksi                           | Tambah threshold (mis. ≥ 80% pada file inti)                          | P2       |
| CFG-3 | `latest` di seluruh devDependencies     | `package.json` seluruh workspace                          | Non-reproducible install                                        | Pin versi (lockfile sudah dipakai, tambah CI untuk menegakkan)        | P1       |
| CFG-4 | Tidak ada `paths` alias antar workspace | tsconfig tanpa `paths`; typecheck bergantung pada `dist/` | Error kaskade saat dist tidak ada; typecheck tidak murni source | Tambah `paths` ke workspace sources atau jalankan test-only typecheck | P2       |
| CFG-5 | Tidak ada `.nvmrc`/`.node-version`      | tidak ada file pin runtime                                | Versi Node bervariasi antar dev/CI                              | Tambah `.nvmrc` = 20 LTS                                              | P3       |

## 7. Missing Quality Gates

| Gate                | Current State | Impact                                     | Recommended Tool                                                 | Effort |
| ------------------- | ------------- | ------------------------------------------ | ---------------------------------------------------------------- | ------ |
| CI pipeline         | Tidak ada     | Regresi build tidak terdeteksi (kasus ini) | GitHub Actions + `npm ci && turbo run build lint typecheck test` | M      |
| Format check        | Tidak ada     | Gaya tidak konsisten                       | Prettier `--check`                                               | S      |
| Coverage gate       | Tidak ada     | Coverage bisa menurun                      | Vitest `thresholds`                                              | S      |
| Security audit gate | Manual saja   | Vuln masuk tanpa terdeteksi                | `npm audit` di CI (allow `vulnerabilities < threshold`)          | S      |
| Bundle analysis     | Tidak ada     | Ukuran bundle tidak dipantau               | `size-limit` atau bundle analysis di CI                          | S      |

## 8. Recommended Baseline

### Local Development

```bash
npm ci
npm run build
npm run lint
npm run typecheck
npm test
```

### Pull Request

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

### Main Branch

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

### Release

```bash
npm ci
npm run build
npm test
npm run publish:all
```

> Catatan: semua baseline di atas belum dapat lulus karena BD-FINDING-001 harus diperbaiki terlebih dahulu.

## 9. Recommended Package Scripts

Berikut proposal tanpa mengubah `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "turbo lint",
    "lint:fix": "turbo lint -- --fix",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "test:coverage": "turbo test -- --coverage",
    "test:ci": "turbo test",
    "build": "turbo build",
    "validate": "npm run lint && npm run typecheck && npm test && npm run build"
  }
}
```

Catatan: penambahan Prettier (untuk `format`/`format:check`) dan devDependency-nya diperlukan — ini proposal, bukan perubahan.

## 10. CI/CD Recommendations

### Required

- Pipeline CI (GitHub Actions atau setara) di tiap PR dan main: `npm ci` → `turbo run lint typecheck test build`
- `npm audit` sebagai non-blocking gate dengan triage severity

### Recommended

- Pin versi runtime Node (`.nvmrc` = 20 LTS) dan jalankan `corepack` untuk npm deterministik
- Threshold coverage Vitest pada package inti (form, localization)
- Prettier `--check` sebagai gate format

### Optional

- Bundle size budget untuk `@valfuse-node/form` dan `@valfuse-node/localization`
- Cache turbo (`TURBO_REMOTE_CACHE`) bila menggunakan service eksternal
- Matrix test Node 20 + 22 LTS

## 11. Merge Blocking Rules

| Gate           |             Pull Request |                  Main |               Release |
| -------------- | -----------------------: | --------------------: | --------------------: |
| Build          |                 ✅ Wajib |              ✅ Wajib |              ✅ Wajib |
| Lint           |                 ✅ Wajib |              ✅ Wajib |              ✅ Wajib |
| Typecheck      |                 ✅ Wajib |              ✅ Wajib |              ✅ Wajib |
| Unit test      |                 ✅ Wajib |              ✅ Wajib |              ✅ Wajib |
| Security audit | ⚠️ Non-blocking (triage) | ✅ Wajib (0 critical) | ✅ Wajib (0 critical) |
| Coverage       |          ⚠️ Non-blocking |       ⚠️ Non-blocking |       ⚠️ Non-blocking |
| Format         |          ⚠️ Non-blocking |       ⚠️ Non-blocking |       ⚠️ Non-blocking |

## 12. Prioritized Action Plan

| Priority | Action                                                                    | Impact                                            | Effort | Suggested Owner |
| -------- | ------------------------------------------------------------------------- | ------------------------------------------------- | ------ | --------------- |
| P0       | Perbaiki modul coverage hilang (`localization/src/coverage/`)             | Membuka build/lint/typecheck seluruh workspace    | S      | Maintainer      |
| P1       | Upstream/devDependency: `npm audit fix` (undici) + upgrade terkelola vite | Menutup 5 vuln                                    | S–M    | Maintainer      |
| P1       | Pin devDependencies (hapus `latest`), tambah CI pipeline                  | Reproducibility + proteksi regresi                | M      | Maintainer      |
| P2       | Tambah Prettier + threshold coverage                                      | Konsistensi & baseline kualitas                   | S      | Maintainer      |
| P2       | `paths` alias antar workspace di tsconfig                                 | Typecheck murni source, tanpa ketergantungan dist | S      | Maintainer      |
| P3       | `.nvmrc`, corepack, bundle analysis                                       | Polishing dev experience                          | S      | Maintainer      |

## 13. Commands Executed

| Command                                       | Exit Code | Result                                             |
| --------------------------------------------- | --------: | -------------------------------------------------- |
| `node --version`                              |         0 | v24.18.0                                           |
| `npm --version`                               |         0 | 11.16.0                                            |
| `npm ls --all`                                |         0 | Dependency tree resolved, tanpa missing/extraneous |
| `npm run lint` (turbo)                        |         1 | Fail di `localization#build` (cascade)             |
| `npx eslint src` (per package, 5x)            |         0 | Semua lulus                                        |
| `npx tsc --noEmit` (form)                     |         0 | PASS                                               |
| `npx tsc --noEmit` (vue)                      |         0 | PASS                                               |
| `npx tsc --noEmit` (localization)             |         2 | 3 error TS2307                                     |
| `npx tsc --noEmit` (core)                     |         2 | 2 error TS2307                                     |
| `npx tsc --noEmit` (react)                    |         2 | 6 error TS2307                                     |
| `npx tsc --noEmit` (react-example)            |         1 | TS2307 + implicit any                              |
| `npx vue-tsc --noEmit` (vue-example)          |         1 | TS2307 + implicit any                              |
| `npx vitest run` (form)                       |         0 | 360 tests passed                                   |
| `npx vitest run` (localization)               |         0 | 175 tests passed                                   |
| `npx vitest run` (react)                      |         0 | 95 tests passed                                    |
| `npx vitest run` (vue)                        |         0 | 25 tests passed                                    |
| `npm run test --workspace=@valfuse-node/core` |         0 | No tests, exit 0                                   |
| `npm run build` (turbo)                       |         1 | Fail di `localization#build`                       |
| `npx vitest run --coverage` (form)            |         0 | 73.57% stmts                                       |
| `npx vitest run --coverage` (localization)    |         0 | 98.47% stmts                                       |
| `npx vitest run --coverage` (react)           |         0 | Test 95 lulus, coverage report GAGAL (PARSE_ERROR) |
| `npx vitest run --coverage` (vue)             |         0 | 83.97% stmts                                       |
| `npm audit`                                   |         1 | 5 vulnerabilities (1 low, 4 high)                  |

## 14. Positive Findings

- **Kualitas test kuat**: 655 test lulus di 5 package, termasuk 360 unit test `form` dan 21 file test `localization` (compiler).
- **Lint bersih**: seluruh 5 package `eslint src` exit 0 tanpa error (defect hanya muncul di layer build).
- **Arsitektur re-export bersih**: `@valfuse-node/core` murni facade tanpa duplikasi domain code (tsup `external` seluruh sub-package).
- **Tidak ada unused dependency**: seluruh dependency runtime terpakai; tidak ada package `extraneous`.
- **TypeScript strict aktif**: `strict`, `noUnusedLocals`, `noUnusedParameters` — disiplin tipe baik.
- **Dokumentasi lengkap**: README komprehensif, per-package README, CHANGELOG, SECURITY.md, ADR (`docs/adr`).
- **Test environment dipisah dengan benar**: node untuk domain/compiler, jsdom untuk React, plugin Vue untuk komponen.

## 15. Limitations

- Build/typecheck downstream (react, core, contoh) tidak dapat dievaluasi penuh karena kaskade defect coverage — jumlah error TS2307/implicit any di sana bukan evaluasi final.
- Bundle analysis hanya mencakup `form` dan `vue` (satu-satunya dist yang terbentuk).
- Coverage `localization` tidak tersedia (`@vitest/coverage-v8` tidak terpasang); coverage `react` gagal men-generate report karena dist localization hilang (PARSE_ERROR). `core` tidak punya file test.
- E2E dan format check tidak dapat dijalankan (tooling tidak tersedia).
- `npm audit` hasil bersifat titik waktu (2026-08-03) dan bergantung registry.
- Script `clean` (`rm -rf`) tidak dijalankan karena tidak kompatibel Windows native dan dilarang aturan audit.

## 16. Conclusion

**Keputusan akhir: `NOT_READY`**

Alasan (berdasarkan hasil deterministik):

1. Build lintas workspace gagal (`npm run build -- --force` exit 1) karena modul `packages/localization/src/coverage/{build-coverage-json,build-coverage-html}.ts` yang diimpor tidak ada — blocking P0.
2. Typecheck gagal di 5 dari 7 target (localization, core, react, 2 contoh) — mayoritas kaskade dari poin 1, sebagian independen (ketergantungan `dist/` tanpa `paths`).
3. Gate lint/typecheck Turborepo tidak dapat berjalan karena `dependsOn ^build`.
4. `npm audit` menemukan 5 vulnerability (4 high) pada devDependency tooling.
5. Tidak ada CI/CD sehingga regresi build saat ini tidak terdeteksi oleh pipeline mana pun.

Kualitas mendasar repo kuat (test 655 lulus, lint bersih, arsitektur rapi), namun baseline deterministik belum tercapai sampai BD-FINDING-001 diperbaiki dan verifikasi ulang penuh dijalankan.
