# `src/components`

React sectioning components that automatically manage heading levels via React Context. Landmark wrappers render an HTML sectioning element and increment the ambient `HeadingCtx` for nested `<Heading>` children. `<HeadingFragment>` is a non-rendering sectioning provider that updates the same context without creating a DOM wrapper.

---

## Exports

| Export            | Type             | HTML Element                | Description                                                                                                        |
| ----------------- | ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `createRegion`    | Factory Function | _(configurable)_            | HOC that creates a landmark wrapper component for any HTML tag                                                     |
| `Main`            | Component        | `<main>`                    | Page-level main content region — resets heading context to H1                                                      |
| `Section`         | Component        | `<section>`                 | Generic sectioning region                                                                                          |
| `Article`         | Component        | `<article>`                 | Self-contained article region                                                                                      |
| `Header`          | Component        | `<header>`                  | Introductory or navigational region                                                                                |
| `Aside`           | Component        | `<aside>`                   | Tangentially related content region                                                                                |
| `Legend`          | Component        | `<legend>`                  | Fieldset legend region                                                                                             |
| `Heading`         | Component        | `<h1>`–`<h6>`               | Heading rendered at the current context level                                                                      |
| `HeadingFragment` | Component        | `None` / `<React.Fragment>` | Non-rendering sectioning provider that increments or overrides ambient `HeadingCtx` without emitting a DOM wrapper |

---

## Core Concept: `createRegion`

`createRegion<T>(Tag)` is a higher-order factory that:

1. Calls `useHeading()` to compute the next heading level from the current `HeadingCtx`.
2. Renders `Tag` as the HTML landmark wrapper.
3. Provides an incremented `HeadingCtx.Provider` to all children.

```tsx
// Internal usage — how landmark components are created
import { createRegion } from "./create-region";

const Section = createRegion<HTMLElement>("section");
const Article = createRegion<HTMLElement>("article");
```

---

## Usage Examples

### Basic Page Structure

```tsx
import { Main, Section, Article, Heading } from "heading-manager";

export function Page() {
  return (
    <Main>
      {/* <Heading> renders as <h1> — top of context */}
      <Heading>Page Title</Heading>

      <Section>
        {/* <Heading> renders as <h2> — one level deeper */}
        <Heading>Section Heading</Heading>

        <Article>
          {/* <Heading> renders as <h3> — two levels deeper */}
          <Heading>Article Heading</Heading>
        </Article>
      </Section>
    </Main>
  );
}
```

### Forwarded Refs

All landmark components support `ref` forwarding:

```tsx
import { useRef } from "react";
import { Section, Heading } from "heading-manager";

const ref = useRef<HTMLElement>(null);

<Section ref={ref} aria-label="Featured content">
  <Heading>Featured</Heading>
</Section>;
```

### Custom Landmarks via `createRegion`

```tsx
import { createRegion } from "heading-manager";

const Nav = createRegion<HTMLElement>("nav");

<Nav aria-label="Primary navigation">
  <Heading>Navigation</Heading>
</Nav>;
```

---

## Component API

### `<Main>`

Renders a `<main>` element. By default (`pageHasH1 = false`), the first `<Heading>` inside renders as `<h1>`. Set `pageHasH1={true}` only when a global `<h1>` already exists outside this landmark boundary (e.g. in a site-wide header).

| Prop        | Type                          | Default | Description                                                                                                                   |
| ----------- | ----------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `pageHasH1` | `boolean`                     | `false` | Set to `true` when an `<h1>` already exists **outside** this `<Main>` landmark. First `<Heading>` will then render as `<h2>`. |
| `children`  | `ReactNode`                   | —       | Content to render inside `<main>`                                                                                             |
| `ref`       | `Ref<HTMLElement>`            | —       | Forwarded ref to the `<main>` DOM node                                                                                        |
| `...props`  | `HTMLAttributes<HTMLElement>` | —       | Any valid HTML attribute for `<main>`                                                                                         |

### `<Heading>`

Renders the correct heading level (`<h1>`–`<h6>`) based on `HeadingCtx`.

| Prop       | Type                                 | Default | Description                           |
| ---------- | ------------------------------------ | ------- | ------------------------------------- |
| `children` | `ReactNode`                          | —       | Heading text or content               |
| `ref`      | `Ref<HTMLHeadingElement>`            | —       | Forwarded ref to the heading DOM node |
| `...props` | `HTMLAttributes<HTMLHeadingElement>` | —       | Any valid HTML heading attribute      |

### `<HeadingFragment>`

Provides a new `HeadingCtx` value to its children. When `level` is omitted, it increments the ambient heading level by one; when supplied, it overrides the context to the explicit `HeadingLevel` (`0` = H1, `1` = H2, ..., `5` = H6). It renders zero DOM nodes.

| Prop       | Type           | Default     | Description                                                   |
| ---------- | -------------- | ----------- | ------------------------------------------------------------- |
| `children` | `ReactNode`    | —           | React nodes rendered within the updated heading context       |
| `level`    | `HeadingLevel` | `undefined` | Optional 0-based override (`0` = H1, `1` = H2, ..., `5` = H6) |

---

## Accessibility Notes

- **WCAG 2.1 SC 1.3.1 (Info and Relationships):** Heading levels are computed automatically to avoid skipped levels (e.g., H1 → H3).
- **Sectioning elements** (`<section>`, `<article>`, `<aside>`) are recognized as ARIA landmark regions by screen readers when labelled with `aria-label` or `aria-labelledby`.
- The `<main>` landmark must appear **once per page** and receive focus on skip-link activation.
- `<legend>` inside `<fieldset>` semantically labels the group for screen readers.

---

## Related

- [`src/hooks`](../hooks/README.md) — `HeadingCtx` and `useHeading` hook internals
- [`src/utils`](../utils/README.md) — DOM region parsing and WCAG compliance validation
- [`src/types.ts`](../types.ts) — Shared type definitions (`HeadingLevel`, `HeadingDetail`, etc.)
