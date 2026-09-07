# Core Audit Engine

The `src/core/audit` package contains the framework-agnostic heading hierarchy validation engine used by `react-heading-manager/utils` and higher-level adapters.

---

## Purpose

This module parses DOM section trees, identifies regions and headings, and evaluates whether their progression is consistent with WCAG-oriented heading sequencing heuristics.

## Dependency policy

| Allowed imports                       | Forbidden imports                                      |
| ------------------------------------- | ------------------------------------------------------ |
| `src/shared/**`                       | `src/adapters/**`                                      |
| standard DOM types and pure utilities | any UI framework or runtime-specific test registration |

This layer must remain free of React, Playwright, and other adapter concerns.

---

## Public audit surface

```ts
import {
  checkNormalizedHeading,
  checkNormalizedHeadingReport,
  drawRegion,
  type HeadingDetail,
  type HeadingOrderReport,
  type RegionMapping,
} from "react-heading-manager/utils";
```

### Normalized API

- `drawRegion(element)`: walks a DOM subtree and builds a region tree
- `checkNormalizedHeadingReport({ region })`: returns a structured report for rule violations
- `checkNormalizedHeading({ region })`: convenience boolean check

### Legacy compatibility

The audit engine keeps deprecated helpers such as `checkHeadingOrder` and `checkHeadingOrderReport` available for backwards compatibility, but the normalized API is the recommended path.
Note that these APIs will be removed in the next major release.

---

## Example

```ts
import {
  checkNormalizedHeadingReport,
  drawRegion,
} from "react-heading-manager/utils";

const regionTree = drawRegion(document.body);
const report = checkNormalizedHeadingReport({ region: regionTree });

if (!report.isValid) {
  console.warn(report.errors);
}
```

---

## WCAG interpretation

This engine evaluates structural heading continuity such as `H1 -> H3` jumps and records them as hierarchy issues. It does not depend on a particular framework runtime, and it intentionally keeps the logic isolated from UI binding code.
