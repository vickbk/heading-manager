# src/shared

Foundational primitives, domain types, and pure utilities used across `react-heading-manager`.

---

## Architectural Principles & Layer Boundaries

The `shared` directory represents the lowest foundation layer in the project's architecture. All code placed within this layer must strictly adhere to the following rules:

### 1. Zero Outer-Layer Dependencies

- **Rule:** Modules inside `shared` must **never** import from `src/core`, `src/adapters`, or `src/main`.
- **Enforcement:** ESLint boundary rules (`eslint-plugin-boundaries`) flag any import attempting to pull logic from higher layers as a fatal error.

### 2. Framework & Environment Agnostic

- **Rule:** All utilities must consist of pure TypeScript or standard Web API / DOM primitives.
- **Prohibitions:** Do not include React components, React hooks, Playwright/testing helpers, or framework-specific state.

### 3. Self-Contained & Deterministic

- **Rule:** Primitives must be self-contained and free of external side effects.
- **Scope:** If a helper function or type is only needed by a single core feature or adapter, place it inside that specific module instead of `shared`.

---

## Directory Overview

```text
src/shared/
├── dom/                      # Low-level DOM primitives & depth arithmetic
│   ├── types.ts              # HeadingLevel type (0..5)
│   ├── utils/
│   │   ├── calculate-heading-level.ts
│   │   └── get-region-identifier.ts
│   └── README.md             # Sub-module documentation
├── index.ts                  # Consolidated public exports for shared primitives
└── README.md                 # Layer architectural specification

```

---

## Sub-Modules

- **[`dom/`](https://www.google.com/search?q=./dom/README.md)**: Pure DOM primitives, WAI-ARIA landmark CSS selectors, and zero-indexed heading depth arithmetic ($H1$–$H6$).

---

## Checklist for Adding New Shared Primitives

- [ ] Does the proposed utility have **zero dependencies** on higher layers (`core`, `adapters`, `main`)?
- [ ] Is it environment-agnostic (pure TS/DOM without React or test framework couplings)?
- [ ] Is it actually shared across multiple boundaries, or does it belong inside `src/core/`?
- [ ] Does every exported symbol include standard TSDoc tags (`@param`, `@returns`, `@example`, `@remarks`)?
