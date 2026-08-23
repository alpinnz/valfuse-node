# Baseline Deterministic Execution Log

## 1. Execution Environment

| Item              | Value                                                         |
| ----------------- | ------------------------------------------------------------- |
| Operating system  | Windows 10 Enterprise LTSC 2021 (build 19044)                 |
| Runtime version   | Node.js v24.18.0                                              |
| Package manager   | npm 11.16.0 (lockfileVersion 3, `packageManager: npm@11.6.2`) |
| Working directory | `C:\Users\Alpinnz\Projects\smartlinkid\valfuse-node`          |
| Branch            | `master`                                                      |
| Commit            | `057b395`                                                     |

## 2. Execution Summary

| Task ID | Task                          | Command                                               | Exit Code                                     | Result                                   | Root Cause                 |
| ------- | ----------------------------- | ----------------------------------------------------- | --------------------------------------------- | ---------------------------------------- | -------------------------- |
| BD-001  | Validate runtime              | `node --version`, `npm --version`                     | 0                                             | PASS                                     | —                          |
| BD-002  | Validate package manager      | `npm --version` + inspeksi `packageManager`           | 0                                             | PASS                                     | —                          |
| BD-003  | Validate lockfile             | inspeksi `package-lock.json` + `git diff`             | 0                                             | PASS                                     | —                          |
| BD-004  | Validate dependencies         | `npm ls --all`                                        | 0                                             | PASS                                     | —                          |
| BD-005  | Run format check              | N/A                                                   | —                                             | SKIPPED                                  | —                          |
| BD-006  | Run lint                      | `npm run lint` (turbo) / `npx eslint src` per package | 1 / 0                                         | FAIL (turbo) / PASS (per package)        | SOURCE_CODE (build blokir) |
| BD-007  | Run typecheck                 | `npx tsc --noEmit` / `vue-tsc --noEmit` per package   | 2 (localization) / 1 (contoh) / 0 (form, vue) | FAIL (localization, core, react, contoh) | SOURCE_CODE                |
| BD-008  | Run unit tests                | `npx vitest run` per package + `npm run test` (core)  | 0                                             | PASS (655 test)                          | —                          |
| BD-009  | Run integration tests         | vitest run (react, jsdom + testing-library)           | 0                                             | PASS (95 test)                           | —                          |
| BD-010  | Run component tests           | vitest run (vue, @vue/test-utils)                     | 0                                             | PASS (25 test)                           | —                          |
| BD-011  | Run E2E tests                 | N/A                                                   | —                                             | SKIPPED                                  | —                          |
| BD-012  | Run build                     | `npm run build` (turbo)                               | 1                                             | FAIL                                     | SOURCE_CODE                |
| BD-013  | Run coverage                  | `npx vitest run --coverage` per package               | 0                                             | PASS (react: error coverage)             | SOURCE_CODE (dist hilang)  |
| BD-014  | Run dependency security audit | `npm audit`                                           | 1                                             | FAIL                                     | DEPENDENCY                 |
| BD-015  | Check unused dependencies     | inspeksi statis imports vs deps                       | 0                                             | PASS                                     | —                          |
| BD-016  | Check duplicate code          | `npm ls`, inspeksi contoh                             | 0                                             | PASS                                     | —                          |
| BD-017  | Analyze bundle                | inspeksi `dist/` (form, vue)                          | 0                                             | PASS (parsial)                           | SOURCE_CODE                |
| BD-018  | Inspect CI/CD gates           | inspeksi `.github`/pipeline                           | —                                             | NOT_AVAILABLE                            | —                          |

## 3. Detailed Execution

### BD-001 — Validate Runtime

- Status: PASS
- Command: `node --version`, `npm --version`
- Working directory: `C:\Users\Alpinnz\Projects\smartlinkid\valfuse-node`
- Exit code: 0
- Output summary: `v24.18.0`, `11.16.0`
- Evidence: memenuhi `engines.node >= 20` (`packages/localization/package.json`); runtime terpasang di atas minimum.
- Root cause: —
- Notes: Versi identik dengan baseline run sebelumnya.

### BD-002 — Validate Package Manager

- Status: PASS
- Command: `npm --version` + inspeksi `packageManager` root
- Working directory: root
- Exit code: 0
- Output summary: npm 11.16.0; `packageManager: npm@11.6.2`; lockfile `lockfileVersion: 3`
- Evidence: `package.json` (root) baris 4, `package-lock.json` baris 2.
- Root cause: —
- Notes: npm dipakai konsisten; tanpa `yarn.lock`/`pnpm-lock.yaml`/`bun.lock`.

### BD-003 — Validate Lockfile

- Status: PASS
- Command: inspeksi `package-lock.json` + `git diff package-lock.json`
- Working directory: root
- Exit code: 0
- Output summary: Lockfile konsisten dengan workspace dan devDependencies. Working tree berisi modifikasi `package-lock.json` (pergeseran metadata flag `peer` pada beberapa entry, tanpa perubahan versi dependency).
- Evidence: `git diff --stat package-lock.json` → `+4 -7`, hanya flag `peer: true` dipindah antar package.
- Root cause: — (perubahan pre-existing, tidak terkait audit)
- Notes: Tidak ada perubahan versi dependency pada diff; audit tidak menyentuh file ini.

### BD-004 — Validate Dependencies

- Status: PASS
- Command: `npm ls --all`
- Working directory: root
- Exit code: 0
- Output summary: Seluruh dependency ter-resolve; tidak ada `missing`, `invalid`, atau `extraneous`. Dedup aktif (banyak `deduped`).
- Evidence: `npm ls --all` exit 0; tree berakhir pada `typescript@6.0.3`.
- Root cause: —
- Notes: Workspace symlink `node_modules/@valfuse-node/*` valid menunjuk ke `packages/*`.

### BD-005 — Run Format Check

- Status: SKIPPED
- Command: N/A
- Working directory: root
- Exit code: —
- Output summary: Tidak ada formatter (Prettier) di devDependencies, tidak ada `prettier.config.*`/`.prettierrc*`, tidak ada script `format*`.
- Evidence: `package.json` (root + semua package), hasil eksplorasi direktori.
- Root cause: —
- Notes: —

### BD-006 — Run Lint

- Status: FAIL (turbo) / PASS (per package)
- Command: `npm run lint` (turbo) ; `npx eslint src` per package (core, form, localization, react, vue)
- Working directory: root / `packages/*`
- Exit code: 1 (turbo) / 0 (semua package)
- Output summary:
  - Turbo: gagal pada task `@valfuse-node/localization#build` (dependency lint) dengan error `Could not resolve "../coverage/build-coverage-json"` dan `"../coverage/build-coverage-html"` di `src/cli/coverage.ts` dan `src/emitter/emit-report-files.ts`. `Tasks: 5 successful, 6 total`, `Cached: 3`.
  - Per package: eslint exit 0 untuk kelima package — tidak ada lint error.
- Evidence: output turbo (`ERROR @valfuse-node/localization#build`, `run failed: command exited (1)`); `npx eslint src` exit 0 per package.
- Root cause: SOURCE_CODE — file `packages/localization/src/coverage/{build-coverage-json,build-coverage-html}.ts` dirujuk dua file namun tidak ada; `git log --all -- packages/localization/src/coverage/` kosong (tidak pernah ada di history).
- Notes: Kegagalan turbo adalah cascade build, bukan lint error. Lint murni semua PASS.

### BD-007 — Run Typecheck

- Status: FAIL
- Command: `npx tsc --noEmit` (core, form, localization, react, vue); `npx tsc --noEmit` (react-example); `npx vue-tsc --noEmit` (vue-example)
- Working directory: `packages/*`
- Exit code: 2 (localization) / 1 (contoh) / 0 (form, vue)
- Output summary:
  - `form`: PASS (exit 0).
  - `vue`: PASS (exit 0).
  - `localization`: FAIL — 3× `TS2307: Cannot find module '../coverage/build-coverage-json'` / `'../coverage/build-coverage-html'` (src/cli/coverage.ts, src/emitter/emit-report-files.ts).
  - `core`: FAIL — `TS2307: Cannot find module '@valfuse-node/localization'` (src/index.ts), `'@valfuse-node/react'` (src/react-adapter.ts).
  - `react`: FAIL — 6× `TS2307` untuk `'@valfuse-node/localization'` dan `'@valfuse-node/localization/runtime'` (bridge/hooks/lazy/provider/ssr).
  - `react-example`: FAIL — TS2307 `'@valfuse-node/core'` (5 file) + TS7006/TS7031 `implicit any` (values, field, fieldState).
  - `vue-example`: FAIL — TS2307 `'@valfuse-node/core'` (4 file) + TS7006 `implicit any` (v, values).
- Evidence: output tsc/vue-tsc per package.
- Root cause: SOURCE_CODE — dua lapisan:
  1. `localization` gagal karena modul `src/coverage/*` tidak ada (error nyata).
  2. `core`, `react`, dan contoh gagal karena `dist/` package dependensi (localization, core, react) tidak terbangun akibat cascade build failure → `moduleResolution: bundler` meresolve `exports` ke `dist/*` yang hilang. TS7006/TS7031 pada contoh adalah cascade dari types yang tidak ter-resolve (bukan error nyata).
- Notes: `dist` ada untuk `form` dan `vue` (build sukses sebelumnya), hilang untuk `core`, `localization`, `react`.

### BD-008 — Run Unit Tests

- Status: PASS
- Command: `npx vitest run` (form, localization, react, vue) ; `npm run test --workspace=@valfuse-node/core`
- Working directory: `packages/*`
- Exit code: 0 (semua)
- Output summary:
  - `core`: PASS — "No test files found", exit 0 (script pakai `--passWithNoTests`).
  - `form`: 9 files, 360 test PASS.
  - `localization`: 21 files, 175 test PASS.
  - `react`: 4 files, 95 test PASS.
  - `vue`: 1 file, 25 test PASS.
  - Total 655 test, 0 failed.
- Evidence: output vitest per package.
- Root cause: —
- Notes: Vitest v4.1.6. Tidak ada flaky indication.

### BD-009 — Run Integration Tests

- Status: PASS
- Command: `npx vitest run` (packages/react, environment jsdom)
- Working directory: `packages/react`
- Exit code: 0
- Output summary: 4 files, 95 test PASS. Environment `jsdom`, setup `./src/__tests__/setup.ts`, `@testing-library/react` + `@testing-library/user-event`.
- Evidence: output vitest react.
- Root cause: —
- Notes: Bagian dari run BD-008; dicatat terpisah sebagai integration test React.

### BD-010 — Run Component Tests

- Status: PASS
- Command: `npx vitest run` (packages/vue, @vue/test-utils)
- Working directory: `packages/vue`
- Exit code: 0
- Output summary: 1 file, 25 test PASS.
- Evidence: output vitest vue.
- Root cause: —
- Notes: Bagian dari run BD-008; dicatat terpisah sebagai component test Vue.

### BD-011 — Run E2E Tests

- Status: SKIPPED
- Command: N/A
- Working directory: root
- Exit code: —
- Output summary: Tidak ada framework E2E (Playwright/Cypress) di devDependencies, tidak ada script E2E, tidak ada test di `packages/examples/*` (`find` → kosong).
- Evidence: `package.json` semua package, hasil `find packages/examples -name "*.test.*"` → kosong.
- Root cause: —
- Notes: —

### BD-012 — Run Build

- Status: FAIL
- Command: `npm run build` (turbo)
- Working directory: root
- Exit code: 1
- Output summary: `Tasks: 2 successful, 3 total`, `Cached: 2`, `Failed: @valfuse-node/localization#build`. Error: `Could not resolve "../coverage/build-coverage-json"` dan `"../coverage/build-coverage-html"` (3×, ESM build) + TS2307 pada DTS build di `src/cli/coverage.ts` dan `src/emitter/emit-report-files.ts`. `form` dan `vue` build sukses (cached); `core`, `react`, `localization` tidak menghasilkan `dist`.
- Evidence: output turbo build.
- Root cause: SOURCE_CODE — dua file mengimpor modul `../coverage/*` yang tidak ada di `packages/localization/src/`.
- Notes: Build blokir oleh satu error lokal di `localization`; berdampak cascade ke typecheck core/react dan contoh.

### BD-013 — Run Coverage

- Status: PASS (dengan catatan)
- Command: `npx vitest run --coverage` (form, localization, react, vue)
- Working directory: `packages/*`
- Exit code: 0 (semua)
- Output summary:
  - `form`: Statements 73.57%, Branches 83.58%, Functions 48.21%, Lines 72.99%.
  - `localization`: Statements 98.47%, Branches 94.73%, Functions 97.67%, Lines 98.35%.
  - `vue`: Statements 83.97%, Branches 67.85%, Functions 83.72%, Lines 84.93%.
  - `react`: exit 0, 95 test PASS, **namun** coverage provider gagal men-generate report: `Error [RolldownError]: Parse failed` pada `src/localization/bridge/create-localization-store.ts` dan file lain yang mengimpor `@valfuse-node/localization/runtime` (subpath `exports` menunjuk `dist/browser.js` yang tidak ada karena dist localization hilang). Error `PARSE_ERROR` → file dikecualikan dari coverage.
- Evidence: output vitest coverage per package.
- Root cause: SOURCE_CODE (cascade) — react coverage rusak karena `dist/` localization tidak ada; bukan error logika test.
- Notes: Coverage config `@vitest/coverage-v8` tanpa threshold (tidak ada `thresholds` di vitest.config). Core tidak punya file test sehingga coverage tidak dijalankan.

### BD-014 — Run Dependency Security Audit

- Status: FAIL
- Command: `npm audit`
- Working directory: root
- Exit code: 1
- Output summary: `5 vulnerabilities (1 low, 4 high)`.
  - `undici` (transitif, dev): 1 low + beberapa high — TLS cert validation bypass, HTTP header injection via Set-Cookie percent-decoding, WebSocket DoS via fragment count bypass, cross-origin request routing via SOCKS5 proxy pool reuse, HTTP response queue poisoning, SameSite downgrade, cross-user info disclosure via shared cache whitespace bypass. Fix: `npm audit fix` (in-range).
  - `vite` (dev dep, contoh): high — launch-editor NTLMv2 hash disclosure via UNC path on Windows, `server.fs.deny` bypass on Windows alternate paths. Fix: `npm audit fix --force` → `vite@8.2.0` di luar range yang dideklarasikan.
- Evidence: output `npm audit`.
- Root cause: DEPENDENCY — versi dependency dev/transitif yang ter-update kemudian oleh `"latest"` di devDependencies.
- Notes: Tidak menjalankan `npm audit fix` (dilarang mengubah lockfile/dependency). Kedua vulnerable package termasuk tooling dev/transitif, bukan runtime library.

### BD-015 — Check Unused Dependencies

- Status: PASS
- Command: inspeksi statis `dependencies`/`peerDependencies` vs import di `src`
- Working directory: root
- Exit code: 0
- Output summary: `chokidar` dipakai di `src/watch/create-watch-service.ts`; `yaml` dipakai di `src/config/load-config.ts`. `@valfuse-node/form`/`localization` dipakai di react/vue/core. Tidak ada dependency tak terpakai terdeteksi.
- Evidence: `grep` import di `packages/localization/src`.
- Root cause: —
- Notes: Inspeksi manual (depcheck tidak terpasang).

### BD-016 — Check Duplicate Code

- Status: PASS
- Command: `npm ls` + inspeksi contoh
- Working directory: root
- Exit code: 0
- Output summary: Tidak ada dependency duplikat (`deduped` dominan); tidak ada duplikasi kode signifikan terdeteksi di contoh (masing-masing playground terpisah untuk React/Vue).
- Evidence: output `npm ls --all`.
- Root cause: —
- Notes: Tool deteksi duplikasi (jscpd/cpd) tidak terpasang; inspeksi manual.

### BD-017 — Analyze Bundle

- Status: PASS (parsial)
- Command: inspeksi `dist/`
- Working directory: root
- Exit code: 0
- Output summary: Artifact tersedia untuk `form` (index.js 16.4K, index.mjs 14.2K, d.ts 22.3K) dan `vue` (index.js 8.3K, index.mjs 7.1K, d.ts 5.5K). `core`, `localization`, `react` tidak punya `dist` (build gagal).
- Evidence: `ls -la packages/{form,vue}/dist`.
- Root cause: SOURCE_CODE (dist tidak lengkap karena build blokir).
- Notes: Bundle analyzer tidak terpasang; analisis terbatas pada ukuran artifact.

### BD-018 — Inspect CI/CD Gates

- Status: NOT_AVAILABLE
- Command: inspeksi `.github/`, pipeline file
- Working directory: root
- Exit code: —
- Output summary: Tidak ada `.github/workflows`, `bitbucket-pipelines.yml`, `gitlab-ci.yml`, `sonar-project.properties`, `azure-pipelines.yml`, atau pipeline lain.
- Evidence: `ls .github` → "no .github dir"; glob pipeline → absent.
- Root cause: —
- Notes: Gap — tidak ada gate CI/CD untuk PR/main/release. Rekomendasi di final report.

## 4. Errors

| ID    | Task                 | Error                                                                                                          | File                                                                                                  | Root Cause                        | Blocking                |
| ----- | -------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------- |
| E-001 | BD-006/BD-007/BD-012 | `Could not resolve "../coverage/build-coverage-json"` / `"../coverage/build-coverage-html"` (esbuild) + TS2307 | `packages/localization/src/cli/coverage.ts`, `packages/localization/src/emitter/emit-report-files.ts` | SOURCE_CODE                       | Ya (build & lint turbo) |
| E-002 | BD-007               | TS2307 `Cannot find module '@valfuse-node/localization'`                                                       | `packages/core/src/index.ts`, `packages/core/src/react-adapter.ts`                                    | SOURCE_CODE (cascade dist hilang) | Ya (typecheck core)     |
| E-003 | BD-007               | TS2307 `'@valfuse-node/localization'` / `'@valfuse-node/localization/runtime'`                                 | 6 file `packages/react/src/localization/**`                                                           | SOURCE_CODE (cascade dist hilang) | Ya (typecheck react)    |
| E-004 | BD-007               | TS2307 `'@valfuse-node/core'` + TS7006/TS7031 implicit any                                                     | 9 file `packages/examples/{react-example,vue-example}/src/**`                                         | SOURCE_CODE (cascade dist hilang) | Ya (typecheck contoh)   |
| E-005 | BD-013               | `Error [RolldownError]: Parse failed` pada coverage provider                                                   | `packages/react/src/localization/bridge/create-localization-store.ts` dkk.                            | SOURCE_CODE (cascade dist hilang) | Tidak (exit 0)          |
| E-006 | BD-014               | `5 vulnerabilities (1 low, 4 high)`                                                                            | `undici` (dev/transitif), `vite` (dev, contoh)                                                        | DEPENDENCY                        | Tidak                   |

## 5. Warnings

| ID    | Task   | Warning                                                          | File                                      | Impact                                       |
| ----- | ------ | ---------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------- |
| W-001 | BD-017 | `core`, `localization`, `react` tidak punya artifact `dist`      | `packages/{core,localization,react}/dist` | Tidak bisa dilakukan bundle analysis penuh   |
| W-002 | BD-013 | Coverage react tidak men-generate report (file dikecualikan)     | `packages/react`                          | Tidak ada angka coverage untuk react         |
| W-003 | BD-003 | `package-lock.json` memiliki perubahan uncommitted (flag `peer`) | `package-lock.json`                       | Ketidakbersihan working tree, non-fungsional |
| W-004 | BD-015 | `"latest"` dipakai di seluruh devDependencies                    | `package.json` (root + semua package)     | Install non-reproducible antar mesin/waktu   |
| W-005 | BD-012 | Script `clean` memakai `rm -rf`                                  | semua `package.json`                      | Tidak kompatibel shell Windows native        |

## 6. Skipped or Blocked Tasks

| Task   | Status        | Reason                               | Required Dependency             |
| ------ | ------------- | ------------------------------------ | ------------------------------- |
| BD-005 | SKIPPED       | Formatter (Prettier) tidak terpasang | Prettier                        |
| BD-011 | SKIPPED       | Framework E2E tidak tersedia         | Playwright/Cypress              |
| BD-018 | NOT_AVAILABLE | Tidak ada CI/pipeline                | GitHub Actions/Bitbucket/GitLab |

## 7. Files Changed

Audit tidak mengubah source code, configuration, dependency, lockfile, pipeline, atau environment.

| File                                                            | Change                                                      | Reason                |
| --------------------------------------------------------------- | ----------------------------------------------------------- | --------------------- |
| `docs/codebase-audit/baseline-deterministic/01-plan.md`         | Diperbarui (hasil eksplorasi)                               | Output audit          |
| `docs/codebase-audit/baseline-deterministic/02-task.md`         | Dipertahankan                                               | Output audit          |
| `docs/codebase-audit/baseline-deterministic/03-execution.md`    | Diperbarui (hasil run)                                      | Output audit          |
| `docs/codebase-audit/baseline-deterministic/04-final-report.md` | Diperbarui (di phase 4)                                     | Output audit          |
| `package-lock.json`                                             | Tidak disentuh (perubahan `peer` flag sudah ada sebelumnya) | Di luar kendali audit |

Catatan: `npx vitest run --coverage` dan `npx tsc --noEmit` tidak menulis ke source. Turbo cache (`node_modules/.cache/turbo`) dapat berubah, bukan source.

## 8. Execution Limitations

- `npm audit` membutuhkan akses registry; hasil bergantung pada snapshot advisory terbaru (dijalankan online, 2026-08-03).
- Coverage react tidak dapat dihasilkan karena `dist/` localization hilang (cascade).
- Bundle analysis terbatas pada `form` dan `vue` karena artifact lain tidak ada.
- `npm ci` tidak dijalankan (dilarang tanpa kebutuhan); validasi `npm ls` sudah mengonfirmasi resolusi.
- Tidak ada credential, service eksternal, atau environment production yang dibutuhkan.
