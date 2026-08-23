# Baseline Deterministic Plan

## 1. Objective

Membangun baseline kualitas codebase `valfuse-node` yang deterministik dan dapat dijalankan ulang secara konsisten di local development maupun CI/CD. Validasi dilakukan sepenuhnya read-only: tidak ada perubahan source code, configuration, dependency, lockfile, pipeline, atau environment. Seluruh kesimpulan didasarkan pada bukti hasil eksekusi command aktual.

## 2. Repository Profile

| Item                     | Result                                                                                                                        | Evidence                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Repository type          | Monorepo (npm workspaces + Turborepo)                                                                                         | `package.json`: `workspaces: ["packages/*", "packages/examples/*"]`, `turbo.json`; commit `057b395` |
| Application type         | Library (form validation + localization) untuk React dan Vue, plus 2 contoh aplikasi Vite privat                              | `packages/*/package.json`, `README.md`                                                              |
| Language                 | TypeScript (strict)                                                                                                           | `tsconfig.base.json`: `"strict": true`, `"noUnusedLocals"`, `"noUnusedParameters"`                  |
| Framework                | React 18 (adapter `@valfuse-node/react`), Vue 3 (adapter `@valfuse-node/vue`), framework-agnostic core (`@valfuse-node/form`) | `packages/react/package.json`, `packages/vue/package.json`                                          |
| Runtime                  | Node.js (terpasang v24.18.0); `@valfuse-node/localization` menetapkan `engines.node >= 20`                                    | `node --version`, `packages/localization/package.json`                                              |
| Package manager          | npm (lockfile `package-lock.json`, `lockfileVersion: 3`, `packageManager: npm@11.6.2`; terpasang npm 11.16.0)                 | `package-lock.json`, `package.json`, `npm --version`                                                |
| Workspace manager        | npm workspaces + Turborepo (`turbo.json`)                                                                                     | `package.json`, `turbo.json`                                                                        |
| Build tool               | tsup (per package) via Turborepo orchestrasi                                                                                  | `packages/*/tsup.config.ts`, `turbo.json`                                                           |
| Bundler                  | tsup (esbuild) untuk distribusi; Vite untuk contoh aplikasi                                                                   | `packages/*/package.json` `build` scripts, `packages/examples/*/package.json`                       |
| Lint tool                | ESLint 9 flat config (`eslint.config.mjs`) + `typescript-eslint`                                                              | `eslint.config.mjs`, `package.json` devDependencies                                                 |
| Formatter                | Tidak tersedia (tidak ada Prettier/`prettier.config.*`/`.prettierrc*`)                                                        | hasil eksplorasi direktori                                                                          |
| Type checker             | TypeScript `tsc --noEmit`; `vue-tsc` untuk contoh Vue                                                                         | `packages/*/package.json` `typecheck` scripts                                                       |
| Test framework           | Vitest (`vitest run`), environment node dan jsdom                                                                             | `packages/*/vitest.config.ts`                                                                       |
| Coverage tool            | `@vitest/coverage-v8` (terkonfigurasi di vitest.config.ts, tanpa threshold)                                                   | `packages/*/vitest.config.ts`                                                                       |
| State management         | N/A (library, bukan aplikasi)                                                                                                 | —                                                                                                   |
| Styling solution         | N/A                                                                                                                           | —                                                                                                   |
| CI/CD                    | Tidak tersedia (tidak ada `.github/workflows`, Bitbucket/GitLab pipeline)                                                     | hasil eksplorasi direktori                                                                          |
| Container configuration  | Tidak tersedia (tidak ada `Dockerfile*`, `docker-compose*`)                                                                   | hasil eksplorasi direktori                                                                          |
| Deployment configuration | N/A untuk library; publikasi via `npm publish` manual                                                                         | `package.json` `publish:*` scripts                                                                  |

## 3. Scope

### Included

- environment validation (runtime + package manager)
- dependency validation (instalasi konsisten dengan lockfile)
- lint validation
- type checking
- unit testing (semua package + contoh)
- integration/component testing (test React memakai `jsdom`, `@testing-library/react`; Vue memakai `@vue/test-utils`)
- build validation
- coverage validation (laporan v8; threshold tidak dikonfigurasi)
- dependency security audit (`npm audit`)
- unused dependency check (inspeksi statis)
- duplicate code detection (inspeksi statis)
- bundle analysis (inspeksi statis terhadap output `dist`)
- CI/CD gate inspection (karena CI tidak tersedia, dicatat sebagai gap)

### Excluded

- E2E testing: tidak ada framework E2E (Playwright/Cypress) dan tidak ada script terkait.
- Formatter validation: tidak ada formatter terpasang (Prettier tidak tersedia).
- Docker/container validation: tidak ada konfigurasi container.
- Deployment validation: library tanpa konfigurasi deployment.
- Web/unit coverage threshold enforcement: coverage v8 dikonfigurasi tanpa `thresholds`.

## 4. Repository Areas to Inspect

| Area                  | Files or Directories                                                                           | Purpose                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Application bootstrap | `package.json`, `turbo.json`, `tsconfig.base.json`, `eslint.config.mjs`, `package-lock.json`   | Struktur workspace, script orkestrasi, konfigurasi lint/typecheck |
| Source modules        | `packages/{core,form,localization,react,vue}/src`                                              | Kode library utama                                                |
| Shared modules        | `packages/form` (domain bersama), `packages/localization`                                      | Modul framework-agnostik yang dipakai bersama                     |
| Tests                 | `packages/*/src/__tests__`                                                                     | Unit/integrasi/component test per package                         |
| Build configuration   | `packages/*/tsup.config.ts`, `packages/*/vitest.config.ts`, `packages/examples/*/package.json` | Build, bundling, environment test                                 |
| CI/CD                 | Tidak ada (gap)                                                                                | —                                                                 |

## 5. Available Quality Tools

| Tool                |              Dependency Found |                  Configuration Found |                                 Script Found | Planned Usage          |
| ------------------- | ----------------------------: | -----------------------------------: | -------------------------------------------: | ---------------------- |
| ESLint              |             Ya (root devDeps) |             Ya (`eslint.config.mjs`) |           Ya (`npm run lint` → `turbo lint`) | BD-006                 |
| TypeScript          |             Ya (root devDeps) |            Ya (`tsconfig.base.json`) | Ya (`npm run typecheck` → `turbo typecheck`) | BD-007                 |
| Vitest              |              Ya (per package) |  Ya (`vitest.config.ts` per package) |           Ya (`npm run test` → `turbo test`) | BD-008, BD-009, BD-010 |
| @vitest/coverage-v8 | Ya (devDeps beberapa package) | Ya (coverage block, tanpa threshold) |                      Tidak ada script khusus | BD-013                 |
| tsup                |       Ya (root + per package) |                Ya (`tsup.config.ts`) |         Ya (`npm run build` → `turbo build`) | BD-012                 |
| npm audit           |               Ya (npm bawaan) |                            Tidak ada |                                    Tidak ada | BD-014                 |
| Prettier            |                         Tidak |                                Tidak |                                        Tidak | SKIPPED                |
| Playwright/Cypress  |                         Tidak |                                Tidak |                                        Tidak | SKIPPED                |
| Docker              |                         Tidak |                                Tidak |                                        Tidak | SKIPPED                |

## 6. Planned Validation Sequence

1. Environment validation (runtime, package manager, git state)
2. Dependency validation (lockfile consistency)
3. Format check — SKIPPED (Prettier tidak tersedia)
4. Lint
5. Typecheck
6. Unit test
7. Integration/component test (bagian dari vitest run)
8. E2E test — SKIPPED (tooling tidak tersedia)
9. Build
10. Coverage
11. Security audit (`npm audit`)
12. Dependency analysis (unused dependencies — inspeksi statis)
13. Duplicate code detection (inspeksi statis)
14. Bundle analysis (inspeksi statis output dist)
15. CI/CD gate inspection (gap analysis)

## 7. Risks

| Risk                                                                                  | Impact                                              | Mitigation                                                        |
| ------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| `latest` di seluruh devDependencies menghasilkan non-reproducible install antar mesin | Hasil lint/build/test berbeda antar environment     | Catat versi terpasang aktual; rekomendasi pinning di final report |
| Dependency `@valfuse-node/*` memakai `"*"` di workspaces                              | Resolusi internal mengikuti workspace, aman         | Verifikasi dengan `npm ls`                                        |
| Script `clean` memakai `rm -rf` (tidak jalan di Windows native)                       | Potensi kegagalan tooling di environment CI Windows | Tidak dijalankan; dicatat sebagai limitation                      |
| `npm audit` membutuhkan jaringan dan registry                                         | Hasil bisa tidak tersedia saat offline              | Catat status, jangan dianggap pass tanpa bukti                    |
| Turbo cache memakai `outputLogs: new-only` untuk test                                 | Output test tidak muncul jika cache tersedia        | Gunakan `--force` pada run validasi untuk hasil deterministik     |

## 8. Assumptions

- Dependency sudah terpasang di `node_modules`; instalasi hanya dijalankan jika diperlukan dan harus menjaga lockfile (`npm ci`).
- Git working tree saat ini berisi perubahan yang tidak terkait audit (`package-lock.json` modified, `audit-codebase.md` untracked); audit tidak akan menyentuhnya.
- Semua command dijalankan dari root repository.
- `npm run <script>` men-delegate ke Turborepo sesuai konfigurasi workspace.

## 9. Stop Conditions

Hentikan atau tunda command tertentu jika:

- berpotensi mengubah lockfile (`npm install` non-ci, `npm audit fix`) — tidak akan dijalankan
- membutuhkan credential (publikasi npm, registry privat) — tidak relevan
- membutuhkan service eksternal yang tidak tersedia (audit offline) — dicatat sebagai BLOCKED
- berpotensi menghapus data (`clean` script memakai `rm -rf`) — tidak akan dijalankan
- membutuhkan environment production — tidak relevan
- membutuhkan akses yang tidak diberikan (instalasi) — dihindari kecuali mutlak perlu dengan `npm ci`
