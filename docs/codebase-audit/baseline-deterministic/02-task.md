# Baseline Deterministic Task Breakdown

## 1. Task Status Definitions

- `TODO`: belum dikerjakan
- `IN_PROGRESS`: sedang dikerjakan
- `PASS`: berhasil
- `FAIL`: gagal
- `BLOCKED`: tidak dapat dijalankan
- `SKIPPED`: tidak relevan
- `NOT_AVAILABLE`: tooling atau script tidak tersedia

## 2. Tasks

| ID     | Task                          | Command or Inspection                                         | Expected Result                                        | Risk   | Status  |
| ------ | ----------------------------- | ------------------------------------------------------------- | ------------------------------------------------------ | ------ | ------- |
| BD-001 | Validate runtime              | `node --version`, `npm --version`                             | Node v24, npm 11.x sesuai lockfile                     | Low    | TODO    |
| BD-002 | Validate package manager      | `npm --version` + inspeksi `packageManager`                   | npm sebagai package manager sesuai `package-lock.json` | Low    | TODO    |
| BD-003 | Validate lockfile             | Inspeksi `package-lock.json` + `npm ci --dry-run`? / `npm ls` | Lockfile konsisten, dependency ter-resolve             | Low    | TODO    |
| BD-004 | Validate dependencies         | `npm ls --all`                                                | Semua dependency ter-resolve tanpa missing/extraneous  | Medium | TODO    |
| BD-005 | Run format check              | N/A — Prettier tidak terpasang                                | —                                                      | Low    | SKIPPED |
| BD-006 | Run lint                      | `npm run lint` (`turbo lint`)                                 | Exit 0, tanpa lint error                               | Low    | TODO    |
| BD-007 | Run typecheck                 | `npm run typecheck` (`turbo typecheck`)                       | Exit 0, tanpa type error                               | Low    | TODO    |
| BD-008 | Run unit tests                | `npm run test` (`turbo test`)                                 | Semua test lulus                                       | Low    | TODO    |
| BD-009 | Run integration tests         | Bagian dari vitest run (React jsdom + `@testing-library`)     | Test lulus                                             | Medium | TODO    |
| BD-010 | Run component tests           | Bagian dari vitest run (Vue + `@vue/test-utils`)              | Test lulus                                             | Medium | TODO    |
| BD-011 | Run E2E tests                 | N/A — Playwright/Cypress tidak terpasang                      | —                                                      | Medium | SKIPPED |
| BD-012 | Run build                     | `npm run build` (`turbo build`)                               | Exit 0, artifact di `dist/`                            | Low    | TODO    |
| BD-013 | Run coverage                  | `npx vitest run --coverage` per package (via turbo `--force`) | Laporan coverage dihasilkan                            | Low    | TODO    |
| BD-014 | Run dependency security audit | `npm audit`                                                   | Tidak ada vulnerability high/critical                  | Low    | TODO    |
| BD-015 | Check unused dependencies     | Inspeksi statis `dependencies` vs import di `src`             | Tidak ada dependency tak terpakai                      | Low    | TODO    |
| BD-016 | Check duplicate code          | Inspeksi statis + cek duplicate dependency                    | Tidak ada duplikasi berarti                            | Low    | TODO    |
| BD-017 | Analyze bundle                | Inspeksi `dist/` dan bundle output tsup                       | Artifact lengkap, ukuran wajar                         | Low    | TODO    |
| BD-018 | Inspect CI/CD gates           | Inspeksi `.github/workflows` dan pipeline                     | Tidak ada CI (gap)                                     | Low    | TODO    |

Task BD-005 dan BD-011 ditandai `SKIPPED` karena tooling formatter dan E2E tidak tersedia di repository (bukti: tidak ada Prettier config, tidak ada Playwright/Cypress, tidak ada script terkait).

## 3. Task Dependencies

| Task                   | Depends On             | Reason                                                     |
| ---------------------- | ---------------------- | ---------------------------------------------------------- |
| BD-004                 | BD-001, BD-002, BD-003 | Resolusi dependency membutuhkan runtime dan lockfile valid |
| BD-006                 | BD-004                 | Lint butuh dependency ter-resolve                          |
| BD-007                 | BD-004                 | Typecheck butuh dependency ter-resolve                     |
| BD-008, BD-009, BD-010 | BD-004                 | Test butuh dependency ter-resolve                          |
| BD-012                 | BD-004                 | Build butuh dependency ter-resolve                         |
| BD-013                 | BD-008                 | Coverage mengulang eksekusi test                           |
| BD-017                 | BD-012                 | Bundle analysis membaca artifact hasil build               |

## 4. Execution Order

1. BD-001 → BD-002 → BD-003 → BD-004 (environment & dependency)
2. BD-006 (lint) → BD-007 (typecheck)
3. BD-008/BD-009/BD-010 (test)
4. BD-012 (build) → BD-017 (bundle analysis)
5. BD-013 (coverage)
6. BD-014 (security audit)
7. BD-015 (unused dependencies), BD-016 (duplicate code) — inspeksi statis
8. BD-018 (CI/CD gates)

## 5. Blocking Conditions

| Task          | Possible Blocker                             | Required Action                                    |
| ------------- | -------------------------------------------- | -------------------------------------------------- |
| BD-004        | `node_modules` tidak sinkron dengan lockfile | Jalankan `npm ci` (menjaga lockfile)               |
| BD-006        | ESLint gagal karena konfigurasi              | Catat root cause, tidak memperbaiki otomatis       |
| BD-013        | Coverage v8 tidak terpasang di package       | Catat sebagai NOT_AVAILABLE untuk package tersebut |
| BD-014        | Tidak ada akses jaringan / registry          | Catat sebagai BLOCKED                              |
| BD-015–BD-018 | N/A — inspeksi statis                        | —                                                  |

## 6. Validation Criteria

### Environment

- runtime sesuai konfigurasi (`engines.node >= 20` terpenuhi oleh Node v24)
- package manager sesuai lockfile (npm, lockfileVersion 3)
- dependency dapat di-resolve tanpa perubahan lockfile

### Format

- N/A — formatter tidak tersedia (SKIPPED)

### Lint

- exit code `0`
- tidak ada lint error
- warning dicatat terpisah

### Typecheck

- exit code `0`
- tidak ada type error

### Test

- seluruh test yang dijalankan selesai
- tidak ada failed test
- flaky indication dicatat

### Build

- exit code `0`
- artifact berhasil dibuat di `dist/`
- warning dicatat

### Coverage

- laporan coverage berhasil dihasilkan (threshold tidak dikonfigurasi)

### Security Audit

- vulnerability dicatat berdasarkan severity
