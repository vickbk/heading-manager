# React Adapter

The `src/adapters/react` package provides the React UI binding for `react-heading-manager`. It manages ambient heading-level context, renders semantic landmarks, and automatically resolves descendant `<Heading>` components to the appropriate native HTML heading representation.

The React adapter supports normalized heading levels beyond the native H1–H6 range and provides an optional H6 clamping policy.

---

## Dependency Rules

| Allowed imports | Forbidden imports                               |
| --------------- | ----------------------------------------------- |
| `src/shared/**` | `src/adapters/!react/**`                        |
| `src/core/**`   | sibling adapter modules outside the React layer |

This layer is the only place where React-specific rendering concerns are allowed to live.

---

## Public API

```ts
import {
  Article,
  Aside,
  Header,
  Heading,
  HeadingFragment,
  HeadingLevelCtx,
  Legend,
  Main,
  Section,
  createRegion,
  useHeadingLevel,
} from "react-heading-manager";
```

````

### Primary exports

- `Main`: root page landmark and heading-level context initializer
- `Section`, `Article`, `Header`, `Aside`, `Legend`: HTML landmark wrappers
- `Heading`: context-aware heading component
- `HeadingFragment`: zero-DOM heading-level context bridge
- `createRegion`: custom landmark factory
- `HeadingLevelCtx`: ambient normalized heading-level context
- `useHeadingLevel`: hook for resolving the next normalized heading level

### Deprecated exports

The following APIs are retained for backwards compatibility:

- `HeadingCtx`
- `useHeading`
- `HeadingLevel`

> **Deprecated:** New code should use `HeadingLevelCtx` and
> `useHeadingLevel`. The legacy APIs are limited to the native H1–H6 model
> and do not expose the configurable `h6Clamp` policy.

---

## Heading-Level Context

The current context API uses a zero-based normalized heading level:

| Normalized level | Native representation |
| ---------------- | --------------------- |
| `0`              | `<h1>`                |
| `1`              | `<h2>`                |
| `2`              | `<h3>`                |
| `3`              | `<h4>`                |
| `4`              | `<h5>`                |
| `5`              | `<h6>`                |
| `6`              | `<h6 aria-level="7">` |
| `7`              | `<h6 aria-level="8">` |
| ...              | `<h6 aria-level="N">` |

Normalized levels are represented as numbers rather than being restricted to
the native H1–H6 range.

### H6 clamping

The `HeadingLevelCtx` also carries an `h6Clamp` policy.

```ts
type HeadingLevelContext = {
  level: number;
  h6Clamp: boolean;
};
```

When `h6Clamp` is `true`, heading levels stop advancing at H6.

When `h6Clamp` is `false`, normalized levels may continue beyond H6. The `Heading` component can preserve those logical levels through an H6 element with an explicit `aria-level`.

The clamping policy is inherited through nested regions and can be overridden at individual context boundaries.

---

## Usage example

```tsx
import { Heading, Main, Section, Article } from "react-heading-manager";

export function Page() {
  return (
    <Main>
      <Heading>Page title</Heading>

      <Section>
        <Heading>Features</Heading>

        <Article>
          <Heading>Release Notes</Heading>
        </Article>
      </Section>
    </Main>
  );
}
```

The heading levels are derived from the ambient context rather than requiring
manual `h1`–`h6` level management.

---

## H6 Clamping

By default, the root context allows normalized levels to continue beyond H6.

Applications that prefer to keep native headings within the H1–H6 range can enable clamping:

```tsx
<Main h6Clamp>
  <Heading>Page title</Heading>

  <Section>
    <Heading>Section heading</Heading>
  </Section>
</Main>
```

The policy can also be overridden at nested region boundaries:

```tsx
<Main h6Clamp>
  <Section h6Clamp={false}>
    <Heading>Nested heading</Heading>
  </Section>
</Main>
```

When a component does not specify `h6Clamp`, it inherits the policy from its parent context.

---

## Accessibility behavior

- `Main` initializes the root normalized heading scope.
- `Section`, `Article`, `Header`, `Aside`, and `Legend` advance the active heading level and propagate the inherited `h6Clamp` policy.
- `HeadingFragment` advances or explicitly overrides the heading context without creating a DOM wrapper.
- `createRegion` provides the same heading-level behavior for custom landmark components.
- `Heading` maps normalized levels `0`–`5` to native `<h1>`–`<h6>` elements.
- When levels beyond H6 are allowed, `Heading` preserves the normalized level  through an H6 element with an explicit ARIA heading level.
- Heading hierarchy can be analyzed independently using the normalized  heading-audit APIs in the core layer.

---

## Deprecated API Migration

Existing applications using the legacy API:

```tsx
import { HeadingCtx, useHeading } from "react-heading-manager";
```

should migrate to:

```tsx
import { HeadingLevelCtx, useHeadingLevel } from "react-heading-manager";
```

The old API represents heading levels using the deprecated `HeadingLevel` type, which is restricted to H1–H6. The new API uses normalized numeric levels and carries the H6 clamping policy alongside the level.

Conceptually:

```text
Legacy API

HeadingCtx
    │
    └── useHeading()
            │
            └── HeadingLevel (0–5)


Current API

HeadingLevelCtx
    │
    ├── level: number
    └── h6Clamp: boolean
            │
            └── useHeadingLevel()
                    │
                    ├── level
                    └── h6Clamp
```

---

## Rules for contributors

- Keep this folder React-only and free of non-react adapters code.
- Reuse `src/core` logic for hierarchy evaluation instead of re-implementing it here.
- Keep normalized heading levels independent from native HTML H1–H6 limits.
- Preserve `h6Clamp` when propagating heading context unless a component
  explicitly overrides it.
- Prefer `HeadingLevelCtx` and `useHeadingLevel` for new code.
- Keep `HeadingCtx` and `useHeading` only for backwards compatibility.
- Prefer explicit provider-based context and typed props over hidden runtime side effects.
````
