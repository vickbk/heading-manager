# Task list for command line scripts management

## Refactor scripts into a modular system

Target architecture:

```text
scripts/ (or tools/)
├── bin/                       # Executable CLI runners (invoked by GHA workflows)
│   ├── generate-coverage.ts
│   └── extract-release-notes.ts
├── features/                  # Domain logic bounded by feature concern
│   ├── coverage/
│   │   ├── index.ts           # Orchestration
│   │   ├── report.ts          # Parsers / transforms
│   │   └── coverage.test.ts
│   └── release-notes/
│       ├── index.ts
│       ├── parser.ts
│       └── parser.test.ts
├── core/                      # Infrastructure, wrappers, and runtime framework
│   ├── config.ts              # Unified workflow configuration loader
│   ├── github-api.ts          # GHA environment & step summary abstractions
│   ├── error.ts               # Fatal error handling & process exit utilities
│   └── logger.ts              # Output formatting & log levels
└── config/                    # Static default configurations or JSON schemas
    └── workflow-defaults.json
```

### Phase 1: Core Infrastructure Setup (`scripts/core/`)

- [ ] **Core Configuration Loader (`scripts/core/config.ts`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-13
- **Description**: Establish a centralized, type-safe configuration contract that standardizes environment variable lookups and workspace path resolutions across all workflow execution contexts.
- **Steps**:
  - [ ] Implement `loadWorkflowConfig()` with fallback support for `GITHUB_REF_NAME`, `RELEASE_VERSION`, `GITHUB_STEP_SUMMARY`, and `GITHUB_ENV`.
  - [ ] Export strict `WorkflowConfig` TypeScript interface and environment runtime defaults.
  - [ ] Create unit tests in `scripts/core/config.test.ts` verifying default path resolutions and environment overrides.

- [x] **Fatal Error Handling Utility (`scripts/core/error.ts`)**
- **Status**: ✅ Done
- **Target**: 2026-08-14
- **Description**: Provide a unified error-normalization helper that formats fatal log outputs and halts process execution with a explicit `: never` return signature.
- **Steps**:
  - [x] Implement `getErrorMessage(error: unknown): string` to safely extract messages from `Error` objects or unknown values.
  - [x] Implement `handleFatalError()` supporting string prefixes and template formatter functions.
  - [x] Add unit tests in `scripts/core/error.test.ts` verifying `process.exit(1)` spy handling, console output formatting, and type assertions.

- [x] **GitHub Actions API & Step Summary Layer (`scripts/core/github-api.ts`)**
- **Status**: ✅ Done
- **Target**: 2026-08-14
- **Description**: Decouple direct GitHub REST API operations and workflow environment writing from core domain modules into a dedicated infrastructure client.
- **Steps**:
  - [x] Move `exportGithubEnv`, `writeStepSummary`, and `commentAction` utilities into `scripts/core/github-api.ts`.
  - [x] Add graceful fallback handling when step summary files or GHA environment files are absent during local runs.
  - [x] Add mock unit tests covering local execution fallbacks versus live CI runner environments.

---

### Phase 2: Domain Feature Migration (`scripts/features/`)

- [x] **Release Notes Domain Isolation (`scripts/features/release-notes/`)**
- **Status**: ✅ Done
- **Target**: 2026-08-14
- **Description**: Re-architect release note parsing and version resolution into a self-contained feature module free of external entry point side effects.
- **Steps**:
  - [x] Move all releases files to `features/releases`.
  - [x] Create `index.ts` to export `extractReleaseNotes` accepting the unified `WorkflowConfig` object.
  - [x] Migrate and execute all corresponding unit tests under `scripts/features/release-notes/*.test.ts`.

- [x] **Coverage Domain Isolation (`scripts/features/vitest/`)**
- **Status**: ✅ Done
- **Target**: 2026-08-14
- **Description**: Group Vitest coverage parsing, summary formatting, and PR commenting logic under a unified feature namespace.
- **Steps**:
  - [x] Create `report.ts` containing JSON summary parsing and Markdown transformation utilities.
  - [x] Create `summary.ts` containing `generateCoverageSummary` workflow orchestration logic.
  - [x] Create `comment.ts` containing PR comment retrieval and update logic.
  - [x] Create `index.ts` to expose unified public feature contracts.

---

## Phase 3: Executable CLI Entry Points (`scripts/bin/`)

- [x] **Workflow Executable Entry Points (`scripts/bin/`)**
- **Status**: ✅ Done
- **Target**: 2026-08-14
- **Description**: Build lightweight, dedicated CLI entry points that bridge workflow invocation commands to feature orchestration functions.
- **Steps**:
  - [x] Create `scripts/bin/extract-release-notes.ts` wrapping feature execution in `runTask`.
  - [x] Create `scripts/bin/generate-coverage.ts` utilizing `loadWorkflowConfig()`.
  - [x] Create `scripts/bin/post-coverage-comment.ts` to handle PR comment updates securely.
  - [x] Ensure all bin scripts set standard executable permissions and clean exit codes.

---

## Phase 4: Test Environment & CI Isolation

- [x] **Vitest Environment Hardening (`vitest.setup.ts`)**
- **Status**: ✅ Done
- **Target**: 2026-08-14
- **Description**: Guarantee clean isolation between local and GitHub Actions CI runner test suites by stubbing ambient workflow environment variables.
- **Steps**:
  - [x] Configure `beforeEach` hooks in global setup to stub `GITHUB_REF_NAME`, `GITHUB_STEP_SUMMARY`, `GITHUB_ENV`, and `GITHUB_TOKEN` via `vi.stubEnv`.
  - [x] Audit ESM module mocks to ensure dynamic `node:fs` calls target `(await import("node:fs")).default` or rely on hoisted `vi.mock("node:fs")`.
  - [x] Execute `vitest run --isolation` to verify 0% cross-test state leakages.

---

## Phase 5: Workflow Wiring & Final Cleanup

- [ ] **Package & Workflow Integration**
- **Status**: ⏳ Todo
- **Target**: 2026-08-17
- **Description**: Update system orchestration entry points in `package.json` and GitHub Action YAML files to complete the modular migration.
- **Steps**:
  - [x] Update `package.json` script definitions to target `scripts/bin/*.ts` paths.
  - [x] Update `.github/workflows/*.yml` steps to invoke the newly established binary scripts.
  - [x] Remove legacy top-level script files (`scripts/changelog.ts`, `scripts/extract-note.ts`, `scripts/comments-vitest.ts`).
  - [x] Run full test suite with `--coverage` to confirm complete branch coverage across all new modules.
