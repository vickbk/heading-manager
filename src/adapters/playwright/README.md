# Playwright Adapter

The Playwright adapter adds `toHaveValidHeadingHierarchy` to the Playwright `expect` assertion API without relying on side-effectful top-level imports. The matcher is registered explicitly using `registerPlaywright`, making it tree-shakable, bundler-safe, and compatible with isolated or multi-project Playwright setups.

---

## Installation & Setup

Register the custom matcher once in your global setup file or spec helper:

```ts
import { expect } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

// Register custom matchers on the default expect instance
registerPlaywright(expect);
```

To target a custom or extended `expect` instance, pass it directly to `registerPlaywright`:

```ts
import { expect as baseExpect } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

const customExpect = baseExpect.extend({
  /* other matchers */
});

registerPlaywright(customExpect);
```

---

## API Reference

### `registerPlaywright(customExpect?)`

Extends a Playwright `expect` instance with `react-heading-manager` assertion matchers.

```ts
registerPlaywright(customExpect = expect): void

```

| Parameter      | Type            | Default  | Description                                                      |
| -------------- | --------------- | -------- | ---------------------------------------------------------------- |
| `customExpect` | `typeof expect` | `expect` | Playwright `expect` instance to augment with heading assertions. |

---

### `toHaveValidHeadingHierarchy(initialLevel?: InitialHeading)`

Audits the DOM tree of a Playwright `Page` or `Locator`, parses sectioning regions (`drawRegion`), and validates that heading progression complies with WCAG 2.1 SC 1.3.1 without skipped levels (e.g. `<h1>` → `<h3>`).

```ts
await expect(page).toHaveValidHeadingHierarchy(initialLevel?: InitialHeading): Promise<R>

```

| Parameter      | Type | Default | Description |
| -------------- | ---- | ------- | ----------- | --- | --- | --- | --- | ----------------------------------------------------------------------------- |
| `initialLevel` | `1   | 2       | 3           | 4   | 5   | 6`  | `1` | Ambient starting heading level index (`1` for `<h1>` through `6` for `<h6>`). |

#### Behavior

- Extracts the `outerHTML` of the target `Page` or `Locator`.
- Builds a semantic region tree using `drawRegion`.
- Evaluates heading levels against normalized WCAG rules via `checkNormalizedHeadingReport`.
- Supports custom hierarchy contexts (e.g., set `initialLevel = 2` when auditing an isolated component expected to sit inside an outer `<h2>` landmark).

---

## Usage Examples

### Audit an Entire Page

```ts
import { expect, test } from "@playwright/test";
import { registerPlaywright } from "react-heading-manager/testing/playwright";

registerPlaywright(expect);

test("page contains a valid WCAG heading hierarchy", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveValidHeadingHierarchy();
});
```

### Audit a Specific Landmark Container

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

test("sidebar card component headings start at H2", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("aside.sidebar")).toHaveValidHeadingHierarchy(2);
});
```

---

## Diagnostic Violation Output

When hierarchy errors are detected, the matcher produces a structured report detailing each violation:

```text
Found 2 heading accessibility hierarchy violation(s):

1. Path: root > main > section
   Message: Heading level skipped from H1 to H3
   ("Features") [Selector: section > h3:first-of-type]

2. Path: root > main > aside
   Message: Heading level skipped from H2 to H4
   ("Related Posts") [Selector: aside > h4]

```

Each diagnostic entry provides:

- **Path:** The structural DOM/region hierarchy path where the violation occurred.
- **Message:** Description of the WCAG level sequence jump.
- **Text Snippet:** Inner text content of the offending heading element.
- **Selector:** DOM selector pointing to the target heading node.
