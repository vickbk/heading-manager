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

### Phase 3: Executable CLI Entry Points (`scripts/bin/`)

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

### Phase 4: Test Environment & CI Isolation

- [x] **Vitest Environment Hardening (`vitest.setup.ts`)**
- **Status**: ✅ Done
- **Target**: 2026-08-14
- **Description**: Guarantee clean isolation between local and GitHub Actions CI runner test suites by stubbing ambient workflow environment variables.
- **Steps**:
  - [x] Configure `beforeEach` hooks in global setup to stub `GITHUB_REF_NAME`, `GITHUB_STEP_SUMMARY`, `GITHUB_ENV`, and `GITHUB_TOKEN` via `vi.stubEnv`.
  - [x] Audit ESM module mocks to ensure dynamic `node:fs` calls target `(await import("node:fs")).default` or rely on hoisted `vi.mock("node:fs")`.
  - [x] Execute `vitest run --isolation` to verify 0% cross-test state leakages.

---

### Phase 5: Workflow Wiring & Final Cleanup

- [x] **Package & Workflow Integration**
- **Status**: ✅ Done
- **Target**: 2026-08-14
- **Description**: Update system orchestration entry points in `package.json` and GitHub Action YAML files to complete the modular migration.
- **Steps**:
  - [x] Update `package.json` script definitions to target `scripts/bin/*.ts` paths.
  - [x] Update `.github/workflows/*.yml` steps to invoke the newly established binary scripts.
  - [x] Remove legacy top-level script files (`scripts/changelog.ts`, `scripts/extract-note.ts`, `scripts/comments-vitest.ts`).
  - [x] Run full test suite with `--coverage` to confirm complete branch coverage across all new modules.

## Refactor scripts into a modular system

### Folder architecture

```text
scripts/
├── bin/
│   ├── coverage-summary.ts          -> runTask("coverage-summary", generateCoverageSummary)
│   ├── extract-release-note.ts      -> runTask("extract-release-note", extractReleaseNotes)
│   ├── extract-version-tag.ts       -> runTask("extract-version-tag", writeDistTagToGithubOutput)
│   └── post-vitest-coverage.ts      -> runTask("post-vitest-coverage", postCoverageComment)
│
├── core/
│   ├── errors/
│   │   ├── index.ts                 -> re-exports runTask
│   │   └── utils/
│   │       ├── run-task.ts          -> CLI selector guard + fatal error delegation
│   │       ├── handle-fatal-error.ts-> console.error + process.exit
│   │       └── get-error-message.ts
│   │
│   └── github/
│       ├── index.ts                 -> feature-facing API surface
│       └── utils/
│           ├── git-env.ts
│           ├── github-write-env.ts
│           ├── write-step-summary.ts
│           ├── comment-action.ts
│           └── get-headers.ts
│
├── features/
│   ├── releases/
│   │   ├── index.ts                 -> barrel, but incomplete
│   │   └── utils/
│   │       ├── extract-note.ts
│   │       ├── version-tag.ts
│   │       ├── write-dist-tag.ts
│   │       └── ...
│   │
│   └── vitest/
│       ├── index.ts                 -> barrel exports
│       ├── README.md
│       └── utils/
│           ├── generate-coverage-summary.ts
│           ├── post-coverage-comment.ts
│           ├── report.ts
│           └── ...
│
├── config/
│   ├── index.ts                     -> config proxy
│   └── utils/
│       ├── env.ts
│       ├── get-config.ts
│       ├── config-schema.ts
│       ├── expand-env.ts
│       └── ...
│
└── shared/
   └── normalize-path.ts
```

### Phase 1: Core Infrastructure & CLI Entrypoint Fixes (`scripts/core/`, `scripts/bin/`)

- [x] **Async Entrypoint Await Fix (`scripts/bin/post-vitest-coverage.ts`)**
- **Status**: ✅ Done
- **Target**: 2026-08-15
- **Description**: Fix missing `await` operator on asynchronous `runTask` call to prevent premature process exit and guarantee async execution completion.
- **Steps**:
  - [x] Add `await` keyword to top-level `runTask("post-vitest-coverage", ...)` invocation.
  - [x] Update `scripts/bin/post-vitest-coverage.test.ts` to verify async promise resolution behavior.

- [x] **Environment Initialization & Config Side-Effect Cleanup (`scripts/config/utils/env.ts`)**
- **Status**: ✅ Done
- **Target**: 2026-08-15
- **Description**: Eliminate import-time side-effects (`expandEnv()`) to make environment loading explicit, pure, and predictable during module imports and testing.
- **Steps**:
  - [x] Wrap automatic environment expansion into an explicit initialization function (e.g., `expandEnv()`).
  - [x] Call `expandEnv()` explicitly inside CLI entrypoints or explicit config getters instead of top-level module scope.
  - [x] Add unit tests in `scripts/config/utils/env.test.ts` verifying isolated environment setup.

- [x] **Core Selector Guard Enhancement (`scripts/core/errors/utils/run-task.ts`)**
- **Status**: ✅ Done
- **Target**: 2026-08-15
- **Description**: Strengthen script matching logic in `runTask` to avoid false positives on partial path or file name matches.
- **Steps**:
  - [x] Refactor path matching in `runTask` to perform exact file stem or path boundary comparisons against `process.argv[1]`.
  - [x] Update `scripts/core/errors/utils/run-task.test.ts` with test cases covering edge-case script names and exact path matching.

---

### Phase 2: Public API Barrels & Domain Isolation (`scripts/features/`)

- [x] **Releases Feature Public Barrel (`scripts/features/releases/index.ts`)**
- **Status**: ✅ Done
- **Target**: 2026-08-15
- **Description**: Consolidate and re-export all public release management utilities to establish a strict feature boundary.
- **Steps**:
  - [x] Export `extractReleaseNotes` alongside `writeDistTagToGithubOutput` in `scripts/features/releases/index.ts`.
  - [x] Refactor `scripts/bin/extract-release-note.ts` to import directly from `@/scripts/features/releases` instead of deep internal paths.

- [x] **Vitest Feature Public Barrel (`scripts/features/vitest/index.ts`)**
- **Status**: ✅ Done
- **Target**: 2026-08-15
- **Description**: Consolidate and re-export all Vitest coverage and reporting utilities.
- **Steps**:
  - [x] Export `generateCoverageSummary` and `postCoverageComment` in `scripts/features/vitest/index.ts`.
  - [x] Refactor `scripts/bin/coverage-summary.ts` and `scripts/bin/post-vitest-coverage.ts` to import from the public barrel.

- [x] **Pure Domain Utility Refactoring (`scripts/features/releases/utils/extract-note.ts`)**
- **Status**: ✅ Done
- **Target**: 2026-08-16
- **Description**: Decouple domain utilities from direct CLI argument reading (`process.argv[2]`) to make them pure and easily testable.
- **Steps**:
  - [x] Refactor `extractReleaseNotes` to accept options/parameters with fallback resolution handled explicitly via configuration or entrypoint.
  - [x] Update `scripts/features/releases/utils/extract-note.test.ts` to test pure domain logic without mutating global `process.argv`.

---

### Phase 3: Path Alias & Import Standardization (`scripts/`)

- [x] **Import Path Alignment (`scripts/**/\*.ts`)\*\*
- **Status**: ✅ Done
- **Target**: 2026-08-15
- **Description**: Standardize internal script imports to consistently use `@/scripts/...` path aliases configured in `tsconfig.json`.
- **Steps**:
  - [x] Scan and update all relative imports in `scripts/bin/` to use `@/scripts/` alias pathing.
  - [x] Verify TypeScript resolution and build pipeline compatibility.

---

### Phase 4: Test Suite & Scaffolding Cleanup (`scripts/**/*.test.ts`)

- [ ] **Test Helper Isolation (`scripts/features/releases/utils/version-tag.test.ts`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-17
- **Description**: Remove test scaffolding leaks and clean up dead/empty test blocks.
- **Steps**:
  - [ ] Replace external test-helper imports from `init-helpers.test.ts` with local environment stubs and explicit mocks.
  - [ ] Remove empty or dead `describe("")` blocks in `version-tag.test.ts`.

- [ ] **Entrypoint Integration Test Alignment (`scripts/bin/*.test.ts`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-17
- **Description**: Align entrypoint tests across all `bin/` scripts to verify entrypoint selector matching, function invocation, and fatal error delegation.
- **Steps**:
  - [ ] Audit `scripts/bin/coverage-summary.test.ts`, `extract-release-note.test.ts`, `extract-version-tag.test.ts`, and `post-vitest-coverage.test.ts`.
  - [ ] Standardize mock reset patterns using `vi.resetModules()` and `process.argv` isolation.

---

### Phase 5: Documentation & Verification (`scripts/`, `README.md`)

- [ ] **Documentation & JSDoc Refresh (`scripts/README.md`, `scripts/**/\*.ts`)\*\*
- **Status**: ⏳ Todo
- **Target**: 2026-08-18
- **Description**: Bring `README.md` and inline code documentation up to date with the refactored directory layout and package scripts.
- **Steps**:
  - [ ] Update `scripts/README.md` paths (e.g., `scripts/bin/*`), environment variable tables (`GITHUB_REF_NAME`, `RELEASE_VERSION`, `GITHUB_TOKEN`), and execution commands.
  - [ ] Add JSDoc comments to exported functions across `scripts/core/github`, `scripts/features/releases`, and `scripts/features/vitest`.

- [ ] **Verification & Workspace Green-Check (`scripts/`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-18
- **Description**: Run full verification suite across the workspace to ensure all tests, typechecks, and linters pass cleanly.
- **Steps**:
  - [ ] Run `pnpm vitest run` and confirm 100% test pass rate.
  - [ ] Run `pnpm typecheck` to verify strict TypeScript compliance.
  - [ ] Run `pnpm lint` to ensure no unused imports or path violations remain.
