# core/auditor

DOM parsing and structural evaluation engine designed to construct region maps of HTML5 sectioning landmarks and audit sequential heading hierarchy logic.

---

## Architecture & Design Principles

### 1. Auditing Heuristics vs. WCAG Conformance

This module evaluates **sequential heading hierarchy rules** (e.g., detecting level jumps like `H1` $\rightarrow$ `H3`).

- **WCAG SC 1.3.1 (Info and Relationships):** Requires visual structure to be programmatically determinable.
- **Advisory Technique G141:** Recommends sequential heading progression without level skipping.
- **Interpretation:** Level skipping is reported as a structural hierarchy issue according to auditing heuristics. It is **not** framed as a direct normative WCAG failure.

### 2. HTML (`H1`–`H6`) vs. ARIA (`aria-level`) Range

- **Legacy API (`checkHeadingOrderReport`):** Clamps heading levels strictly to levels 1 through 6 (`<h1>`–`<h6>`) and flags levels above `H6` as invalid.
- **Normalized API (`checkNormalizedHeadingReport`):** Preserves arbitrary positive integers ($1 \dots N$) per the WAI-ARIA 1.2 specification for `aria-level`. For instance, an `H6` $\rightarrow$ `H7` transition is evaluated as valid sequential progression.

---

## API Reference

### Primary API (Normalized)

#### `checkNormalizedHeadingReport(params?)`

Recursively audits a `RegionMapping` tree using pre-parsed numeric levels (`HeadingDetail.numLevel`).

- **Parameters:** `params?: Partial<ProcessHeadingLevelParams>`
- **Returns:** `HeadingOrderReport`

```ts
import {
  checkNormalizedHeadingReport,
  drawRegion,
} from "@/src/core/heading-auditor";

const regionTree = drawRegion(document.body);
const report = checkNormalizedHeadingReport({ region: regionTree });

if (!report.isValid) {
  console.warn("Heading hierarchy issues detected:", report.errors);
}
```

#### `checkNormalizedHeading(params)`

Convenience function returning a boolean pass/fail status for normalized heading order checks.

- **Parameters:** `params: Partial<ProcessHeadingLevelParams>`
- **Returns:** `boolean`

```ts
const isValid = checkNormalizedHeading({ region: regionTree });
```

#### `drawRegion(element)`

Recursively parses a DOM container to build a `RegionMapping` tree representing landmark scopes and direct child headings.

- **Parameters:** `element: Element`
- **Returns:** `RegionMapping`

---

## Migration Guide

If you are using the deprecated legacy API, update your import paths and method signatures to use the normalized pipeline:

| Deprecated Method                 | Modern Replacement                         | Key Difference                                            |
| --------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| `checkHeadingOrderReport(region)` | `checkNormalizedHeadingReport({ region })` | Operates on pre-parsed numbers; supports $H7+$ levels     |
| `checkHeadingOrder(region)`       | `checkNormalizedHeading({ region })`       | Accepts object options context; avoids argument ambiguity |
| `processHeadingLevel(params)`     | `processNormalizedHeadingLevel(params)`    | Does not clamp levels to H1–H6                            |

### Code Migration Example

```ts
// ❌ Deprecated Legacy Usage
import { checkHeadingOrderReport } from "@/src/core/heading-auditor";
const report = checkHeadingOrderReport(regionTree);

// ✅ Recommended Normalized Usage
import { checkNormalizedHeadingReport } from "@/src/core/heading-auditor";
const report = checkNormalizedHeadingReport({ region: regionTree });
```

---

## Data Structures

### `HeadingOrderReport`

```ts
export type HeadingOrderReport = {
  isValid: boolean;
  errors: HeadingOrderError[];
};
```

### `HeadingOrderError`

```ts
export type HeadingOrderError = {
  path: string; // Breadcrumb path (e.g. "main[0] > section[1]")
  tagName: string; // Containing landmark tag
  heading: string; // Heading descriptor (e.g. "h3")
  text?: string; // Accessible heading label
  element?: unknown; // Reference to DOM node
  actualLevel: number; // Numeric level found (e.g. 3)
  expectedMaxLevel: number; // Expected baseline limit (e.g. 2)
  message: string; // Human-readable summary
};
```

---

## Execution Pipeline

```text
drawRegion(document.body)
  │
  ├──► getRegionHeadings()
  │      └── getHeadingLevel() ──► Normalizes native H1-H6 / ARIA aria-level
  │
  ▼
checkNormalizedHeadingReport({ region })
  │
  ├──► processNormalizedHeadingLevel()
  │      ├── Validates sequential progression (numLevel <= runningLevel + 1)
  │      └── Collects HeadingOrderError records
  │
  └──► Recursively audits child regions

```
