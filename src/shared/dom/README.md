# shared/dom

Low-level, framework-agnostic DOM primitives, types, and calculation utilities for managing heading hierarchies and inspecting landmark regions.

---

## Architectural Boundary

- **Layer:** `shared`
- **Dependencies:** Zero external or higher-layer dependencies.
- **Imports:** Must **never** import from `src/core`, `src/adapters`, or `src/main`.
- **Scope:** Pure DOM operations, WAI-ARIA selector maps, and heading depth arithmetic.

---

## Exports & API Reference

### 1. Types (`types.ts`)

#### `HeadingLevel`

Zero-based heading depth index mapping directly to standard HTML heading elements $H1$ through $H6$.

```ts
type HeadingLevel = 0 | 1 | 2 | 3 | 4 | 5;
```

| Index | HTML Mapping | Description                       |
| ----- | ------------ | --------------------------------- |
| `0`   | `<h1>`       | Top-level section or page heading |
| `1`   | `<h2>`       | Sub-section heading               |
| `2`   | `<h3>`       | Sub-sub-section heading           |
| `3`   | `<h4>`       | Sub-component heading             |
| `4`   | `<h5>`       | Low-level item heading            |
| `5`   | `<h6>`       | Maximum allowed depth level       |

---

### 2. Heading Arithmetic (`utils/calculate-heading-level.ts`)

#### `calculateNextHeadingLevel(currentLevel, hasH1)`

Computes the next valid zero-based `HeadingLevel`, ensuring sequential stepping and enforcing depth clamping at index `5` ($H6$).

- **Parameters:**
- `currentLevel: HeadingLevel` — The current 0-based depth context ($0$–$5$).
- `hasH1: boolean` — Indicates whether an $H1$ element already exists within the section or page scope.

- **Returns:** `HeadingLevel`

```ts
import { calculateNextHeadingLevel } from "./utils/calculate-heading-level";

// Initial heading when no H1 exists -> H1 (0)
calculateNextHeadingLevel(0, false); // 0

// Sequential increment when H1 already exists -> H2 (1)
calculateNextHeadingLevel(0, true); // 1

// Enforces maximum depth clamping at H6 (5)
calculateNextHeadingLevel(5, true); // 5
```

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

This module provides the core data structures and calculations required to enforce WCAG Success Criterion 1.3.1 (Info and Relationships):

1. **Sequential Hierarchy:** `calculateNextHeadingLevel` prevents heading levels from skipping numbers (e.g., jumping from $H1$ directly to $H3$).
2. **Landmark Context:** `getRegionIdentifier` ensures assistive technologies properly map heading structures to their surrounding sectioning or ARIA container roles.
