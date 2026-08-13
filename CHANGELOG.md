# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/0.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-08-11

### 💥 Breaking Changes

- Removed implicit side-effect matcher registration (`import "react-heading-manager/matchers"`).
- Replaced automatic module execution with explicit initializer `registerPlaywright(customExpect?)`.

### 🚀 Added

- Introduced dedicated subpath export `react-heading-manager/testing/playwright`.
- Added `registerPlaywright` initializer function to explicitly bind `toHaveValidHeadingHierarchy` to Playwright's `expect` instance without relying on tree-shakable side effects.
- Added support for passing custom `expect` instances for isolated or multi-project Playwright configurations.

### 🐛 Fixed

- Fixed generic parameter arity mismatch on Playwright's `Matchers<R, T = {}>` interface augmentation (`TS2428`).
- Fixed bundler tree-shaking issues where DTS bundlers stripped `declare global` type blocks from exported sub-files.
- Resolved type pollution where importing core utilities leaked Playwright types into non-Playwright consumer projects.

## [0.1.0] - 2026-08-11

### Added

- Core context-driven heading hierarchy management system via React Context (`HeadingCtx`).
  - `<Main>` landmark component — resets heading context to H1, renders `<main>`.
  - `<Section>` landmark component — increments context, renders `<section>`.
  - `<Article>` landmark component — increments context, renders `<article>`.
  - `<Header>` landmark component — increments context, renders `<header>`.
  - `<Aside>` landmark component — increments context, renders `<aside>`.
  - `<Legend>` landmark component — increments context, renders `<legend>`.
- `<Heading>` component automatically maps ambient context level to the correct semantic HTML tag (`<h1>`–`<h6>`). Falls back to `<h6>` when nesting depth exceeds level 5.
- `<HeadingFragment>` as a non-rendering sectioning provider that increments or overrides the ambient `HeadingCtx` without introducing any DOM wrapper element.
- `createRegion<T>(Tag)` higher-order factory for creating custom landmark region wrapper components targeting any HTML element.
- `useHeading(hasH1?)` custom hook for reading and computing the next heading level from `HeadingCtx`. Suitable for advanced custom region implementations.
- `HeadingCtx` React Context export for direct context access in custom components.
- Subpath export `react-heading-manager/utils` containing framework-agnostic DOM auditing and parsing utilities:
  - `drawRegion(root)` — recursively parses a DOM subtree into a structured `RegionMapping` landmark tree.
  - `checkHeadingOrderReport(region, initialLevel?)` — validates a `RegionMapping` tree against WCAG heading order rules, returning a `HeadingOrderReport` with detailed `HeadingOrderError` records.
  - `checkHeadingOrder(region, currentLevel?)` — boolean shorthand returning `true` when the hierarchy is fully valid.
  - `getRegionIdentifier(element)` — resolves a human-readable label for a landmark element via `aria-label`, `aria-labelledby`, or tag name fallback.
  - `parseHeadingLevel(tagName)` — parses `"h1"`–`"h6"` tag strings into numeric levels.
  - `resolveHeadingDetail(element)` — extracts `tag`, `text`, and `element` metadata from a heading DOM node.
- Subpath export `react-heading-manager/testing` providing the `toHaveValidHeadingHierarchy(initialLevel?)` custom Playwright / Testing Library matcher for automated E2E and integration heading accessibility testing.
- Shared TypeScript types exported from the root entrypoint:
  - `HeadingLevel` — 0-based heading context index union type.
  - `HeadingDetail` — metadata descriptor for a discovered heading element.
  - `RegionMapping` — nested tree structure emitted by `drawRegion`.
  - `HeadingOrderError` — detailed violation record for a skipped or invalid heading level.
  - `HeadingOrderReport` — audit report containing validity flag and error list.
- Comprehensive inline TSDoc annotations (`@description`, `@param`, `@returns`, `@example`, `@a11y`) across all exported components, hooks, utilities, and types in `src/`.
- Localized sub-directory `README.md` documentation in `src/components/`, `src/hooks/`, `src/utils/`, and `src/__testing__/`.
- Dual ESM (`.mjs`) and CommonJS (`.cjs`) build output via `tsdown`, with TypeScript declaration files (`.d.mts`, `.d.cts`) for all three subpath exports.
- Full test suite: 266 tests across 17 test files with 97% line coverage.
- Next.js App Router compatibility — all components marked `"use client"` with SSR-safe rendering.
- WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships) architectural compliance enforced at the component tree level.

[Unreleased]: https://github.com/vickbk/heading-manager/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/vickbk/heading-manager/releases/tag/v0.1.0

## [0.1.1] - 2026-08-11

### Security

- Switched npm publishing authentication from static `NPM_TOKEN` secrets to npm OIDC Trusted Publishers.

### Changed

- Removed `NODE_AUTH_TOKEN` environment variable from the publish workflow step in `.github/workflows/publish.yml`.

## [0.2.0-beta.1] - 2026-08-13

> **Pre-release Note:** This beta release ensures ambient type declarations are properly preserved in `tsdown` DTS outputs and improves Playwright setup patterns.

---

### 🐛 Bug Fixes & Type System Improvements

- **Preserved `tsdown` Module Augmentation:** Fixed an issue where `tsdown`'s DTS generation tree-shook ambient `declare global` blocks from output declaration bundles (`.d.mts`, `.d.cts`, `.d.ts`). Playwright's `expect(...)` chain now natively recognizes `.toHaveValidHeadingHierarchy()` without requiring manual type imports or casting.
- **Strict Heading Level Types:** Exported the `HeadingLevel` type (`1 | 2 | 3 | 4 | 5 | 6`) to enforce strict compile-time checks on `initialLevel`, preventing invalid or non-positive integers from passing in test files.

---

### 📦 Global Setup (Recommended)

To avoid re-registering custom matchers in individual spec files, call `registerPlaywright()` once inside your `playwright.config.ts`:

#### `playwright.config.ts`

```typescript
import { defineConfig } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing";

// Register matchers globally across the entire test suite
registerPlaywright();

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
  },
});
```

#### `e2e/accessibility.spec.ts`

```typescript
import { test, expect } from "@playwright/test";
import type { HeadingLevel } from "react-heading-manager/testing";

test("audits page heading hierarchy", async ({ page }) => {
  await page.goto("/");

  // Full IDE autocomplete & zero TypeScript compilation errors
  await expect(page).toHaveValidHeadingHierarchy();

  // Scoped audit starting at an H2 level
  const initialLevel: HeadingLevel = 2;
  await expect(page.locator('main[role="main"]')).toHaveValidHeadingHierarchy(
    initialLevel,
  );
});
```

---

### 🛠️ Migration

No breaking runtime changes. If you previously had per-file `registerPlaywright` calls in your tests, you can consolidate them into `playwright.config.ts`.

## [0.2.0-beta.2] - 2026-08-13

### Fixed

- **Release Automation:** Updated `extract-release-note.ts` to properly normalize version headers and reliably match prerelease tags (e.g., `v0.2.0-beta.2`).
- **Publish Pipeline:** Fixed section boundary lookup logic to prevent exit code 1 errors when generating `RELEASE_CHANGELOG.md` during publish workflows.
