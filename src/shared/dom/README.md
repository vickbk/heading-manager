# shared/dom

Low-level, framework-agnostic DOM primitives, types, and calculation utilities for managing heading hierarchies and inspecting landmark regions.

---

## Architectural Boundary

- **Layer:** `shared`
- **Dependencies:** Zero external or higher-layer dependencies.
- **Imports:** Must **never** import from `src/core`, `src/adapters`, or `src/main`.
- **Scope:** Pure DOM operations, WAI-ARIA selector maps, heading-level normalization, and heading depth arithmetic.

---

## Exports & API Reference

### 1. Types (`types.ts`)

#### `HeadingLevel`

> **Deprecated:** `HeadingLevel` only represents the native HTML heading range (`H1`–`H6`) and should no longer be used as the canonical representation of heading levels.

> Use `number` for normalized heading levels instead. Normalized levels may extend beyond `5` when H6 clamping is disabled.

```ts
/** @deprecated Use `number` for normalized heading levels. */
type HeadingLevel = 0 | 1 | 2 | 3 | 4 | 5;
```

The zero-based normalized representation maps to native HTML headings as follows:

| Normalized level | Native HTML heading   |
| ---------------- | --------------------- |
| `0`              | `<h1>`                |
| `1`              | `<h2>`                |
| `2`              | `<h3>`                |
| `3`              | `<h4>`                |
| `4`              | `<h5>`                |
| `5`              | `<h6>`                |
| `6`              | `<h6 aria-level="7">` |
| `7`              | `<h6 aria-level="8">` |
| ...              | `<h6 aria-level="N">` |

Normalized levels greater than `5` represent heading levels beyond the native HTML `<h6>` boundary. They are preserved by the heading hierarchy engine and may be represented using an `<h6>` element with an explicit ARIA level.

---

### 2. Heading Arithmetic (`utils/calculate-heading-level.ts`)

#### `calculateNextHeadingLevel(currentLevel, hasH1, h6Clamp)`

Calculates the next zero-based normalized heading level from the current heading context.

The helper supports two heading-depth policies:

- **Clamped mode:** prevents the normalized level from advancing beyond `5` (`H6`).
- **Unclamped mode:** allows normalized heading levels to continue beyond `5` (`H7`, `H8`, etc.).

#### Parameters

- `currentLevel: number` — Current zero-based normalized heading level.
- `hasH1: boolean` — Indicates whether an `H1` already exists in the current section or page scope.
- `h6Clamp?: boolean` — Whether to clamp the result at normalized level `5` (`H6`). Defaults to `true`.

#### Returns

`number` — The next zero-based normalized heading level.

```ts
import { calculateNextHeadingLevel } from "./utils/calculate-heading-level";

// Initial heading when no H1 exists -> H1 (0)
calculateNextHeadingLevel(0, false); // 0

// Sequential increment -> H2 (1)
calculateNextHeadingLevel(0, true); // 1

// Default behavior clamps at H6
calculateNextHeadingLevel(5, true); // 5

// Explicitly enabled clamping
calculateNextHeadingLevel(5, true, true); // 5

// Disabled clamping allows H7
calculateNextHeadingLevel(5, true, false); // 6

// Further levels remain available when unclamped
calculateNextHeadingLevel(6, true, false); // 7
```

#### H6 Clamping

`h6Clamp` is intentionally configurable because different applications may prefer different heading representation strategies.

```ts
// Clamp normalized hierarchy at H6
calculateNextHeadingLevel(5, true, true); // 5

// Preserve the actual normalized hierarchy
calculateNextHeadingLevel(5, true, false); // 6
```

When clamping is disabled, consumers that render the normalized level as HTML should represent levels greater than H6 using an appropriate ARIA heading level rather than attempting to render non-existent native elements such as `<h7>`.

---

### 3. Region & Landmark Inspection (`utils/get-region-identifier.ts`)

#### `LANDMARK_SELECTOR`

A combined CSS selector matching standard HTML5 sectioning elements (`main`, `header`, `footer`, `nav`, `aside`, `section`, `article`, `legend`) and explicit WAI-ARIA landmark roles (`role="main"`, `role="navigation"`, etc.).

```ts
import { LANDMARK_SELECTOR } from "./utils/get-region-identifier";

const landmarks = document.querySelectorAll(LANDMARK_SELECTOR);
```

#### `getRegionIdentifier(element)`

Resolves a unique selector string for a DOM element, giving priority to explicit `role` attributes over native container tag names.

- **Parameters:**

- `element: Element` — The target DOM element.

- **Returns:** `string` (e.g., `div[role="navigation"]` or `section`)

```ts
import { getRegionIdentifier } from "./utils/get-region-identifier";

const nav = document.createElement("div");
nav.setAttribute("role", "navigation");

getRegionIdentifier(nav); // "div[role=\"navigation\"]"

const section = document.createElement("section");

getRegionIdentifier(section); // "section"
```

---

## Accessibility Rationale (WCAG 2.1 SC 1.3.1)

This module provides framework-agnostic primitives for maintaining and auditing logical heading and landmark structure:

1. **Heading hierarchy:** `calculateNextHeadingLevel` advances normalized heading levels sequentially and optionally prevents progression beyond H6.
2. **Normalized levels:** Heading levels are represented numerically so the logical hierarchy can be preserved even when it extends beyond the native HTML H1–H6 range.
3. **Native HTML representation:** Levels beyond H6 can be represented through an H6 element with an explicit ARIA heading level.
4. **Landmark context:** `getRegionIdentifier` identifies the surrounding HTML or ARIA landmark context used when constructing and auditing heading hierarchies.

> **Note:** Sequential heading levels are an accessibility-oriented structural heuristic. A skipped heading level is not, by itself, a direct WCAG 2.1 SC 1.3.1 conformance failure in every document context.
