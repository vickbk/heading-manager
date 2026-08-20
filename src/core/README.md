# Core Layer

The `src/core` layer contains the pure WCAG heading-audit engine and DOM structure analysis routines. It is intentionally framework-agnostic and must not depend on React, Playwright, browsers, or application state.

---

## Scope

- `src/core/audit/`: semantic DOM region parsing and heading-sequence validation logic
- `src/core` public surface: re-export aggregation for the engine layer
- Relationship to the rest of the package: the core layer may only depend on `src/shared`

## Dependency Rules

| Allowed imports                                                                            | Forbidden imports                                                                                              |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `src/shared/**`                                                                            | `src/adapters/**`                                                                                              |
| `src/core/**` only via leaf-level utilities when explicitly needed by the package boundary | sibling `src/core/**` modules that should instead be promoted to `shared` or factored into a dedicated utility |

The architecture enforces a single dependency direction:

`shared -> core -> adapters -> main`

### Boundaries

- `shared/` is the only foundational dependency layer for core logic.
- `core/` must remain free of DOM runtime coupling and framework integrations.
- `adapters/` translate engine results into React or Playwright-specific APIs.
- `main/` is a pure re-export router and contains no business logic.

---

## Primary API

```ts
import {
  checkNormalizedHeading,
  checkNormalizedHeadingReport,
  drawRegion,
} from "react-heading-manager/utils";
```

The engine is used to:

- parse a region tree from DOM elements
- inspect heading depth and section trees
- report WCAG-related sequencing violations without browser-only assumptions

---

## Rules for Contributors

- Keep the core package environment-neutral.
- Prefer pure values and typed data structures over runtime side effects.
- If logic is reused across multiple adapters or core modules, move it into `src/shared`.
- Do not re-export adapter-specific utilities from this layer.
