# core/auditor/modules/region

DOM parsing engine responsible for discovering HTML5 sectioning landmarks, resolving ARIA roles, and mapping structural region trees with associated heading metadata.

---

## Architectural Boundary

- **Layer:** `core` (`auditor/modules` sub-domain)
- **Dependencies:** `src/shared/dom`
- **Imports:** May import from `src/shared`. Must **never** import from `src/adapters` or `src/main`.
- **Scope:** Structural DOM element traversal, WAI-ARIA role resolution, and sectioning hierarchy tree construction.

---

## Exports & API Reference

### 1. Types (`types.ts`)

#### `HeadingDetail`

Metadata descriptor capturing information for an individual heading discovered during DOM auditing.

```ts
export type HeadingDetail = {
  level: string; // e.g. "h1", "h2"
  numLevel: number; // e.g. 1, 2
  text: string; // Accessible heading text content
  element?: unknown; // Reference to underlying DOM node
};
```

#### `RegionMapping`

Recursive tree structure representing HTML5 sectioning landmarks or ARIA regions and their nested child regions.

```ts
export type RegionMapping = {
  tagName: string;
  headings: string[];
  detailedHeadings: HeadingDetail[];
  children: RegionMapping[];
};
```

---

### 2. Traversal & Region Mapping (`utils/draw-region.ts`)

#### `drawRegion(element)`

Recursively parses a DOM element subtree and builds a complete `RegionMapping` tree.

- **Parameters:**
- `element: T extends Element` — The root DOM container element to inspect.

- **Returns:** `RegionMapping`

```ts
import { drawRegion } from "./utils/draw-region";

const regionTree = drawRegion(document.body);
console.log(regionTree.tagName); // "body"
console.log(regionTree.children); // Array of direct child landmark regions
```

---

### 3. Heading Extraction & Level Normalization (`utils/`)

#### `getRegionHeadings(element)`

Extracts headings belonging **directly** to a specific landmark scope, excluding headings nested inside deeper child landmarks.

#### `getHeadingLevel(heading)`

Resolves the canonical numeric heading level for any heading element according to WAI-ARIA 1.2 rules:

1. Explicit positive integer in `aria-level` attribute.
2. Native tag name (`<h1>`–`<h6>`).
3. Default level `"2"` for standalone `role="heading"` elements lacking `aria-level`.

---

## Execution Flow

```text
drawRegion(element)
 ├── getRegionIdentifier(element)        (from shared/dom)
 ├── getRegionHeadings(element)
 │    └── getHeadingLevel(heading)       (resolves native / ARIA levels)
 └── [Query child landmarks]
      └── drawRegion(childElement)       (recursive)

```
