# Core Architecture & Dependency Policies

The `core` directory contains primary parsing logic, and WCAG evaluation rule sets.

Code in this directory must remain completely isolated from any UI framework, test runner, or platform-specific runtime.

---

## Dependency Rules

| Allowed Imports | Forbidden Imports           |
| :-------------- | :-------------------------- |
| ✅ `shared/*`   | ❌ `adapters/*`             |
|                 | ❌ Sibling `core/*` modules |

---

## Boundary Guidelines

1. **Framework Agnostic:** Core code must never reference React, Playwright, Vitest, or any runtime environment APIs.
2. **Strict Encapsulation:** Core sub-modules cannot depend on sibling core modules. If code needs to be shared across multiple core modules, move it to `shared/`.

---

## Import Examples

```ts
// ✅ VALID: Importing from shared primitives or utilities
import { ... } from "../shared";

// ❌ FORBIDDEN: Depending on an adapter environment
import { ... } from "../adapters/react";

// ❌ FORBIDDEN: Depending on sibling core modules
import { ... } from "../core/other-module";
```
