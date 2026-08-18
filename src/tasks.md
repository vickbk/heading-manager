# Package Restructuring & Core/Adapter Engine Migration

## Architectural Refactor: Clean Layered Dependency Flow

Target architecture:

```text
react-heading-manager/
├── tests/                           # Root test infrastructure (excluded from build)
│   └── setup/
│       └── vitest.setup.ts
├── src/
│   ├── main/                        # Lightweight Export Routers (Package Entrypoints)
│   │   ├── index.ts                 # Re-exports React Adapter ("react-heading-manager")
│   │   ├── utils.ts                 # Re-exports Core Engine ("react-heading-manager/utils")
│   │   └── testing/
│   │       └── playwright.ts        # Re-exports Playwright Adapter ("react-heading-manager/testing/playwright")
│   │
│   ├── core/                        # Pure, framework-agnostic WCAG Audit Engine
│   │   └── heading-auditor/         # Core DOM tree parser & WCAG validation algorithms
│   │       ├── check-heading-order-report.ts
│   │       ├── check-heading-order-report.test.ts
│   │       ├── draw-region.ts
│   │       ├── draw-region.test.tsx
│   │       ├── heading-level.ts
│   │       ├── heading-level.test.ts
│   │       ├── parse-heading-level.ts
│   │       ├── parse-heading-level.test.ts
│   │       ├── resolve-heading-details.ts
│   │       ├── resolve-heading-details.test.ts
│   │       ├── index.ts             # Core engine barrel
│   │       └── README.md
│   │
│   ├── adapters/                    # Consumer bindings & platform integrations
│   │   ├── react/                   # React UI bindings (components, context & hooks)
│   │   │   ├── components/
│   │   │   │   ├── create-region.tsx
│   │   │   │   ├── create-region.test.tsx
│   │   │   │   ├── heading.tsx
│   │   │   │   ├── heading.test.tsx
│   │   │   │   ├── heading-fragment.tsx
│   │   │   │   ├── heading-fragment.test.tsx
│   │   │   │   ├── landmarks.ts
│   │   │   │   ├── landmarks.test.ts
│   │   │   │   ├── main.tsx
│   │   │   │   └── main.test.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-heading.ts
│   │   │   │   └── use-heading.test.tsx
│   │   │   ├── __tests__/           # Adapter-level integration tests
│   │   │   │   └── heading-system.integration.test.tsx
│   │   │   └── index.ts             # React adapter barrel
│   │   │
│   │   └── playwright/              # Playwright test framework assertion adapter
│   │       ├── utils/
│   │       │   ├── register.ts
│   │       │   ├── register.test.ts
│   │       │   ├── to-have-valid-heading-hierarchy.ts
│   │       │   └── to-have-valid-heading-hierarchy.test.ts
│   │       ├── types.d.ts
│   │       ├── index.ts             # Playwright adapter barrel
│   │       └── README.md
│   │
│   └── shared/                      # Domain-agnostic primitives & types
│       ├── types.ts
│       └── dom/
│           ├── get-region-identifier.ts
│           └── get-region-identifier.test.ts

```

---

### Phase 1: Shared Primitives & Root Test Setup

- [x] **Extract Shared Primitives & Root Test Infrastructure**
- **Status**: ✅ Done
- **Target**: 2026-08-16
- **Description**: Establish base types and DOM utilities in `src/shared/` with zero internal dependencies, and move test runner configs outside `src/`.
- **Steps**:
- [x] Create `src/shared/dom/types.ts` with global heading level and region interfaces.
- [x] Relocate `get-region-identifier.ts`, `calculate-heading-level` and related tests into `src/shared/dom/`.
- [x] Move Vitest setup file to `tests/setup/vitest.setup.ts` and update `vitest.config.ts`.

---

### Phase 2: Core WCAG Engine Migration (`src/core/`)

- [x] **Consolidate Pure Engine Logic into `src/core/heading-auditor/**`
- **Status**: ✅ Done
- **Target**: 2026-08-16
- **Description**: Relocate pure WCAG calculation rules, DOM parsers, and region drawer utilities into `src/core/heading-auditor/`. Ensure `core` only imports from `src/shared`.
- **Steps**:
- [x] Move `check-heading-order-report.ts` and tests to `src/core/auditor/`.
- [x] Move `draw-region.ts` and tests to `src/core/auditor/`.
- [x] Move `parse-level.ts` and `resolve-details.ts` with tests to `src/core/auditor/`.
- [x] Create barrel file `src/core/auditor/index.ts` re-exporting all core utilities.
- [ ] Create `src/core/auditor/README.md` documenting internal core APIs.

---

### Phase 3: Adapters Migration (`src/adapters/`)

- [x] **Migrate React UI Adapter (`src/adapters/react/`)**
- **Status**: ✅ Done
- **Target**: 2026-08-16
- **Description**: Isolate React components and context hooks under `src/adapters/react/`. Verify imports consume from `src/core/` and `src/shared/`.
- **Steps**:
- [x] Move React UI components (`create-region.tsx`, `heading.tsx`, `heading-fragment.tsx`, `landmarks.ts`, `main.tsx`) and tests to `src/adapters/react/components/`.
- [x] Move `use-heading.ts` and test to `src/adapters/react/hooks/`.
- [x] Move integration tests to `src/adapters/react/__tests__/heading-system.integration.test.tsx`.
- [x] Create `src/adapters/react/index.ts` barrel file.

- [x] **Migrate Playwright Matcher Adapter (`src/adapters/playwright/`)**
- **Status**: ✅ Done
- **Target**: 2026-08-16
- **Description**: Relocate Playwright custom matchers and initializers to `src/adapters/playwright/`.
- **Steps**:
- [x] Move `register.ts`, `to-have-valid-heading-hierarchy.ts`, and tests to `src/adapters/playwright/utils/`.
- [x] Move ambient declaration file to `src/adapters/playwright/types.d.ts`.
- [x] Create `src/adapters/playwright/index.ts` barrel file.
- [x] Create `src/adapters/playwright/README.md` with Playwright usage instructions.

---

### Phase 4: Main Entrypoint Router (`src/main/`) & Bundler Alignment

- [x] **Create Lightweight Re-export Shims in `src/main/**`
- **Status**: ✅ Done
- **Target**: 2026-08-21
- **Description**: Implement thin entrypoint router files inside `src/main/` that expose public API subpaths without containing business logic.
- **Steps**:
- [x] Create `src/main/index.ts` re-exporting from `../adapters/react`.
- [x] Create `src/main/utils.ts` re-exporting from `../core/heading-auditor` and `../shared/types`.
- [x] Create `src/main/testing/playwright.ts` re-exporting from `../../adapters/playwright`.
- [x] Update `tsdown.config.ts` entrypoints to target `src/main/*`:
      `ts entry: { index: "src/main/index.ts", "utils/index": "src/main/utils.ts", "testing/playwright/index": "src/main/testing/playwright.ts", } `
- [x] Update `package.json` `exports` mapping.

---

### Phase 5: Path Auditing & Quality Verification

- [x] **Update Import Paths & Run Quality Audit**
- **Status**: ✅ Done
- **Target**: 2026-08-17
- **Description**: Update all relative import paths across the codebase to adhere to the strict dependency flow rules and run verification scripts.
- **Steps**:
- [x] Fix relative import paths in all moved files.
- [x] Run `pnpm typecheck` to verify zero type leaks or invalid imports.
- [x] Run `pnpm test` (Vitest) to ensure 100% test pass rate.
- [x] Run `pnpm build` to confirm `dist/` outputs (`dist/index.js`, `dist/utils/index.js`, `dist/testing/playwright/index.js`) generate cleanly.
- [x] Run `pnpm pack --dry-run` to verify published tarball structure.

## Bottom-Up Documentation Remediation & Alignment Plan

A bottom-up approach ensures that code-level TSDoc becomes the single source of truth, cascading directly into sub-directory architectural READMEs, and ultimately synthesizing into an accurate root `README.md` and `CHANGELOG.md`.

---

### Phase 1: Inline TSDoc & JSDoc Standardization (Module Level)

- [x] **Task 1: Audit & Standardize TSDoc for Shared Primitives**
- **Status**: ✅ To Do
- **Target**: 2026-08-17
- **Description**: Clear stale or incomplete JSDoc tags in `src/shared/` and re-document all exported primitives, types, and AST utilities.
- **Steps**:
- [x] Clear outdated inline JSDoc comments referencing legacy file paths in `src/shared/`.
- [x] Add explicit `@description`, `@param`, and `@returns` tags to all shared domain types and helper functions.
- [x] Ensure shared helpers include concrete, self-contained `@example` snippets.

- [x] **Task 2: Audit & Standardize TSDoc for Core Engine**
- **Status**: ✅ Done
- **Target**: 2026-08-18
- **Description**: Standardize TSDoc annotations across `src/core/auditor/` to reflect pure, framework-agnostic WCAG auditing logic.
- **Steps**:
  - [x] Audit all core auditing functions (`auditHeadingHierarchy`, DOM node processors, and rule validators).
  - [x] Ensure complete TSDoc metadata (`@description`, `@param`, `@returns`, `@throws`) across every exported core module.
  - [x] Verify core TSDoc examples do not import React or Playwright dependencies.

- [x] **Task 3: Audit & Standardize TSDoc for Adapters & Public Routers**
- **Status**: ✅ Done
- **Target**: 2026-08-18
- **Description**: Refactor TSDoc for React UI elements, Playwright matchers, and `src/main/` subpath entrypoints.
- **Steps**:
- [x] Add `@param` and `@returns` tags to `<Heading>` (`heading.tsx`) and `<Main>` (`main.tsx`).
- [x] Add complete JSDoc headers to Playwright utility `registerPlaywright` (`register.ts`).
- [x] Standardize TSDoc tags for `landmarks.ts` and all public subpath router files in `src/main/`.

---

### Phase 2: Sub-Directory Architecture READMEs (Layer Level)

- [x] **Task 4: Author Shared Layer README**
- **Status**: ✅ Done
- **Target**: 2026-08-19
- **Description**: Create `src/shared/README.md` based on verified TSDoc primitives to document zero-dependency layer rules.
- **Steps**:
- [x] Document domain types, AST helpers, and primitive utilities directly from completed TSDoc annotations.
- [x] Expressly define the zero-import policy (`shared` cannot import from `core`, `adapters`, or `main`).

- [x] **Task 5: Author Core Engine Architecture README**
- **Status**: ✅ Done
- **Target**: 2026-08-18
- **Description**: Create `src/core/auditor/README.md` summarizing the core auditing boundary and API surface.
- **Steps**:
- [x] Aggregate public core functions documented in Phase 1 into a coherent layer README.
- [x] Define framework-agnostic architectural constraints and WCAG compliance scope.

- [x] **Task 6: Author Adapters Architecture READMEs**
- **Status**: ✅ Done
- **Target**: 2026-08-18
- **Description**: Create `src/adapters/react/README.md` and `src/adapters/playwright/README.md` to document framework bindings.
- **Steps**:
- [x] Replace legacy file paths (`src/components`, `src/hooks`, `src/utils`) with correct subpaths in React adapter docs.
- [x] Update Playwright adapter docs to reflect subpath export `react-heading-manager/testing/playwright`.
- [x] Document strict uni-directional dependencies (`adapters` -> `core` / `shared`).

---

### Phase 3: Root Documentation & Changelog Synthesis (Package Level)

- [x] **Task 7: Synthesize Root README from Refined Sub-Layers**
- **Status**: ✅ Done
- **Target**: 2026-08-18
- **Description**: Rewrite root `README.md` using complementary data from layer READMEs and public TSDoc examples.
- **Steps**:
- [x] Document the Hexagonal Architecture breakdown using verified layer READMEs as source material.
- [x] Validate all code blocks against actual `package.json` subpaths (`react-heading-manager`, `react-heading-manager/utils`, `react-heading-manager/testing/playwright`).
- [x] Remove all legacy package references (`heading-manager`).

- [x] **Task 8: Normalize and Update CHANGELOG.md**
- **Status**: ✅ Done
- **Target**: 2026-08-18
- **Description**: Clean up header formatting and record the architectural refactor following Keep a Changelog standards.
- **Steps**:
- [x] Remove duplicate `# Changelog` top-level header.
- [x] Document the architectural refactor and new subpath exports under `[Unreleased]`.
- [x] Fix stale export paths in historical entries (e.g., update `react-heading-manager/testing` to `react-heading-manager/testing/playwright`).

---

### Phase 4: CI Verification & Documentation Automation

- [ ] **Task 9: Implement Documentation Regression Check in CI**
- **Status**: 🔴 To Do
- **Target**: 2026-08-21
- **Description**: Set up automated CI guardrails to prevent documentation drift and missing TSDoc annotations.
- **Steps**:
- [ ] Add a script to verify the presence of mandatory layer READMEs (`src/shared/`, `src/core/heading-auditor/`, `src/adapters/react/`, `src/adapters/playwright/`).
- [ ] Integrate TSDoc validation into the linter and pre-publish release workflow.

## Documentation Guardrails & Drift Prevention

Establish automated guardrails that keep the README, API documentation, examples, changelog, package exports, and architecture rules synchronized with the implementation.

### Phase 1: Core Documentation Guardrails

- [ ] **Task 1 — Validate required README sections**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure the README always contains the required documentation sections and prevents accidental removal of important package documentation.

- **Steps**:
  - [ ] Define the required README sections.
  - [ ] Create an automated README section validator.
  - [ ] Fail CI when a required section is missing.
  - [ ] Add the validator to the documentation check command.

- [ ] **Task 2 — Validate public entry points against the README**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure every public package entry point defined by `package.json` exports is documented.

- **Steps**:
  - [ ] Extract public entry points from `package.json`.
  - [ ] Compare them against the README.
  - [ ] Report undocumented entry points.
  - [ ] Fail CI when an entry point is missing from the documentation.
  - [ ] Detect stale documented entry points that no longer exist.

- [ ] **Task 3 — Validate README and documentation links**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Prevent broken internal documentation links and references to files or sections that no longer exist.

- **Steps**:
  - [ ] Validate internal README links.
  - [ ] Validate referenced documentation files.
  - [ ] Validate README anchors where practical.
  - [ ] Validate package/import references used in documentation.
  - [ ] Fail CI on broken references.

- [ ] **Task 4 — Make documentation examples executable**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure important README examples remain valid as the public API evolves.

- **Steps**:
  - [ ] Extract important examples into `docs/examples`.
  - [ ] Create a dedicated documentation TypeScript configuration.
  - [ ] Compile React examples.
  - [ ] Compile core utility examples.
  - [ ] Compile Playwright examples.
  - [ ] Run documentation example typechecking in CI.

- [ ] **Task 5 — Enforce TSDoc coverage for public APIs**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure public exports have appropriate API documentation and prevent undocumented public APIs from being introduced.

- **Steps**:
  - [ ] Identify public exports for each package entry point.
  - [ ] Define which TSDoc tags are mandatory.
  - [ ] Detect undocumented public functions, components, types, and constants.
  - [ ] Validate `@param` names against actual function parameters.
  - [ ] Validate `@returns` where applicable.
  - [ ] Fail CI when required documentation is missing or stale.

---

### Phase 2: API & Release Documentation Safety

- [ ] **Task 6 — Introduce a public API snapshot**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Detect public API changes automatically so documentation and changelog updates cannot be accidentally skipped.

- **Steps**:
  - [ ] Generate a machine-readable public API snapshot.
  - [ ] Capture exports for every supported package entry point.
  - [ ] Store the snapshot under version control.
  - [ ] Compare the current API against the committed snapshot.
  - [ ] Report added, removed, and changed public APIs.
  - [ ] Require an intentional snapshot update when the API changes.

- [ ] **Task 7 — Add changelog drift guardrails**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure user-visible changes receive an appropriate changelog entry without requiring meaningless entries for internal changes.

- **Steps**:
  - [ ] Define which source changes are considered release-relevant.
  - [ ] Detect changes to public APIs, adapters, package exports, and user-visible behavior.
  - [ ] Require a changelog entry or changeset for release-relevant changes.
  - [ ] Allow explicit classification of internal-only changes.
  - [ ] Add CI validation for missing changelog metadata.

- [ ] **Task 8 — Introduce structured change entries**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Use structured change files to make release-note generation deterministic and reduce manual changelog maintenance.

- **Steps**:
  - [ ] Create a `.changes/` directory convention.
  - [ ] Define change metadata such as `type` and `scope`.
  - [ ] Add entries for added, changed, fixed, and breaking changes.
  - [ ] Validate change-file structure in CI.
  - [ ] Generate changelog sections from structured changes during release preparation.

- [ ] **Task 9 — Detect breaking API changes**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Detect potentially breaking changes to public APIs and require explicit documentation and release classification.

- **Steps**:
  - [ ] Compare the current public API against the previous release.
  - [ ] Detect removed exports.
  - [ ] Detect renamed exports.
  - [ ] Detect incompatible signature changes.
  - [ ] Detect changes to public types.
  - [ ] Require a breaking-change classification.
  - [ ] Require migration documentation where appropriate.

- [ ] **Task 10 — Validate examples against the built package**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Ensure documentation examples work against the actual published package surface rather than only the source tree.

- **Steps**:
  - [ ] Build the package.
  - [ ] Resolve documentation examples against the generated package.
  - [ ] Compile examples against `dist`.
  - [ ] Validate documented subpath imports.
  - [ ] Validate generated package exports.
  - [ ] Fail CI when source exports work but packaged exports do not.

---

### Phase 3: Architecture & Repository Guardrails

- [ ] **Task 11 — Enforce architecture dependency boundaries**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Turn the documented `shared → core → adapters → main` architecture into an executable repository constraint.

- **Steps**:
  - [ ] Define allowed dependency directions.
  - [ ] Detect `shared → core` violations.
  - [ ] Detect `core → adapters` violations.
  - [ ] Detect adapter-to-adapter dependencies where prohibited.
  - [ ] Detect business logic leaking into `main`.
  - [ ] Fail CI when architectural boundaries are violated.

- [ ] **Task 12 — Create a documentation manifest**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Maintain an explicit mapping between public package APIs and their required documentation coverage.

- **Steps**:
  - [ ] Define documentation ownership for each public entry point.
  - [ ] Define documented exports per entry point.
  - [ ] Define required examples per major API.
  - [ ] Define required migration documentation for breaking APIs.
  - [ ] Validate the manifest against the actual package exports.

- [ ] **Task 13 — Build the unified documentation checker**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Provide a single command that executes all documentation and API consistency checks.

- **Steps**:
  - [ ] Create `npm run docs:check`.
  - [ ] Run README section validation.
  - [ ] Run entry-point validation.
  - [ ] Run public API documentation validation.
  - [ ] Run documentation link validation.
  - [ ] Run documentation example compilation.
  - [ ] Run API snapshot validation.
  - [ ] Run changelog validation.
  - [ ] Produce actionable error messages.
  - [ ] Return a non-zero exit code when a guardrail fails.

---

### Phase 4: CI & Release Integration

- [ ] **Task 14 — Integrate documentation guardrails into CI**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Make documentation consistency a blocking part of the normal CI pipeline.

- **Steps**:
  - [ ] Add `docs:check` to the CI workflow.
  - [ ] Run documentation checks after typechecking/build validation.
  - [ ] Ensure failures block merges.
  - [ ] Display actionable documentation drift diagnostics in CI.
  - [ ] Verify the workflow on pull requests.

- [ ] **Task 15 — Integrate API and documentation checks into releases**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Prevent publishing a package when its public API, documentation, changelog, or generated artifacts are inconsistent.

- **Steps**:
  - [ ] Run the full documentation check before publishing.
  - [ ] Validate the API snapshot.
  - [ ] Validate release notes.
  - [ ] Validate package entry points.
  - [ ] Validate examples against the production build.
  - [ ] Prevent release publication when a required documentation contract fails.

---

### Phase 5: Documentation Quality & Maintenance

- [ ] **Task 16 — Generate API/reference documentation**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Reduce manually maintained API reference material by generating reference documentation from the typed public API.

- **Steps**:
  - [ ] Select an API documentation generator.
  - [ ] Generate documentation from public TSDoc.
  - [ ] Generate documentation per package entry point.
  - [ ] Integrate generated documentation into the repository or release artifacts.
  - [ ] Ensure generated output remains synchronized with the API snapshot.

- [ ] **Task 17 — Establish documentation ownership rules**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Define which documentation is generated, which is machine-validated, and which requires human review.

- **Steps**:
  - [ ] Mark generated documentation.
  - [ ] Mark contractually validated documentation.
  - [ ] Define human-reviewed conceptual documentation.
  - [ ] Document the update workflow for each category.
  - [ ] Add contribution guidelines for documentation changes.

- [ ] **Task 18 — Document the documentation workflow**

- **Status**: ⏳ Pending

- **Target**: TBD

- **Description**: Give contributors a clear workflow for keeping API docs, examples, changelog entries, and migration notes synchronized with implementation changes.

- **Steps**:
  - [ ] Document when a README change is required.
  - [ ] Document when a changelog/changeset entry is required.
  - [ ] Document when an API snapshot must be updated.
  - [ ] Document how to add executable examples.
  - [ ] Document how to run `docs:check` locally.
  - [ ] Document how documentation validation participates in CI and releases.
