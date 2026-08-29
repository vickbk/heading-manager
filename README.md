# react-heading-manager

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/react-heading-manager.svg)](https://www.npmjs.com/package/react-heading-manager)
[![Build Status](https://img.shields.io/github/actions/workflow/status/vickbk/heading-manager/lint-test.yml?branch=main)](https://github.com/vickbk/heading-manager/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/vickbk/heading-manager)

Automatic heading hierarchy management and accessibility auditing for React applications.

`react-heading-manager` derives heading levels from your component and landmark structure, so you don't have to manually drill `h1` through `h6` through deeply nested component trees. It also provides a framework-agnostic audit engine and a Playwright matcher for validating heading hierarchy in tests.

> **Build your UI. Let the document structure determine the heading level.
> Verify the result automatically.**

---

## ⚡ Quick Start

Get automatic heading hierarchy management running in a few lines.

### 1. Install

```bash
npm install react-heading-manager
```

### 2. Replace manually managed heading levels

Instead of manually deciding whether a component should render an `<h1>`,
`<h2>`, `<h3>`, etc.:

```tsx
import {
  Heading,
  HeadingFragment,
  Main,
  Section,
  Article,
} from "react-heading-manager";

export function Page() {
  return (
    <Main>
      <Heading>Page Title</Heading>

      <Section>
        <Heading>Features</Heading>

        <Article>
          <Heading>Release Notes</Heading>
        </Article>
      </Section>

      <HeadingFragment>
        <Heading>Related Content</Heading>
      </HeadingFragment>
    </Main>
  );
}
```

The heading level is derived from the surrounding document structure:

```html
<main>
  <h1>Page Title</h1>

  <section>
    <h2>Features</h2>

    <article>
      <h3>Release Notes</h3>
    </article>
  </section>

  <h2>Related Content</h2>
</main>
```

No `level` prop. No `h1`/`h2` prop drilling. No shared heading-level state between components.

### 3. Verify the hierarchy in Playwright

```bash
npm install -D @playwright/test
```

```ts
import { expect, test } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);

test("page heading hierarchy is valid", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveValidHeadingHierarchy();
});
```

The matcher reports structural violations with enough context to identify the offending region and heading.

### 4. Or audit the DOM directly

The core audit engine can be used independently of React and Playwright:

```ts
import {
  drawRegion,
  checkNormalizedHeadingReport,
} from "react-heading-manager/utils";

const regionTree = drawRegion(document.body);

const report = checkNormalizedHeadingReport({
  region: regionTree,
});

if (!report.isValid) {
  console.warn(report.errors);
}
```

This makes the audit engine useful for unit tests, custom tooling, accessibility audits, and other DOM-based workflows.

> **That's it.** Use `Heading` components to manage hierarchy, then
> use the audit utilities or Playwright matcher to verify the resulting document structure.

---

## Why react-heading-manager?

Heading levels are often difficult to manage in component-based applications.

A component may be rendered:

- directly inside a page
- inside several nested sections
- inside reusable components
- inside a dynamically composed layout
- in a different location depending on application state

Manually passing heading levels through those component boundaries quickly becomes difficult to maintain:

```tsx
<Heading level={2}>...</Heading>
```

With `react-heading-manager`, the heading level is derived from the document
structure instead:

```tsx
<Section>
  <Heading>Section title</Heading>

  <Article>
    <Heading>Article title</Heading>
  </Article>
</Section>
```

The same components can therefore be composed without manually coordinating heading levels across the component tree.

---

## Key Features

- **Automatic heading level tracking** without manual `h1`–`h6` prop drilling
- **Semantic landmark awareness** for `main`, `section`, `article`, and ARIA landmark regions
- **Framework-agnostic audit engine** for DOM parsing and hierarchy analysis
- **Normalized heading analysis** using deterministic numeric heading levels
- **Legacy-compatible heading analysis** for existing `RegionMapping` data
- **Playwright integration** for explicit E2E accessibility assertions
- **Detailed diagnostics** including heading paths, levels, text, and DOM references
- **TypeScript support** with typed public APIs and Playwright matcher augmentation
- **Zero-side-effect initialization**
- **Tree-shakable module structure**

---

## Installation

### npm

```bash
npm install react-heading-manager
```

### yarn

```bash
yarn add react-heading-manager
```

### pnpm

```bash
pnpm add react-heading-manager
```

### bun

```bash
bun add react-heading-manager
```

### Test utilities

If you use the testing integrations:

```bash
npm install -D @playwright/test happy-dom
```

Or:

```bash
pnpm add -D @playwright/test happy-dom
```

---

## Usage

### React Application

The React adapter provides the components and hooks used to build heading-aware document structures.

```tsx
import {
  Heading,
  HeadingFragment,
  Main,
  Section,
  Article,
} from "react-heading-manager";

export function ProductPage() {
  return (
    <Main>
      <Heading>Products</Heading>

      <Section>
        <Heading>Featured Products</Heading>

        <Article>
          <Heading>Product Details</Heading>
        </Article>
      </Section>

      <HeadingFragment>
        <Heading>Related Products</Heading>
      </HeadingFragment>
    </Main>
  );
}
```

The resulting structure follows the surrounding heading hierarchy:

```html
<main>
  <h1>Products</h1>

  <section>
    <h2>Featured Products</h2>

    <article>
      <h3>Product Details</h3>
    </article>
  </section>

  <h4>Related Products</h4>
</main>
```

When `h6Clamp` is disabled (default behavior), normalized heading levels can continue beyond the
native HTML H1–H6 range. For example, a normalized H7 is represented as:

```html
<h6 role="heading" aria-level="7">Deep Heading</h6>
```

Set `h6Clamp` to `true` when heading levels should remain within the native
H1–H6 range:

```tsx
<Main h6Clamp>
  <Heading>Page Title</Heading>
  {/* Heading levels are capped at H6 */}
</Main>
```

The `h6Clamp` setting is inherited by nested regions and can be overridden
where needed.

### Playwright E2E Testing

Register the matcher once in your Playwright setup:

```ts
import { expect } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);
```

Then use the matcher in your tests:

```ts
import { expect, test } from "@playwright/test";

test("heading hierarchy is valid", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveValidHeadingHierarchy();
});
```

You can also scope the check to a specific landmark:

```ts
test("main content has a valid heading hierarchy", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("main")).toHaveValidHeadingHierarchy();
});
```

### Standalone Core Utilities

The audit engine does not depend on React.

```ts
import {
  drawRegion,
  checkNormalizedHeadingReport,
} from "react-heading-manager/utils";

const regionTree = drawRegion(document.body);

const report = checkNormalizedHeadingReport({
  region: regionTree,
});

if (!report.isValid) {
  console.warn(report.errors);
}
```

The audit pipeline is intentionally split into two stages:

```text
DOM
 │
 ▼
drawRegion()
 │
 ▼
RegionMapping
 │
 ▼
checkNormalizedHeadingReport()
 │
 ▼
HeadingOrderReport
```

This allows DOM extraction and hierarchy validation to be tested and used independently.

---

## Diagnostics

When a heading hierarchy violation is detected, the audit engine produces structured diagnostic information.

For example:

```text
Heading level skipped at main[0] > section[0]:
context level is H1, expected maximum H2, but found H3.
```

A `HeadingOrderError` contains information such as:

- region path
- region tag name
- heading level
- normalized numeric level
- heading text
- DOM element reference
- expected maximum level
- actual level
- human-readable error message

This allows integrations to provide useful diagnostics rather than simply returning `true` or `false`.

For example:

```ts
const report = checkNormalizedHeadingReport({
  region: regionTree,
});

for (const error of report.errors) {
  console.error({
    path: error.path,
    heading: error.heading,
    actualLevel: error.actualLevel,
    expectedMaxLevel: error.expectedMaxLevel,
    text: error.text,
  });
}
```

---

## Heading Hierarchy Model

The normalized audit engine evaluates heading levels numerically.

A heading may:

- remain at the same level
- decrease to a lower level
- increase by exactly one level

An increase of more than one level is reported as a hierarchy violation.

For example:

```text
H1 → H2   ✓
H2 → H3   ✓
H3 → H3   ✓
H3 → H2   ✓
H2 → H4   ✗
```

The normalized engine uses `HeadingDetail.numLevel` as its canonical numeric representation.

This also means normalized levels greater than H6 can be represented and validated deterministically:

```text
H6 → H7   ✓
H7 → H8   ✓
H6 → H8   ✗
H7 → H10  ✗
```

The normalized implementation intentionally does not reinterpret or clamp these values.

> The sequential heading-level rule is an accessibility auditing heuristic.
> A reported heading-level jump should not be interpreted by itself as a definitive WCAG conformance determination.

---

## Entry Points & Import Subpaths

The package exposes separate entry points for the React adapter, core
utilities, and Playwright integration.

| Subpath                                    | Target module        | Usage                                                                                 |
| ------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------- |
| `react-heading-manager`                    | React adapter        | Render `<Heading>`, `<Main>`, `<Section>`, `<Article>`, hooks, and related components |
| `react-heading-manager/utils`              | Core + shared engine | DOM parsing, normalized heading audits, and hierarchy checks                          |
| `react-heading-manager/testing/playwright` | Playwright adapter   | Register and use the custom heading hierarchy matcher                                 |

### Playwright import

The supported Playwright entry point is:

```ts
import { registerPlaywright } from "react-heading-manager/testing/playwright";
```

⚠️ Avoid stale imports targeting the older path:

```ts
react - heading - manager / playwright;
```

---

## Architecture & Module Isolation Policy

The package is organized into four layers with a strict dependency direction:

```text
shared
   ↓
core
   ↓
adapters
   ↓
main
```

| Layer          | Purpose                              | Can import                 | Must not import                            |
| -------------- | ------------------------------------ | -------------------------- | ------------------------------------------ |
| `src/shared`   | Pure DOM primitives and shared types | Nothing higher-level       | `src/core`, `src/adapters`, `src/main`     |
| `src/core`     | Audit engine and DOM algorithms      | `src/shared`               | `src/adapters`, sibling `src/core` modules |
| `src/adapters` | React and Playwright integrations    | `src/core`, `src/shared`   | Sibling adapters                           |
| `src/main`     | Public re-export routers             | `src/adapters`, `src/core` | Business logic                             |

This isolation keeps the runtime surface clean and prevents framework-specific implementations from leaking into the framework-agnostic engine.

---

## TypeScript Support

The package provides typed public APIs throughout the React, core, and testing layers.

Playwright matcher types are also augmented automatically.

```ts
import { expect } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);

await expect(page).toHaveValidHeadingHierarchy();
```

No manual declaration merging is required.

---

## Accessibility

`react-heading-manager` is designed to support accessibility auditing around document structure and heading relationships.

The core audit functionality considers:

- native heading elements
- ARIA heading roles
- `aria-level`
- HTML and ARIA landmark regions
- heading relationships across nested regions

The package's audit rules are intended to help identify structural issues
during development and testing.

They should be treated as **auditing heuristics rather than a complete WCAG conformance engine**.

---

## Testing

The project maintains unit and integration coverage across:

- DOM region extraction
- heading normalization
- legacy heading resolution
- heading hierarchy processing
- nested region traversal
- normalized heading validation
- Playwright matcher integration
- edge cases involving ARIA headings and levels beyond H6

Run the test suite with:

```bash
npm test
```

Run linting with:

```bash
npm run lint
```

---

## License

MIT © [Vick Bake](https://github.com/vickbk)

See [LICENSE](./LICENSE) for the full license text.
