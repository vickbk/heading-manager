/**
 * React adapter for automated, context-aware heading level resolution and landmark region mapping.
 *
 * @module adapters/react
 * @description Provides React components, landmark wrappers, and hooks to automatically track and increment
 * ambient heading context across component trees without manual level hardcoding (`<h1>`–`<h6>`).
 */

/**
 * Factory utility for creating custom landmark region components that automatically increment `HeadingCtx`.
 */
export { createRegion } from "./components/create-region";

/**
 * Context-aware heading component that resolves its native HTML tag (`<h1>`–`<h6>`) based on ambient `HeadingCtx`.
 */
export { Heading } from "./components/heading";

/**
 * Component wrapper that increments `HeadingCtx` for descendant headings without rendering a wrapper DOM element.
 */
export { HeadingFragment } from "./components/heading-fragment";

/**
 * Pre-configured HTML5 landmark components (`<Section>`, `<Article>`, `<Header>`, `<Aside>`, `<Legend>`).
 */
export * from "./components/landmarks";

/**
 * Primary document landmark container (`<main>`) that initializes the root `HeadingCtx` hierarchy context.
 */
export { Main } from "./components/main";

/**
 * Ambient React Context (`HeadingCtx`) and custom hook (`useHeading`) for consuming or initializing heading levels.
 */
export { HeadingCtx, useHeading } from "./hooks/use-heading";
