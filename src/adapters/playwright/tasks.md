## Core Implementation & Adapter Architecture

- [x] **Decouple Core Matcher & Create Playwright Adapter**
- **Status**: ✅ Doing
- **Target**: 2026-08-11
- **Description**: Decouple matcher functions from side-effect execution and wrap Playwright registration in an explicit `registerPlaywrightMatchers` initializer.
- **Steps**:
  - [x] Extract `toHaveValidHeadingHierarchy` as a pure, side-effect-free assertion function.
  - [x] Create the `src/__testing__/playwright/index.ts` adapter module.
  - [x] Implement the `registerPlaywrightMatchers(targetExpect?)` initializer function.

## Type Definitions & Ambient Declarations

- [x] **Fix Playwright Generic Type Augmentation**
- **Status**: ✅ Done
- **Target**: 2026-08-12
- **Description**: Augment Playwright's `Matchers` interface using proper generic arity to fix TypeScript autocomplete and type checking in consumer applications.
- **Steps**:
  - [x] Update `PlaywrightTest.Matchers<R, T="{}">` in the type declaration file.
  - [x] Add `import type {} from "@playwright/test";` at file root to preserve module context and avoid bundler type-stripping.
  - [x] Ensure `@playwright/test` is marked as an optional peer dependency in `package.json`.

## Build & Package Export Configuration

- [x] **Configure Multi-Subpath Build & Package Exports**
- **Status**: ✅ Done
- **Target**: 2026-08-11
- **Description**: Configure `tsup` and `package.json` exports to expose the Playwright adapter under `react-heading-manager/testing/playwright`.
- **Steps**:
  - [x] Add the `testing/playwright` entrypoint to `tsdown.config.ts`.
  - [x] Map `./testing/playwright` in the `package.json` `exports` object with `.d.ts`, `.mjs`, and `.js` targets.
  - [x] Verify `"sideEffects": false` in `package.json` so bundlers can safely prune unused utilities.

## Documentation & Integration Verification

- [x] **Update Documentation & Verify End-to-End Build**
- **Status**: ✅ Done
- **Target**: 2026-08-12
- **Description**: Update README documentation to showcase the explicit initializer pattern and verify the build output via `pnpm pack`.
- **Steps**:
  - [x] Update `README.md` and `src/__testing__/README.md` with `registerPlaywrightMatchers` setup examples.
  - [x] Execute full `pnpm run typecheck`, `pnpm run test:run`, and `pnpm build` sequence.
  - [x] Perform `pnpm pack --dry-run` to inspect generated `.d.ts` declaration outputs.
