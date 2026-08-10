# `src/__testing__`

Custom Playwright assertion matchers and testing infrastructure for auditing heading accessibility in end-to-end tests. This module extends Playwright's `expect` API with a `toHaveValidHeadingHierarchy` matcher.

---

## Exports

| Export                        | Type               | Description                                                               |
| ----------------------------- | ------------------ | ------------------------------------------------------------------------- |
| `toHaveValidHeadingHierarchy` | Playwright Matcher | Audits the heading hierarchy of a `Page` or `Locator` for WCAG violations |

---

## Setup

Import this module once in your Playwright configuration to register the custom matcher globally:

```ts
// playwright.config.ts or a global setup file
import "react-heading-manager/testing";
```

Or register it in a specific test file:

```ts
import "react-heading-manager/testing";
import { test, expect } from "@playwright/test";

test("heading hierarchy is valid", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveValidHeadingHierarchy();
});
```

> [!NOTE]
> The matcher is registered via `expect.extend()` inside `evaluator.ts`, which is side-effectfully imported by the barrel `index.ts`.

---

## `toHaveValidHeadingHierarchy(initialLevel?)`

```ts
toHaveValidHeadingHierarchy(initialLevel?: number): Promise<void>
```

Audits the heading hierarchy of a Playwright `Page` or `Locator` by:

1. Extracting the outer HTML of the target element.
2. Parsing it with `happy-dom`'s `DOMParser`.
3. Building a `RegionMapping` tree using `drawRegion`.
4. Validating the tree with `checkHeadingOrderReport`.

### Parameters

| Parameter      | Type     | Default | Description                                                                                    |
| -------------- | -------- | ------- | ---------------------------------------------------------------------------------------------- |
| `initialLevel` | `number` | `1`     | Starting heading level context. Use `2` when auditing a sub-component expected to start at H2. |

### Pass Condition

The assertion **passes** when `checkHeadingOrderReport` returns `{ isValid: true }` — i.e., no heading levels are skipped.

### Failure Output

On failure, the assertion reports all violations with:

- **Path:** Breadcrumb from root to the violating region (e.g., `root > main > section`)
- **Message:** Human-readable description of the violation
- **Text:** The heading text content (if available)
- **Selector:** CSS selector of the violating element

Example failure message:

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

## Usage Examples

### Audit an Entire Page

```ts
test("page has valid heading hierarchy", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveValidHeadingHierarchy();
});
```

### Audit a Specific Container

```ts
test("main content has valid headings", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toHaveValidHeadingHierarchy();
});
```

### Audit a Sub-Component Starting at H2

```ts
test("sidebar headings are valid starting at H2", async ({ page }) => {
  await page.goto("/");
  // The sidebar is expected to start with H2 (not H1)
  await expect(page.locator("aside")).toHaveValidHeadingHierarchy(2);
});
```

---

## Internal Structure

| File                                                                                         | Description                                              |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [`evaluator.ts`](./evaluator.ts)                                                             | Registers the matcher via `expect.extend()`              |
| [`helpers/to-have-valid-heading-hierarchy.ts`](./helpers/to-have-valid-heading-hierarchy.ts) | Core matcher implementation                              |
| [`types.d.ts`](./types.d.ts)                                                                 | TypeScript augmentation for `PlaywrightTest.Matchers<R>` |
| [`index.ts`](./index.ts)                                                                     | Barrel export — side-effectfully imports `evaluator.ts`  |
| [`vitest.setup.ts`](./vitest.setup.ts)                                                       | Vitest setup integration                                 |

---

## Accessibility Notes

- **WCAG 2.1 SC 1.3.1 (Info and Relationships):** This matcher directly validates that heading levels are sequential and non-skipping, a key requirement for screen reader navigation.
- **WCAG 2.1 SC 2.4.6 (Headings and Labels):** Although this matcher does not validate heading _content_, it helps ensure the structural foundation for labelled regions is correct.
- Uses `happy-dom` for DOM parsing — no browser launch required for the heading audit logic itself (the DOM is parsed from serialized HTML).

---

## Related

- [`src/utils`](../utils/README.md) — `drawRegion` and `checkHeadingOrderReport` that power this matcher
- [`src/types.ts`](../types.ts) — `HeadingOrderReport` and `HeadingOrderError` types
