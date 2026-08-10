# `src/utils`

Low-level DOM parsing and WCAG heading hierarchy validation utilities. These functions are framework-agnostic and can run in any JavaScript environment (browser, Node.js, or test runners with a DOM implementation).

Accessible via the `utils` subpath export:

```ts
import { drawRegion, checkHeadingOrderReport } from 'heading-manager/utils';
```

---

## Exports

| Export | Description |
|---|---|
| `drawRegion` | Recursively parses a DOM subtree into a structured `RegionMapping` tree |
| `checkHeadingOrderReport` | Validates a `RegionMapping` tree and returns a detailed violation report |
| `checkHeadingOrder` | Boolean shorthand — returns `true` if the hierarchy is valid |
| `getRegionIdentifier` | Resolves a human-readable label for a landmark region element |
| `calculateNextHeadingLevel` | Increments a 0-based `HeadingLevel` index (clamped to H6) |
| `parseHeadingLevel` | Parses an `<h*>` tag name string into a numeric level (1–6) |
| `resolveHeadingDetail` | Extracts heading text and element selector from a DOM element |

---

## `drawRegion(root)`

```ts
function drawRegion(root: Element): RegionMapping
```

Performs a recursive depth-first walk of `root` and builds a `RegionMapping` tree. Landmark elements (`<main>`, `<section>`, `<article>`, `<aside>`, `<nav>`, `<header>`, `<footer>`, and elements with explicit `role="region"` etc.) become child nodes in the tree.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `root` | `Element` | The root DOM element to traverse |

### Returns

`RegionMapping` — a nested tree describing landmark boundaries and heading sequences.

### Example

```ts
import { drawRegion } from 'heading-manager/utils';

const container = document.querySelector('main')!;
const regionTree = drawRegion(container);
// { label: 'main', headings: ['h1', 'h2'], children: [...] }
```

---

## `checkHeadingOrderReport(region, initialLevel?)`

```ts
function checkHeadingOrderReport(
  region: RegionMapping,
  initialLevel?: number
): HeadingOrderReport
```

Traverses a `RegionMapping` tree and collects all WCAG heading hierarchy violations — specifically **skipped heading levels** (e.g., H1 → H3 without an intermediate H2).

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `region` | `RegionMapping` | — | Root region mapping from `drawRegion` |
| `initialLevel` | `number` | `1` | Starting heading level context (useful for auditing sub-components) |

### Returns

`HeadingOrderReport`:

```ts
{
  isValid: boolean;
  errors: HeadingOrderError[];
}
```

Each `HeadingOrderError` contains:

| Field | Type | Description |
|---|---|---|
| `path` | `string` | Breadcrumb path to the violating region (e.g., `"root > section"`) |
| `message` | `string` | Human-readable description of the violation |
| `text` | `string \| undefined` | Heading text content (if available) |
| `element` | `string \| undefined` | CSS selector of the violating element |

### Example

```ts
import { drawRegion, checkHeadingOrderReport } from 'heading-manager/utils';

const regionTree = drawRegion(document.body);
const report = checkHeadingOrderReport(regionTree);

if (!report.isValid) {
  report.errors.forEach(err => console.warn(err.message));
}
```

---

## `checkHeadingOrder(region, currentLevel?)`

```ts
function checkHeadingOrder(region: RegionMapping, currentLevel?: number): boolean
```

Boolean shorthand of `checkHeadingOrderReport`. Returns `true` if the entire heading hierarchy is valid, `false` otherwise. Prefer `checkHeadingOrderReport` when you need error details.

---

## `getRegionIdentifier(element)`

```ts
function getRegionIdentifier(element: Element): string
```

Resolves a human-readable label for a landmark element by checking, in priority order:

1. `aria-label` attribute
2. Text of the element referenced by `aria-labelledby`
3. The element's tag name (as a fallback)

### Example

```ts
import { getRegionIdentifier } from 'heading-manager/utils';

const label = getRegionIdentifier(document.querySelector('section[aria-label="Blog"]')!);
// → "Blog"
```

---

## `calculateNextHeadingLevel(current, hasH1?)`

```ts
function calculateNextHeadingLevel(current: HeadingLevel, hasH1?: boolean): HeadingLevel
```

Increments a 0-based `HeadingLevel` index by 1, clamped to `5` (H6). Used internally by `useHeading`.

---

## `parseHeadingLevel(tagName)`

```ts
function parseHeadingLevel(tagName: string): number | null
```

Parses an HTML heading tag string (`"h1"`–`"h6"`, case-insensitive) into a numeric level. Returns `null` for non-heading tags.

---

## `resolveHeadingDetail(element)`

```ts
function resolveHeadingDetail(element: Element): HeadingDetail
```

Extracts structured metadata from a heading DOM element:

| Field | Type | Description |
|---|---|---|
| `tag` | `string` | HTML tag name (e.g., `"h2"`) |
| `text` | `string` | Text content of the heading element |
| `element` | `string` | CSS selector for the element |

---

## LANDMARK_SELECTOR

An internal CSS selector string used by `drawRegion` to detect landmark boundary elements. Combines native HTML sectioning elements with explicit ARIA landmark roles:

```
main, section, article, aside, nav, header, footer,
[role="main"], [role="region"], [role="article"],
[role="complementary"], [role="navigation"],
[role="banner"], [role="contentinfo"]
```

---

## Accessibility Notes

- **WCAG 2.1 SC 1.3.1 (Info and Relationships):** `checkHeadingOrderReport` directly tests for heading level skip violations, which screen reader users rely on to navigate document structure efficiently.
- `drawRegion` mirrors the accessibility tree's landmark structure — each node corresponds to a distinct navigable region.
- These utilities operate on the live DOM and are designed for both runtime auditing and test-time assertions.

---

## Related

- [`src/__testing__`](../__testing__/README.md) — Playwright matcher that consumes these utilities
- [`src/types.ts`](../types.ts) — `RegionMapping`, `HeadingOrderReport`, `HeadingOrderError`, `HeadingDetail` types
- [`src/components`](../components/README.md) — React components that produce the DOM these utilities audit
