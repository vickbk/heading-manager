# `src/hooks`

React Context and custom hooks that power the automatic heading level management system. These are low-level primitives used internally by landmark components — you typically consume them only when building custom region wrappers.

---

## Exports

| Export       | Type                          | Description                                               |
| ------------ | ----------------------------- | --------------------------------------------------------- |
| `HeadingCtx` | `React.Context<HeadingLevel>` | Context storing the current 0-based heading level index   |
| `useHeading` | Custom Hook                   | Computes the next heading level index for a nested region |

---

## `HeadingCtx`

```ts
const HeadingCtx: React.Context<HeadingLevel>;
```

A `React.Context` that carries the **current 0-based heading level index** (`HeadingLevel`):

| Context Value | Rendered Heading |
| ------------- | ---------------- |
| `0`           | `<h1>`           |
| `1`           | `<h2>`           |
| `2`           | `<h3>`           |
| `3`           | `<h4>`           |
| `4`           | `<h5>`           |
| `5`           | `<h6>`           |

The default value is `0` (H1), meaning any `<Heading>` outside a region wrapper renders as `<h1>`.

---

## `useHeading(hasH1?)`

```ts
function useHeading(hasH1?: boolean): HeadingLevel;
```

Reads `HeadingCtx` and computes the **next** heading level for a nested section using `calculateNextHeadingLevel`.

### Parameters

| Parameter | Type      | Default | Description                                                                            |
| --------- | --------- | ------- | -------------------------------------------------------------------------------------- |
| `hasH1`   | `boolean` | `true`  | Whether the current page/section already has an H1 — affects level clamping at depth 0 |

### Returns

`HeadingLevel` — a 0-based index (`0`–`5`) representing the computed heading level for children.

### Example

```tsx
import { HeadingCtx, useHeading } from "react-heading-manager";

function CustomRegion({ children }: { children: React.ReactNode }) {
  // Compute next level from ambient context
  const nextLevel = useHeading();

  return (
    <section>
      <HeadingCtx.Provider value={nextLevel}>{children}</HeadingCtx.Provider>
    </section>
  );
}
```

---

## Level Propagation Flow

```
HeadingCtx (default: 0 = H1)
  └─ <Main>               → provides level 0 (H1)
       └─ <Section>       → useHeading() → 1 (H2), provides 1
            └─ <Article>  → useHeading() → 2 (H3), provides 2
                 └─ <Heading> → renders <h3>
```

Each `createRegion` wrapper calls `useHeading()` to get the **next** level, then provides it to children via `HeadingCtx.Provider`. The `<Heading>` component reads `HeadingCtx` directly to determine which `<h*>` tag to render.

---

## Accessibility Notes

- **WCAG 2.1 SC 1.3.1 (Info and Relationships):** The context-driven approach guarantees sequential heading levels across nested landmark regions, eliminating skipped heading levels.
- The context is marked `"use client"` for Next.js App Router compatibility — it cannot be used in React Server Components directly, but its output (the rendered `<h*>` tags) is SSR-safe.

---

## Related

- [`src/components`](../components/README.md) — Landmark region components that consume this hook
- [`src/utils/heading-level.ts`](../utils/heading-level.ts) — `calculateNextHeadingLevel` implementation
- [`src/types.ts`](../types.ts) — `HeadingLevel` type definition
