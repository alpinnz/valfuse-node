# Baseline Deterministic Codebase Validation

Anda bertindak sebagai Senior Software Engineer dan Code Quality Engineer.

Lakukan validasi deterministik terhadap repository ini menggunakan tooling yang tersedia di project. Tujuannya adalah menghasilkan baseline kualitas codebase yang dapat dijalankan ulang secara konsisten pada local development maupun CI/CD.

Seluruh proses wajib dibagi menjadi empat tahap:

1. Plan
2. Task
3. Execution
4. Final Report

Semua output wajib ditulis dalam file Markdown.

---

# General Rules

- Mulai dalam mode read-only.
- Jangan mengubah source code sebelum diminta.
- Jangan mengubah configuration, dependency, lockfile, pipeline, atau environment.
- Jangan menjalankan command destruktif.
- Jangan menggunakan `--force`, `--legacy-peer-deps`, atau bypass validasi.
- Gunakan package manager berdasarkan lockfile.
- Jangan mengganti package manager.
- Jangan memperbarui dependency.
- Jangan menyatakan suatu pemeriksaan berhasil jika command belum dijalankan.
- Bedakan error source code, test, configuration, dependency, environment, tooling, dan CI.
- Semua kesimpulan wajib memiliki bukti.
- Gunakan bahasa Indonesia pada laporan.
- Istilah teknis, nama file, command, dan kode tetap menggunakan bahasa aslinya.

---

# Required Output Files

Buat directory audit berikut jika belum tersedia:

```text
docs/codebase-audit/baseline-deterministic/
```

Buat file:

```text
docs/codebase-audit/baseline-deterministic/
├── 01-plan.md
├── 02-task.md
├── 03-execution.md
└── 04-final-report.md
```

Jika kebijakan repository tidak mengizinkan pembuatan file, tampilkan seluruh isi file tersebut pada output terminal dengan heading yang jelas.

Jangan membuat file lain di luar directory tersebut.

---

# Phase 1 — Plan

Lakukan eksplorasi awal terhadap repository secara read-only.

Pelajari:

- jenis repository
- tujuan aplikasi
- bahasa pemrograman
- framework utama
- runtime
- package manager
- workspace manager
- build tool
- bundler
- lint tool
- formatter
- type checker
- test framework
- coverage tool
- state management
- styling solution
- CI/CD
- container configuration
- deployment configuration

Periksa file yang relevan, antara lain:

```text
README*
package.json
pnpm-lock.yaml
yarn.lock
package-lock.json
bun.lock
bun.lockb
tsconfig*.json
eslint.config.*
.eslintrc*
.prettierrc*
prettier.config.*
vite.config.*
webpack.config.*
next.config.*
nuxt.config.*
angular.json
turbo.json
nx.json
vitest.config.*
jest.config.*
playwright.config.*
cypress.config.*
sonar-project.properties
bitbucket-pipelines.yml
.github/workflows/*
Dockerfile*
docker-compose*
.nvmrc
.node-version
.tool-versions
.env.example
```

Buat file:

```text
docs/codebase-audit/baseline-deterministic/01-plan.md
```

Gunakan format:

```markdown
# Baseline Deterministic Plan

## 1. Objective

Jelaskan tujuan validasi deterministik repository.

## 2. Repository Profile

| Item             | Result | Evidence |
| ---------------- | ------ | -------- |
| Repository type  |        |          |
| Application type |        |          |
| Language         |        |          |
| Framework        |        |          |
| Runtime          |        |          |
| Package manager  |        |          |
| Build tool       |        |          |
| Test framework   |        |          |
| CI/CD            |        |          |

## 3. Scope

### Included

- formatter validation
- lint validation
- type checking
- unit testing
- integration testing
- component testing
- E2E testing
- build validation
- coverage validation
- dependency audit
- dependency consistency
- duplicate code detection
- bundle analysis

### Excluded

Tuliskan pemeriksaan yang tidak relevan atau tidak tersedia.

## 4. Repository Areas to Inspect

| Area                  | Files or Directories | Purpose |
| --------------------- | -------------------- | ------- |
| Application bootstrap |                      |         |
| Source modules        |                      |         |
| Shared modules        |                      |         |
| Tests                 |                      |         |
| Build configuration   |                      |         |
| CI/CD                 |                      |         |

## 5. Available Quality Tools

| Tool | Dependency Found | Configuration Found | Script Found | Planned Usage |
| ---- | ---------------: | ------------------: | -----------: | ------------- |

## 6. Planned Validation Sequence

1. Environment validation
2. Dependency validation
3. Format check
4. Lint
5. Typecheck
6. Unit test
7. Integration or component test
8. E2E test
9. Build
10. Coverage
11. Security audit
12. Dependency analysis
13. Bundle analysis

## 7. Risks

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |

## 8. Assumptions

Tuliskan asumsi yang digunakan.

## 9. Stop Conditions

Hentikan atau tunda command tertentu jika:

- berpotensi mengubah lockfile
- membutuhkan credential
- membutuhkan service eksternal yang tidak tersedia
- berpotensi menghapus data
- membutuhkan environment production
- membutuhkan akses yang tidak diberikan
```

Setelah `01-plan.md` selesai, lanjutkan ke Phase 2.

---

# Phase 2 — Task Breakdown

Berdasarkan hasil eksplorasi dan plan, pecah validasi menjadi task yang spesifik dan dapat diverifikasi.

Buat file:

```text
docs/codebase-audit/baseline-deterministic/02-task.md
```

Gunakan format:

```markdown
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

| ID     | Task                          | Command or Inspection | Expected Result | Risk   | Status |
| ------ | ----------------------------- | --------------------- | --------------- | ------ | ------ |
| BD-001 | Validate runtime              |                       |                 | Low    | TODO   |
| BD-002 | Validate package manager      |                       |                 | Low    | TODO   |
| BD-003 | Validate lockfile             |                       |                 | Low    | TODO   |
| BD-004 | Validate dependencies         |                       |                 | Medium | TODO   |
| BD-005 | Run format check              |                       |                 | Low    | TODO   |
| BD-006 | Run lint                      |                       |                 | Low    | TODO   |
| BD-007 | Run typecheck                 |                       |                 | Low    | TODO   |
| BD-008 | Run unit tests                |                       |                 | Low    | TODO   |
| BD-009 | Run integration tests         |                       |                 | Medium | TODO   |
| BD-010 | Run component tests           |                       |                 | Medium | TODO   |
| BD-011 | Run E2E tests                 |                       |                 | Medium | TODO   |
| BD-012 | Run build                     |                       |                 | Low    | TODO   |
| BD-013 | Run coverage                  |                       |                 | Low    | TODO   |
| BD-014 | Run dependency security audit |                       |                 | Low    | TODO   |
| BD-015 | Check unused dependencies     |                       |                 | Low    | TODO   |
| BD-016 | Check duplicate code          |                       |                 | Low    | TODO   |
| BD-017 | Analyze bundle                |                       |                 | Low    | TODO   |
| BD-018 | Inspect CI/CD gates           |                       |                 | Low    | TODO   |

Tambahkan atau hapus task berdasarkan kondisi nyata repository.

## 3. Task Dependencies

| Task | Depends On | Reason |
| ---- | ---------- | ------ |

## 4. Execution Order

Tuliskan urutan task final.

## 5. Blocking Conditions

| Task | Possible Blocker | Required Action |
| ---- | ---------------- | --------------- |

## 6. Validation Criteria

### Environment

- runtime sesuai konfigurasi
- package manager sesuai lockfile
- dependency dapat di-resolve tanpa perubahan lockfile

### Format

- exit code `0`
- tidak ada file yang perlu diformat

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
- artifact berhasil dibuat
- warning dicatat

### Coverage

- threshold terpenuhi jika threshold tersedia

### Security Audit

- vulnerability dicatat berdasarkan severity
```

Jangan menjalankan seluruh validasi sebelum task breakdown selesai.

---

# Phase 3 — Execution

Jalankan task satu per satu berdasarkan `02-task.md`.

Gunakan script project terlebih dahulu.

Contoh:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm audit
```

Sesuaikan dengan package manager dan script repository.

Jika dependency belum terpasang, gunakan instalasi yang menjaga lockfile:

```bash
npm ci
pnpm install --frozen-lockfile
yarn install --frozen-lockfile
```

Jangan menjalankan instalasi jika tidak diperlukan.

Untuk setiap command, catat:

- task ID
- command
- working directory
- start condition
- exit code
- status
- ringkasan output
- jumlah error
- jumlah warning
- file terdampak
- root cause
- evidence
- follow-up

Gunakan root cause berikut:

```text
SOURCE_CODE
TEST_CODE
CONFIGURATION
DEPENDENCY
ENVIRONMENT
TOOLING
CI_ONLY
UNKNOWN
```

Buat file:

```text
docs/codebase-audit/baseline-deterministic/03-execution.md
```

Gunakan format:

```markdown
# Baseline Deterministic Execution Log

## 1. Execution Environment

| Item              | Value |
| ----------------- | ----- |
| Operating system  |       |
| Runtime version   |       |
| Package manager   |       |
| Working directory |       |
| Branch            |       |
| Commit            |       |

## 2. Execution Summary

| Task ID | Task | Command | Exit Code | Result | Root Cause |
| ------- | ---- | ------- | --------: | ------ | ---------- |

## 3. Detailed Execution

### BD-001 — Validate Runtime

- Status:
- Command:
- Working directory:
- Exit code:
- Output summary:
- Evidence:
- Root cause:
- Notes:

### BD-002 — Validate Package Manager

Gunakan struktur yang sama untuk seluruh task.

## 4. Errors

| ID  | Task | Error | File | Root Cause | Blocking |
| --- | ---- | ----- | ---- | ---------- | -------: |

## 5. Warnings

| ID  | Task | Warning | File | Impact |
| --- | ---- | ------- | ---- | ------ |

## 6. Skipped or Blocked Tasks

| Task | Status | Reason | Required Dependency |
| ---- | ------ | ------ | ------------------- |

## 7. Files Changed

Audit tidak boleh mengubah source code.

Tuliskan hasil pemeriksaan:

| File | Change | Reason |
| ---- | ------ | ------ |

Jika ada file yang berubah akibat command, jelaskan dan jangan sembunyikan perubahan tersebut.

## 8. Execution Limitations

Tuliskan batasan environment, credential, service, atau tooling.
```

Setelah seluruh task yang aman selesai dijalankan, lanjutkan ke Phase 4.

---

# Phase 4 — Final Report

Buat file:

```text
docs/codebase-audit/baseline-deterministic/04-final-report.md
```

Gunakan format:

````markdown
# Deterministic Baseline Report

## 1. Executive Summary

- Overall status:
- Repository build status:
- Quality gate readiness:
- Blocking issues:
- Non-blocking issues:
- Main risks:
- Recommended immediate action:

## 2. Repository Profile

| Item             | Result |
| ---------------- | ------ |
| Application type |        |
| Stack            |        |
| Runtime          |        |
| Package manager  |        |
| Build tool       |        |
| Test framework   |        |
| CI/CD            |        |

## 3. Quality Gate Results

| Gate | Command | Result | Errors | Warnings | Root Cause |
| ---- | ------- | -----: | -----: | -------: | ---------- |

## 4. Blocking Issues

Untuk setiap finding gunakan format:

### BD-FINDING-001 — Judul

- Severity:
- Category:
- Related task:
- Command:
- Affected file:
- Evidence:
- Root cause:
- Impact:
- Recommended fix:
- Verification:
- Estimated effort:

## 5. Non-Blocking Issues

Gunakan struktur finding yang sama.

## 6. Configuration Gaps

| ID  | Gap | Evidence | Impact | Recommendation | Priority |
| --- | --- | -------- | ------ | -------------- | -------- |

## 7. Missing Quality Gates

| Gate | Current State | Impact | Recommended Tool | Effort |
| ---- | ------------- | ------ | ---------------- | ------ |

## 8. Recommended Baseline

### Local Development

```bash
# recommended commands
```
````

### Pull Request

```bash
# recommended commands
```

### Main Branch

```bash
# recommended commands
```

### Release

```bash
# recommended commands
```

## 9. Recommended Package Scripts

Berikan proposal tanpa mengubah `package.json`.

```json
{
  "scripts": {
    "format": "...",
    "format:check": "...",
    "lint": "...",
    "lint:fix": "...",
    "typecheck": "...",
    "test": "...",
    "test:coverage": "...",
    "test:ci": "...",
    "build": "...",
    "validate": "..."
  }
}
```

## 10. CI/CD Recommendations

### Required

- ...

### Recommended

- ...

### Optional

- ...

## 11. Merge Blocking Rules

| Gate | Pull Request | Main | Release |
| ---- | -----------: | ---: | ------: |

## 12. Prioritized Action Plan

| Priority | Action | Impact | Effort | Suggested Owner |
| -------- | ------ | ------ | ------ | --------------- |
| P0       |        |        |        |                 |
| P1       |        |        |        |                 |
| P2       |        |        |        |                 |
| P3       |        |        |        |                 |

Priority definitions:

- P0: build, pipeline, atau application blocking
- P1: risiko tinggi terhadap kualitas
- P2: quality improvement
- P3: optimization

## 13. Commands Executed

| Command | Exit Code | Result |
| ------- | --------: | ------ |

## 14. Positive Findings

Tuliskan quality practice yang sudah baik dan perlu dipertahankan.

## 15. Limitations

Tuliskan pemeriksaan yang tidak dapat dilakukan dan alasannya.

## 16. Conclusion

Berikan keputusan akhir:

- `READY`
- `READY_WITH_IMPROVEMENTS`
- `NOT_READY`

Sertakan alasan berdasarkan hasil deterministik.

```

---

# Completion Rules

Sebelum menyelesaikan pekerjaan:

1. Pastikan `01-plan.md` berisi rencana berdasarkan kondisi nyata repository.
2. Pastikan `02-task.md` berisi task yang benar-benar relevan.
3. Pastikan `03-execution.md` mencatat seluruh command dan hasil.
4. Pastikan `04-final-report.md` konsisten dengan execution log.
5. Jangan mencantumkan command sebagai berhasil jika tidak dijalankan.
6. Jangan menyembunyikan error atau warning.
7. Jangan memperbaiki issue secara otomatis.
8. Jangan membuat commit atau branch.
9. Tampilkan ringkasan file Markdown yang berhasil dibuat.
10. Setelah laporan selesai, berhenti.
```
