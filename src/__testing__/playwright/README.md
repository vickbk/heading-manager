# Playwright Adapter

The Playwright adapter adds `toHaveValidHeadingHierarchy` to the Playwright `expect` API without relying on a side-effectful top-level import. The matcher is registered explicitly through the `registerPlaywright` initializer, which makes it safe for bundlers and easy to use in isolated or multi-project Playwright setups.

---

## Installation and Setup

```ts
import { expect } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

// Register the custom matcher
registerPlaywright(expect);
```

This binds `toHaveValidHeadingHierarchy` to the provided Playwright `expect` instance. If you want to target a custom instance rather than the default global `expect`, pass that instance into `registerPlaywright(customExpect)`.

```ts
import { expect as baseExpect } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

const customExpect = baseExpect;
registerPlaywright(customExpect);
```

---

## API Reference

### `registerPlaywright(customExpect?)`

Registers the matcher on a Playwright `expect` object.

```ts
registerPlaywright(customExpect = expect): void
```

Parameters:

- `customExpect` (optional): A Playwright `expect` instance to augment. When omitted, the default imported `expect` from `@playwright/test` is used.

Use this when:

- You want explicit initialization in a config or test file.
- You are working in isolated or multi-project Playwright setups.
- You want to avoid implicit side-effect registration and tree-shaking issues.

### `toHaveValidHeadingHierarchy(initialLevel?: number)`

The matcher audits a Playwright `Page` or `Locator` and checks whether heading levels are sequential without skipping values.

```ts
await expect(page).toHaveValidHeadingHierarchy();
await expect(page.locator("main[role='main']")).toHaveValidHeadingHierarchy(2);
```

Behavior:

- Targets a `Page` or `Locator`.
- Uses the DOM from the selected element and validates the heading structure.
- Defaults to `initialLevel = 1` when no explicit value is provided.
- Supports custom hierarchy contexts, for example when a component is expected to begin at H2 instead of H1.

---

## Usage Examples

### Audit an Entire Page

```ts
import { expect, test } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);

test("page has a valid heading hierarchy", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveValidHeadingHierarchy();
});
```

### Audit a Specific Landmark or Container

```ts
import { expect, test } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);

test("main section headings are valid", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.locator("main")).toHaveValidHeadingHierarchy();
});
```

### Audit a Sub-Component Starting at H2

```ts
import { expect, test } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);

test("sidebar headings start at H2", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("aside")).toHaveValidHeadingHierarchy(2);
});
```

---

## Failure Output

When the hierarchy is invalid, the matcher returns a numbered diagnostic describing each violation.

```text
Found 2 heading accessibility hierarchy violation(s):

1. Path: root > main > section
   Message: Heading level skipped from H1 to H3
   ("Features") [Selector: section > h3:first-of-type]

2. Path: root > main > aside
   Message: Heading level skipped from H2 to H4
   ("Related Posts") [Selector: aside > h4]
```

The output includes:

- the violation path
- the descriptive error message
- the offending heading text, when available
- the selector for the failing element

---

## TypeScript Setup and Matchers Augmentation

The adapter augments Playwright's matcher typings so TypeScript understands the custom assertion on the `expect` instance.

```ts
import { expect } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);

await expect(page).toHaveValidHeadingHierarchy();
```

This is implemented with the Playwright augmentation pattern for `PlaywrightTest.Matchers<R, T = {}>`, so autocompletion and type checking work for the extended matcher API without requiring a side-effect import.

---

## Related

- [../README.md](../README.md) — testing architecture overview and adapter index
- [../../utils/README.md](../../utils/README.md) — DOM parsing and heading-order validation utilities
