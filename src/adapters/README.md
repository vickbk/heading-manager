# Adapters Architecture & Dependency Policies

The `adapters` directory contains environment-specific integrations, framework components, and testing utilities (e.g., React components like `<Heading>` and `<Main>`, Playwright extensions like `toHaveValidHeadingHierarchy`).

Adapters translate domain rules and engine logic into target ecosystems without leaking framework dependencies across environments.

---

## Folder Responsibilities

Each sub-module inside `adapters/` serves a distinct execution environment:

- **UI Framework Adapters** (e.g., `react`): Provide context providers, hooks, and layout components for UI rendering.
- **Testing & Assertion Adapters** (e.g., `playwright`, `vitest`): Provide custom matchers, setup functions, and runner integrations.

---

## Dependency Rules

| Allowed Imports | Forbidden Imports                                                   |
| :-------------- | :------------------------------------------------------------------ |
| ✅ `shared/*`   | ❌ Sibling `adapters/*` (e.g., `react` importing from `playwright`) |
| ✅ `core/*`     |                                                                     |

### Boundary Guidelines

- **Strict Isolation Between Environments:** Adapters must remain completely decoupled from one another. A consumer using `adapters/react` must never pull in testing frameworks like Playwright or Vitest into their runtime bundle.

---

## Import Examples

```ts
// ✅ VALID: Importing domain logic from core or shared primitives
import { ... } from "../core";
import { ... } from "../shared";

// ❌ FORBIDDEN: Cross-adapter coupling
import { ... } from "../adapters/playwright"; // Never import sibling adapters
```
