# React Adapter

The `src/adapters/react` package provides the React UI binding for `react-heading-manager`. It manages ambient heading context, renders semantic landmarks, and automatically resolves descendant `<Heading>` elements to the correct native heading level.

---

## Dependency Rules

| Allowed imports | Forbidden imports                               |
| --------------- | ----------------------------------------------- |
| `src/shared/**` | `src/adapters/playwright/**`                    |
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
  HeadingCtx,
  HeadingFragment,
  Legend,
  Main,
  Section,
  createRegion,
  useHeading,
} from "react-heading-manager";
```

### Primary exports

- `Main`: root page landmark and heading-context initializer
- `Section`, `Article`, `Header`, `Aside`, `Legend`: HTML landmark wrappers
- `Heading`: context-aware heading component
- `HeadingFragment`: zero-DOM context bridge
- `createRegion`: custom landmark factory
- `HeadingCtx`, `useHeading`: low-level context API

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

This renders sequential heading levels without manual `h1`-`h6` drilling.

---

## Accessibility behavior

- `Main` initializes the root heading scope.
- `Section`, `Article`, `Header`, `Aside`, and `Legend` all increment the active heading context.
- `Heading` resolves to `<h1>` through `<h6>` based on the active context and clamps at `h6`.
- `HeadingFragment` updates context without creating a wrapper element.

---

## Rules for contributors

- Keep this folder React-only and free of Playwright/test runner code.
- Reuse `src/core` logic for hierarchy evaluation instead of re-implementing it here.
- Prefer explicit provider-based context and typed props over hidden runtime side effects.
