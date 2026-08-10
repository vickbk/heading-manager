# react-heading-manager

**Automatic, context-driven WCAG-compliant heading hierarchy management for React.**

Never manually track heading levels again — nest landmark components and let the library compute `<h1>`–`<h6>` tags for you.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/react-heading-manager.svg)](https://www.npmjs.com/package/react-heading-manager)
[![Build Status](https://img.shields.io/github/actions/workflow/status/vickbk/heading-manager/ci.yml?branch=main)](https://github.com/vickbk/heading-manager/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-97%25-brightgreen.svg)](https://github.com/vickbk/heading-manager)

---

## Features

- 🧠 **Context-aware heading propagation** — `<Heading>` automatically renders `<h1>`–`<h6>` based on nesting depth, with zero manual props.
- 🏗️ **Semantic landmark components** — `<Main>`, `<Section>`, `<Article>`, `<Header>`, `<Aside>`, and `<Legend>` each create an accessible HTML5 sectioning boundary.
- 🔤 **`<Heading>` and `<HeadingFragment>`** — Semantic heading output plus virtual sectioning context providers that stay correct across deeply nested component trees.
- 🔬 **DOM auditing utilities** — `drawRegion`, `checkHeadingOrderReport`, and friends available under `react-heading-manager/utils` for runtime and test-time analysis — zero impact on your component bundle.
- 🧪 **First-class testing support** — `toHaveValidHeadingHierarchy` Playwright / Testing Library matcher ships under `react-heading-manager/testing`.
- ♿ **WCAG 2.1 SC 1.3.1 compliant** — The architecture structurally prevents skipped heading levels (e.g. H1 → H3), a common screen-reader navigation failure.
- 📦 **Dual ESM + CJS output** — Full TypeScript declarations included.
- 🌐 **Next.js App Router ready** — All components are marked `"use client"` and SSR-safe.

---

## Installation

```bash
# pnpm (recommended)
pnpm add react-heading-manager

# npm
npm install react-heading-manager

# yarn
yarn add react-heading-manager
```

### Optional peer dependencies

Install only what you use:

```bash
# For DOM auditing utilities and the Playwright matcher
pnpm add -D @playwright/test happy-dom
```

---

## Quick Start

```tsx
import {
  Main,
  Section,
  Article,
  Heading,
  HeadingFragment,
} from "react-heading-manager";

export function BlogPage() {
  return (
    <Main>
      {/* Renders <h1> — top of the heading context */}
      <Heading>My Blog</Heading>

      <Section>
        {/* Renders <h2> — one level deeper */}
        <Heading>Latest Posts</Heading>

        <Article>
          {/* Renders <h3> — two levels deeper */}
          <Heading>Understanding WCAG 1.3.1</Heading>
          <p>
            Info and Relationships is one of the most impactful WCAG criteria...
          </p>
        </Article>

        <Article>
          {/* Renders <h3> — same sibling depth */}
          <Heading>Building Accessible React Apps</Heading>

          <Section>
            {/* Renders <h4> — three levels deep */}
            <Heading>Component Architecture</Heading>
            {/* HeadingFragment: advances the virtual heading context without creating a DOM wrapper */}
            <HeadingFragment>
              {/* Renders <h5> — same nested section depth, but with an updated context */}
              <Heading>Getting Started</Heading>
            </HeadingFragment>
          </Section>
        </Article>
      </Section>
    </Main>
  );
}
```

**Output HTML (rendered):**

```html
<main>
  <h1>My Blog</h1>
  <section>
    <h2>Latest Posts</h2>
    <article>
      <h3>Understanding WCAG 1.3.1</h3>
      <p>
        Info and Relationships is one of the most impactful WCAG criteria...
      </p>
    </article>
    <article>
      <h3>Building Accessible React Apps</h3>
      <section>
        <h4>Component Architecture</h4>
        <h5>Getting Started</h5>
      </section>
    </article>
  </section>
</main>
```

---

## Core API Reference

### Components

All components accept all standard HTML attributes for their underlying element, plus `ref` forwarding.

#### Landmark Region Components

These landmark components render an HTML5 sectioning element and **increment the `HeadingCtx` level** for nested `<Heading>` children. `<HeadingFragment>` is a non-rendering sectioning provider that also updates the ambient `HeadingCtx` without emitting a wrapper element.

| Component           | HTML Element                | Description                                                                                                             |
| ------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `<Main>`            | `<main>`                    | Page-level content region. Resets context to H1. Use once per page.                                                     |
| `<Section>`         | `<section>`                 | Generic sectioning boundary.                                                                                            |
| `<Article>`         | `<article>`                 | Self-contained, independently distributable content.                                                                    |
| `<Header>`          | `<header>`                  | Introductory or navigational header within a landmark.                                                                  |
| `<Aside>`           | `<aside>`                   | Tangentially related content (e.g. sidebars).                                                                           |
| `<Legend>`          | `<legend>`                  | Fieldset legend region.                                                                                                 |
| `<HeadingFragment>` | `None` / `<React.Fragment>` | Non-rendering sectioning provider that increments or overrides ambient `HeadingCtx` without emitting a wrapper element. |

```tsx
import {
  Main,
  Section,
  Article,
  Header,
  Aside,
  Legend,
} from "react-heading-manager";

<Main aria-label="Main content">
  <Header>
    <Heading>Site Name</Heading>
  </Header>
  <Section aria-labelledby="blog-section">
    <Heading id="blog-section">Blog</Heading>
    <Aside aria-label="Related links">
      <Heading>See Also</Heading>
    </Aside>
  </Section>
</Main>;
```

#### `<Heading>`

```tsx
import { Heading } from "react-heading-manager";
```

Reads the ambient `HeadingCtx` and renders the matching `<h1>`–`<h6>` tag. Falls back to `<h6>` if the nesting depth exceeds H6.

| Prop       | Type                                 | Description                           |
| ---------- | ------------------------------------ | ------------------------------------- |
| `children` | `ReactNode`                          | Heading text or content               |
| `ref`      | `Ref<HTMLHeadingElement>`            | Forwarded ref to the heading DOM node |
| `...props` | `HTMLAttributes<HTMLHeadingElement>` | Any valid HTML heading attribute      |

#### `<HeadingFragment>`

```tsx
import { HeadingFragment } from "react-heading-manager";
```

Provides a new `HeadingCtx` value to its children. If `level` is omitted, it increments the ambient heading level by one; otherwise it applies the explicit `HeadingLevel` override (`0` = H1, `1` = H2, ..., `5` = H6). It emits zero DOM nodes and does not render a wrapper element.

| Prop       | Type                      | Description                                                  |
| ---------- | ------------------------- | ------------------------------------------------------------ |
| `children` | `ReactNode`               | Content rendered inside the updated heading context          |
| `level`    | `HeadingLevel` (optional) | Explicit 0-based override: `0` = H1, `1` = H2, ..., `5` = H6 |

#### `createRegion(Tag)`

```tsx
import { createRegion } from "react-heading-manager";

// Create a custom landmark wrapper for any HTML element
const Nav = createRegion<HTMLElement>("nav");
```

Factory function that creates a landmark wrapper component for any HTML element tag. The returned component increments `HeadingCtx` and forwards refs.

---

### Hooks

#### `useHeading(hasH1?)`

```tsx
import { useHeading, HeadingCtx } from "react-heading-manager";
```

Low-level hook that computes the next heading level from the current `HeadingCtx`. Used internally by all landmark components. Useful when building custom region wrappers.

| Parameter | Type      | Default | Description                                  |
| --------- | --------- | ------- | -------------------------------------------- |
| `hasH1`   | `boolean` | `true`  | Whether an H1 already exists in this context |

**Returns:** `HeadingLevel` (0-based index: `0`=H1 … `5`=H6)

```tsx
function CustomRegion({ children }: { children: React.ReactNode }) {
  const nextLevel = useHeading();
  return (
    <div role="region">
      <HeadingCtx.Provider value={nextLevel}>{children}</HeadingCtx.Provider>
    </div>
  );
}
```

---

### Utilities — `react-heading-manager/utils`

Framework-agnostic DOM parsing and WCAG compliance utilities. Zero React dependency — can run in Node.js, browser, or any test environment with a DOM implementation.

```ts
import {
  drawRegion,
  checkHeadingOrderReport,
  checkHeadingOrder,
  parseHeadingLevel,
  resolveHeadingDetail,
  getRegionIdentifier,
} from "react-heading-manager/utils";
```

#### `drawRegion(root: Element): RegionMapping`

Recursively parses a DOM subtree into a structured `RegionMapping` landmark tree. Recognizes all HTML5 sectioning elements and explicit ARIA landmark roles.

```ts
const regionTree = drawRegion(document.querySelector("main")!);
// { tagName: 'main', headings: ['h1', 'h2'], detailedHeadings: [...], children: [...] }
```

#### `checkHeadingOrderReport(region, initialLevel?): HeadingOrderReport`

Traverses a `RegionMapping` tree and returns a detailed report of all WCAG heading hierarchy violations (skipped levels).

```ts
const report = checkHeadingOrderReport(regionTree);

if (!report.isValid) {
  report.errors.forEach((err) => {
    console.warn(`[${err.path}] ${err.message}`);
    // [root > section] Heading level skipped from H1 to H3
  });
}
```

| Field     | Type                  | Description                                                      |
| --------- | --------------------- | ---------------------------------------------------------------- |
| `isValid` | `boolean`             | `true` if no violations found                                    |
| `errors`  | `HeadingOrderError[]` | Detailed violation records with path, message, text, and element |

#### `checkHeadingOrder(region, currentLevel?): boolean`

Boolean shorthand — returns `true` if the heading hierarchy is fully valid.

#### `parseHeadingLevel(tagName: string): number | null`

Parses `"h1"`–`"h6"` (case-insensitive) into a numeric level. Returns `null` for non-heading tags.

#### `resolveHeadingDetail(element: Element): HeadingDetail`

Extracts structured metadata (`tag`, `text`, `element`) from a heading DOM node.

---

### Testing — `react-heading-manager/testing`

Custom Playwright / Testing Library matcher for end-to-end and integration accessibility auditing.

```ts
import "react-heading-manager/testing";
```

> Importing this module registers `toHaveValidHeadingHierarchy` on Playwright's `expect` via `expect.extend()` as a side effect.

#### `toHaveValidHeadingHierarchy(initialLevel?)`

Audits a `Page` or `Locator` for heading hierarchy violations. Internally uses `drawRegion` + `checkHeadingOrderReport`.

| Parameter      | Type     | Default | Description                                                                 |
| -------------- | -------- | ------- | --------------------------------------------------------------------------- |
| `initialLevel` | `number` | `1`     | Starting heading level. Use `2` for sub-components expected to start at H2. |

**TypeScript augmentation** is automatically included — no additional setup required.

---

## Automated Testing Guide

### Playwright Setup

```ts
// playwright.config.ts
import "react-heading-manager/testing";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // ... your config
});
```

```ts
// tests/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import "react-heading-manager/testing";

test("home page has a valid heading hierarchy", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveValidHeadingHierarchy();
});

test("main content region headings are valid", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.locator("main")).toHaveValidHeadingHierarchy();
});

test("sidebar headings start at H2", async ({ page }) => {
  await page.goto("/");
  // Sidebar is expected to start with H2, not H1
  await expect(page.locator("aside")).toHaveValidHeadingHierarchy(2);
});
```

### Vitest / Integration Testing

```tsx
// src/components/__tests__/my-page.test.tsx
import { render } from "@testing-library/react";
import {
  drawRegion,
  checkHeadingOrderReport,
} from "react-heading-manager/utils";
import { MyPage } from "../MyPage";

test("MyPage heading hierarchy is WCAG compliant", () => {
  const { container } = render(<MyPage />);
  const regionTree = drawRegion(container.firstElementChild as Element);
  const report = checkHeadingOrderReport(regionTree);

  expect(report.isValid).toBe(true);
  expect(report.errors).toHaveLength(0);
});
```

**On failure**, `toHaveValidHeadingHierarchy` produces a detailed diagnostic:

```
Found 2 heading accessibility hierarchy violation(s):

1. Path: root > main > section
   Message: Heading level skipped from H1 to H3
   ("Features") [Selector: section > h3:first-of-type]

2. Path: root > main > aside
   Message: Heading level skipped from H2 to H4
   ("Related Posts") [Selector: aside > h4]
```

---

## Accessibility & Architecture Notes

### How Context Isolation Works

Each landmark component (`<Section>`, `<Article>`, etc.) calls `useHeading()` internally, which reads the current `HeadingCtx` and computes the **next level** using `calculateNextHeadingLevel`. It then renders `HeadingCtx.Provider` with the incremented value, establishing a new context boundary for all children.

```
HeadingCtx (default: 0 → H1)
  └─ <Main>               provides 0 (H1)
       └─ <Section>       reads 0, computes 1, provides 1 (H2)
            └─ <Article>  reads 1, computes 2, provides 2 (H3)
                 └─ <Heading> → renders <h3>
```

This means heading levels are **structurally enforced** by the component tree — it is impossible to accidentally render an `<h3>` after an `<h1>` simply by composing components correctly.

### Why This Matters for Screen Reader Users

Screen readers expose document heading structure as a navigational landmark. Users can jump between headings with keyboard shortcuts (e.g. `H` in NVDA, JAWS). A skipped heading level (H1 → H3) breaks the mental model — a user navigating by heading would experience a gap in the outline, making it impossible to determine whether content was missed.

WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships) requires that structural relationships conveyed visually are also available programmatically. Heading levels are a primary mechanism for communicating document structure to assistive technologies.

### Modular Component Trees

Because heading level is derived from context rather than hardcoded, components are **location-independent**: you can reuse the same `<Card>` component inside a `<Section>` (rendering `<h3>`) or inside an `<Article>` inside a `<Section>` (rendering `<h4>`) without any prop changes.

---

## License

MIT © [Vick Bake](https://github.com/vickbk)

See [LICENSE](./LICENSE) for full text.
