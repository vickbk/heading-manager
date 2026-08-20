# Playwright Adapter

The Playwright adapter exposes a side-effect-free matcher registration flow for `react-heading-manager`. It is intentionally explicit: call `registerPlaywright(expect)` once in setup code, then use `toHaveValidHeadingHierarchy` against `Page` or `Locator` objects.

---

## Dependency Rules

| Allowed imports | Forbidden imports             |
| --------------- | ----------------------------- |
| `src/core/**`   | `src/adapters/!playwright/**` |
| `src/shared/**` | sibling adapter modules       |

The adapter may read the core engine and shared primitives, but it must not pull in React rendering concerns or other adapter implementations.

---

## Installation and setup

```ts
import { expect } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);
```

You can also pass a custom `expect` instance:

```ts
import { expect as baseExpect } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

const customExpect = baseExpect.extend({});
registerPlaywright(customExpect);
```

---

## API

### `registerPlaywright(customExpect?)`

Adds the matcher to an existing Playwright `expect` instance.

```ts
registerPlaywright(customExpect = expect): void
```

### `toHaveValidHeadingHierarchy(initialLevel?: InitialHeading)`

Audits a `Page` or `Locator` for skipped heading levels and structural WCAG issues without requiring a React runtime.

```ts
await expect(page).toHaveValidHeadingHierarchy();
await expect(page.locator("main")).toHaveValidHeadingHierarchy(2);
```

`initialLevel` is a 1-based heading context, ranging from `1` for `<h1>` going up.

---

## Usage examples

```ts
import { expect, test } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);

test("page has a valid heading hierarchy", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveValidHeadingHierarchy();
});
```

```ts
import { expect, test } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);

test("sidebar content starts at H2", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("aside.sidebar")).toHaveValidHeadingHierarchy(2);
});
```

---

## Diagnostic output

When a violation is found, the matcher returns a descriptive human-readable report:

```text
Found 2 heading accessibility hierarchy violation(s):

1. Path: root > main > section
   Message: Heading level skipped from H1 to H3
   ("Features") [Selector: section > h3:first-of-type]

2. Path: root > main > aside
   Message: Heading level skipped from H2 to H4
   ("Related Posts") [Selector: aside > h4]
```
