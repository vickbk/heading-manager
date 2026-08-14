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

- [ ] **Fatal Error Handling Utility (`scripts/core/error.ts`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-13
- **Description**: Provide a unified error-normalization helper that formats fatal log outputs and halts process execution with a explicit `: never` return signature.
- **Steps**:
  - [ ] Implement `getErrorMessage(error: unknown): string` to safely extract messages from `Error` objects or unknown values.
  - [ ] Implement `handleFatalError()` supporting string prefixes and template formatter functions.
  - [ ] Add unit tests in `scripts/core/error.test.ts` verifying `process.exit(1)` spy handling, console output formatting, and type assertions.

- [ ] **GitHub Actions API & Step Summary Layer (`scripts/core/github-api.ts`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-13
- **Description**: Decouple direct GitHub REST API operations and workflow environment writing from core domain modules into a dedicated infrastructure client.
- **Steps**:
  - [ ] Move `exportGithubEnv`, `writeStepSummary`, and `commentAction` utilities into `scripts/core/github-api.ts`.
  - [ ] Add graceful fallback handling when step summary files or GHA environment files are absent during local runs.
  - [ ] Add mock unit tests covering local execution fallbacks versus live CI runner environments.

---

### Phase 2: Domain Feature Migration (`scripts/features/`)

- [ ] **Release Notes Domain Isolation (`scripts/features/release-notes/`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-14
- **Description**: Re-architect release note parsing and version resolution into a self-contained feature module free of external entry point side effects.
- **Steps**:
  - [ ] Create `parser.ts` containing `parseReleaseNotes` with full regex escaping (`version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")`).
  - [ ] Create `version.ts` containing normalized `resolveVersionTag` fallback resolution logic.
  - [ ] Create `index.ts` to export `extractReleaseNotes` accepting the unified `WorkflowConfig` object.
  - [ ] Migrate and execute all corresponding unit tests under `scripts/features/release-notes/*.test.ts`.

- [ ] **Coverage Domain Isolation (`scripts/features/coverage/`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-14
- **Description**: Group Vitest coverage parsing, summary formatting, and PR commenting logic under a unified feature namespace.
- **Steps**:
  - [ ] Create `report.ts` containing JSON summary parsing and Markdown transformation utilities.
  - [ ] Create `summary.ts` containing `generateCoverageSummary` workflow orchestration logic.
  - [ ] Create `comment.ts` containing PR comment retrieval and update logic.
  - [ ] Create `index.ts` to expose unified public feature contracts.

---

## Phase 3: Executable CLI Entry Points (`scripts/bin/`)

- [ ] **Workflow Executable Entry Points (`scripts/bin/`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-15
- **Description**: Build lightweight, dedicated CLI entry points that bridge workflow invocation commands to feature orchestration functions.
- **Steps**:
  - [ ] Create `scripts/bin/extract-release-notes.ts` wrapping feature execution in `try/catch` with `handleFatalError`.
  - [ ] Create `scripts/bin/generate-coverage.ts` utilizing `loadWorkflowConfig()`.
  - [ ] Create `scripts/bin/post-coverage-comment.ts` to handle PR comment updates securely.
  - [ ] Ensure all bin scripts set standard executable permissions and clean exit codes.

---

## Phase 4: Test Environment & CI Isolation

- [ ] **Vitest Environment Hardening (`vitest.setup.ts`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-16
- **Description**: Guarantee clean isolation between local and GitHub Actions CI runner test suites by stubbing ambient workflow environment variables.
- **Steps**:
  - [ ] Configure `beforeEach` hooks in global setup to stub `GITHUB_REF_NAME`, `GITHUB_STEP_SUMMARY`, `GITHUB_ENV`, and `GITHUB_TOKEN` via `vi.stubEnv`.
  - [ ] Audit ESM module mocks to ensure dynamic `node:fs` calls target `(await import("node:fs")).default` or rely on hoisted `vi.mock("node:fs")`.
  - [ ] Execute `vitest run --isolation` to verify 0% cross-test state leakages.

---

## Phase 5: Workflow Wiring & Final Cleanup

- [ ] **Package & Workflow Integration**
- **Status**: ⏳ Todo
- **Target**: 2026-08-17
- **Description**: Update system orchestration entry points in `package.json` and GitHub Action YAML files to complete the modular migration.
- **Steps**:
  - [ ] Update `package.json` script definitions to target `scripts/bin/*.ts` paths.
  - [ ] Update `.github/workflows/*.yml` steps to invoke the newly established binary scripts.
  - [ ] Remove legacy top-level script files (`scripts/changelog.ts`, `scripts/extract-note.ts`, `scripts/comments-vitest.ts`).
  - [ ] Run full test suite with `--coverage` to confirm complete branch coverage across all new modules.
