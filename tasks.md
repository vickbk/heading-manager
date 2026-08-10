## Readiness For First publish

### 1. Build Output & Module Resolution

- [x] **Fix TypeScript Declaration Mappings in `package.json**`
- **Status**: ✅ Done
- **Target**: 2026-08-10
- **Description**: Update `package.json` type mappings to target generated `.d.mts` and `.d.cts` files so TypeScript consumers can resolve package types correctly.
- **Steps**:
  - [x] Update top-level `"types"` field from `./dist/index.d.ts` to `./dist/index.d.mts`.
  - [x] Update `"exports"` field for `.` and `./testing` subpaths to map `import` and `require` type definitions explicitly.
  - [x] Add `README.md`, `LICENSE`, and `CHANGELOG.md` to the `"files"` array alongside `dist`.

### 2. API Surface & Core Exports

- [x] **Re-Export Missing Core API Surface in `src/index.ts**`
- **Status**: 🧑‍💻 Done
- **Target**: 2026-08-10
- **Description**: Expose missing components and utility functions in the root entrypoint to give library consumers programmatic access to the full API.
- **Steps**:
  - [x] Export `HeadingFragment` from `./components/heading-fragment`.
  - [x] Export `checkHeadingOrder` and `checkHeadingOrderReport` from `./utils/check-heading-order-report`.
  - [x] Verify entrypoint exports via local build check.

- [x] **Fix Testing Subpath Type Exports in `src/**testing**/index.ts**`
- **Status**: ✅ Done
- **Target**: 2026-08-10
- **Description**: Resolve empty type generation (`export {}`) in `./testing` by explicitly re-exporting the Playwright matcher and ambient types.
- **Steps**:
  - [x] Export `toHaveValidHeadingHierarchy` from `./helpers/to-have-valid-heading-hierarchy`.
  - [x] Re-export all type definitions from `./types.d`.
  - [x] Run `pnpm run build` and confirm `dist/testing.d.mts` contains full matcher interfaces.

### 3. WCAG & Accessibility Enhancements

- [x] **Enhance `drawRegion` Utility for WCAG ARIA Headings**
- **Status**: ✅ Done
- **Target**: 2026-08-10
- **Description**: Update `drawRegion` to support `[role="heading"]` elements, parse `aria-level`, and fall back to `aria-label` text content.
- **Steps**:
  - [x] Update `HEADING_SELECTOR` in `src/utils/draw-region.ts` to include `[role="heading"]`.
  - [x] Add `aria-level` inspection logic when constructing `detailedHeadings`.
  - [x] Add `aria-label` text fallback when `textContent` is empty or whitespace.
  - [x] Add unit tests verifying custom ARIA heading extraction in `drawRegion.test.ts`.

### 4. Package Hygiene & Documentation

- [ ] **Create Root Documentation, Legal, and Release Files**
- **Status**: ⏳ Todo
- **Target**: 2026-08-12
- **Description**: Add required root documentation files to meet open-source legal requirements and npm package standards.
- **Steps**:
  - [ ] Create root `LICENSE` file containing standard MIT license text.
  - [ ] Create `README.md` with package overview, installation instructions, usage examples, and API reference.
  - [ ] Create `CHANGELOG.md` documenting initial `1.0.0` release features.

### 5. Release Verification & Quality Assurance

- [ ] **Execute Pre-Publication Verification and Pack Dry-Run**
- **Status**: ⏳ Todo
- **Target**: 2026-08-12
- **Description**: Perform a full build, typecheck, test execution, and npm pack dry-run to ensure the published tarball is ready for distribution.
- **Steps**:
  - [ ] Run `pnpm clean && pnpm run typecheck` to verify zero TypeScript errors.
  - [ ] Run `pnpm run test:run` to verify all Vitest unit and integration suites pass.
  - [ ] Run `pnpm run build` to generate distribution bundles in `/dist`.
  - [ ] Run `pnpm pack --dry-run` to inspect tarball output and verify file inclusions.
