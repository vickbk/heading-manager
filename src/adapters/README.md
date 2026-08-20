# Adapters Layer

The `src/adapters` layer contains environment-specific integrations for consumer runtimes. It translates the pure audit engine into concrete interfaces for React applications and Playwright testing.

---

## Folder Responsibilities

- `src/adapters/react/`: React components, context providers, and hooks
- `src/adapters/playwright/`: Playwright matcher registration and assertion extension

## Dependency Rules

| Allowed imports | Forbidden imports                          |
| --------------- | ------------------------------------------ |
| `src/shared/**` | `src/adapters/**` siblings                 |
| `src/core/**`   | direct framework coupling between adapters |

The boundary is strict:

- React code cannot import Playwright matcher code.
- Playwright code cannot import from the React adapter.
- Both adapters may read from `src/core` and `src/shared`, but nothing on the same layer should cross into a sibling adapter.

---

## Public Adapters

```ts
import { Heading, Main } from "react-heading-manager";
import { registerPlaywright } from "react-heading-manager/testing/playwright";
```

These two public surfaces correspond to the package entry points `.` and `./testing/playwright` respectively, while the shared core engine is exposed via `./utils`.
