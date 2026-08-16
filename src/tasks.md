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

- [ ] **Migrate Playwright Matcher Adapter (`src/adapters/playwright/`)**
- **Status**: ⏳ Todo
- **Target**: 2026-08-20
- **Description**: Relocate Playwright custom matchers and initializers to `src/adapters/playwright/`.
- **Steps**:
- [ ] Move `register.ts`, `to-have-valid-heading-hierarchy.ts`, and tests to `src/adapters/playwright/utils/`.
- [ ] Move ambient declaration file to `src/adapters/playwright/types.d.ts`.
- [ ] Create `src/adapters/playwright/index.ts` barrel file.
- [ ] Create `src/adapters/playwright/README.md` with Playwright usage instructions.

---

### Phase 4: Main Entrypoint Router (`src/main/`) & Bundler Alignment

- [ ] **Create Lightweight Re-export Shims in `src/main/**`
- **Status**: ⏳ Todo
- **Target**: 2026-08-21
- **Description**: Implement thin entrypoint router files inside `src/main/` that expose public API subpaths without containing business logic.
- **Steps**:
- [ ] Create `src/main/index.ts` re-exporting from `../adapters/react`.
- [ ] Create `src/main/utils.ts` re-exporting from `../core/heading-auditor` and `../shared/types`.
- [ ] Create `src/main/testing/playwright.ts` re-exporting from `../../adapters/playwright`.
- [ ] Update `tsdown.config.ts` entrypoints to target `src/main/*`:
      `ts entry: { index: "src/main/index.ts", "utils/index": "src/main/utils.ts", "testing/playwright/index": "src/main/testing/playwright.ts", } `
- [ ] Update `package.json` `exports` mapping.

---

### Phase 5: Path Auditing & Quality Verification

- [ ] **Update Import Paths & Run Quality Audit**
- **Status**: ⏳ Todo
- **Target**: 2026-08-22
- **Description**: Update all relative import paths across the codebase to adhere to the strict dependency flow rules and run verification scripts.
- **Steps**:
- [ ] Fix relative import paths in all moved files.
- [ ] Run `pnpm typecheck` to verify zero type leaks or invalid imports.
- [ ] Run `pnpm test` (Vitest) to ensure 100% test pass rate.
- [ ] Run `pnpm build` to confirm `dist/` outputs (`dist/index.js`, `dist/utils/index.js`, `dist/testing/playwright/index.js`) generate cleanly.
- [ ] Run `pnpm pack --dry-run` to verify published tarball structure.
