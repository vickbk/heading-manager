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

- [ ] **Task 2: Audit & Standardize TSDoc for Core Engine**
- **Status**: 🔴 To Do
- **Target**: 2026-08-18
- **Description**: Standardize TSDoc annotations across `src/core/heading-auditor/` to reflect pure, framework-agnostic WCAG auditing logic.
- **Steps**:
- [ ] Audit all core auditing functions (`auditHeadingHierarchy`, DOM node processors, and rule validators).
- [ ] Ensure complete TSDoc metadata (`@description`, `@param`, `@returns`, `@throws`) across every exported core module.
- [ ] Verify core TSDoc examples do not import React or Playwright dependencies.

- [ ] **Task 3: Audit & Standardize TSDoc for Adapters & Public Routers**
- **Status**: 🔴 To Do
- **Target**: 2026-08-18
- **Description**: Refactor TSDoc for React UI elements, Playwright matchers, and `src/main/` subpath entrypoints.
- **Steps**:
- [ ] Add `@param` and `@returns` tags to `<Heading>` (`heading.tsx`) and `<Main>` (`main.tsx`).
- [ ] Add complete JSDoc headers to Playwright utility `registerPlaywright` (`register.ts`).
- [ ] Standardize TSDoc tags for `landmarks.ts` and all public subpath router files in `src/main/`.

---

### Phase 2: Sub-Directory Architecture READMEs (Layer Level)

- [ ] **Task 4: Author Shared Layer README**
- **Status**: 🔴 To Do
- **Target**: 2026-08-19
- **Description**: Create `src/shared/README.md` based on verified TSDoc primitives to document zero-dependency layer rules.
- **Steps**:
- [ ] Document domain types, AST helpers, and primitive utilities directly from completed TSDoc annotations.
- [ ] Expressly define the zero-import policy (`shared` cannot import from `core`, `adapters`, or `main`).

- [ ] **Task 5: Author Core Engine Architecture README**
- **Status**: 🔴 To Do
- **Target**: 2026-08-19
- **Description**: Create `src/core/heading-auditor/README.md` summarizing the core auditing boundary and API surface.
- **Steps**:
- [ ] Aggregate public core functions documented in Phase 1 into a coherent layer README.
- [ ] Define framework-agnostic architectural constraints and WCAG compliance scope.

- [ ] **Task 6: Author Adapters Architecture READMEs**
- **Status**: 🔴 To Do
- **Target**: 2026-08-19
- **Description**: Create `src/adapters/react/README.md` and `src/adapters/playwright/README.md` to document framework bindings.
- **Steps**:
- [ ] Replace legacy file paths (`src/components`, `src/hooks`, `src/utils`) with correct subpaths in React adapter docs.
- [ ] Update Playwright adapter docs to reflect subpath export `react-heading-manager/testing/playwright`.
- [ ] Document strict uni-directional dependencies (`adapters` -> `core` / `shared`).

---

### Phase 3: Root Documentation & Changelog Synthesis (Package Level)

- [ ] **Task 7: Synthesize Root README from Refined Sub-Layers**
- **Status**: 🔴 To Do
- **Target**: 2026-08-20
- **Description**: Rewrite root `README.md` using complementary data from layer READMEs and public TSDoc examples.
- **Steps**:
- [ ] Document the Hexagonal Architecture breakdown using verified layer READMEs as source material.
- [ ] Validate all code blocks against actual `package.json` subpaths (`react-heading-manager`, `react-heading-manager/utils`, `react-heading-manager/testing/playwright`).
- [ ] Remove all legacy package references (`heading-manager`).

- [ ] **Task 8: Normalize and Update CHANGELOG.md**
- **Status**: 🔴 To Do
- **Target**: 2026-08-20
- **Description**: Clean up header formatting and record the architectural refactor following Keep a Changelog standards.
- **Steps**:
- [ ] Remove duplicate `# Changelog` top-level header.
- [ ] Document the architectural refactor and new subpath exports under `[Unreleased]`.
- [ ] Fix stale export paths in historical entries (e.g., update `react-heading-manager/testing` to `react-heading-manager/testing/playwright`).

---

### Phase 4: CI Verification & Documentation Automation

- [ ] **Task 9: Implement Documentation Regression Check in CI**
- **Status**: 🔴 To Do
- **Target**: 2026-08-21
- **Description**: Set up automated CI guardrails to prevent documentation drift and missing TSDoc annotations.
- **Steps**:
- [ ] Add a script to verify the presence of mandatory layer READMEs (`src/shared/`, `src/core/heading-auditor/`, `src/adapters/react/`, `src/adapters/playwright/`).
- [ ] Integrate TSDoc validation into the linter and pre-publish release workflow.
