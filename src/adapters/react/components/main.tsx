"use client";

import { HTMLAttributes, forwardRef } from "react";
import { HeadingLevelCtx, useHeadingLevel } from "../hooks/use-heading-level";

/**
 * Primary `<main>` landmark region container that establishes the heading
 * hierarchy context for its descendants.
 *
 * The component derives the initial normalized heading level from the
 * surrounding `HeadingLevelCtx` through `useHeadingLevel()`, then provides
 * the resulting heading context to all descendant components.
 *
 * @param props - Props extending standard HTML attributes for the `<main>`
 *   element.
 * @param props.pageHasH1 - Indicates whether an `<h1>` already exists outside
 *   this landmark boundary, such as in a global site header or banner.
 *   Defaults to `false`.
 *   - `false` — the first descendant `<Heading>` starts at H1.
 *   - `true` — the first descendant `<Heading>` starts at H2.
 * @param props.h6Clamp - Optional H6 clamping policy for this `<main>`
 *   heading context.
 *   - `true` — prevents the normalized hierarchy from advancing from H6
 *     to H7.
 *   - `false` — allows normalized heading levels to continue beyond H6.
 *   - `undefined` — inherits the `h6Clamp` value from the parent heading
 *     context.
 * @param ref - Forwarded ref attached to the underlying `<main>` DOM element.
 *
 * @returns The primary `<main>` landmark element containing a
 *   `HeadingLevelCtx.Provider` for its descendants.
 *
 * @remarks
 * **Heading Context Initialization and Propagation:**
 *
 * `Main` establishes a new heading-level context based on the current
 * heading hierarchy:
 *
 * ```text
 * pageHasH1=false → next level starts at H1
 * pageHasH1=true  → next level starts at H2
 * ```
 *
 * The component preserves the inherited `h6Clamp` policy unless an explicit
 * `h6Clamp` prop is provided. This allows a parent component to establish a
 * global heading policy while individual `<main>` regions may override it.
 *
 * ```tsx
 * <Main h6Clamp>
 *   {/* Descendants inherit H6 clamping *\/}
 * </Main>
 * ```
 *
 * When `h6Clamp` is omitted, the value from the parent heading context is
 * propagated unchanged:
 *
 * ```tsx
 * <Main>
 *   {/* Parent h6Clamp policy is preserved *\/}
 * </Main>
 * ```
 *
 * **Normalized Heading Levels:**
 *
 * The context uses zero-based normalized levels:
 *
 * ```text
 * 0 → H1
 * 1 → H2
 * 2 → H3
 * 3 → H4
 * 4 → H5
 * 5 → H6
 * 6 → H7
 * ...
 * ```
 *
 * When H6 clamping is disabled, normalized levels beyond H6 can be preserved
 * by descendant heading components and represented using an appropriate
 * accessible ARIA heading representation.
 *
 * **Landmark Rules:**
 *
 * An accessible document should generally contain a single visible `<main>`
 * landmark representing the primary content region of the document.
 *
 * @example
 * ```tsx
 * // Default — the first descendant <Heading> resolves to H1.
 * <Main>
 *   <Heading>Page Title</Heading>
 * </Main>
 * ```
 *
 * @example
 * ```tsx
 * // When a global H1 exists outside <Main>, descendants start at H2.
 * <Header>
 *   <h1>Site Name</h1>
 * </Header>
 *
 * <Main pageHasH1>
 *   <Heading>Section Title</Heading>
 * </Main>
 * ```
 *
 * @example
 * ```tsx
 * // Explicitly enable H6 clamping for this heading hierarchy.
 * <Main h6Clamp>
 *   <Heading>Page Title</Heading>
 *   <Section>
 *     <Heading>Section Title</Heading>
 *   </Section>
 * </Main>
 * ```
 *
 * @example
 * ```tsx
 * // Inherit the h6Clamp policy from an enclosing heading context.
 * <HeadingLevelCtx.Provider value={{ level: 0, h6Clamp: true }}>
 *   <Main>
 *     <Heading>Page Title</Heading>
 *   </Main>
 * </HeadingLevelCtx.Provider>
 * ```
 *
 * @a11y
 * Establishes the primary document landmark and provides deterministic
 * heading hierarchy information to descendants as part of accessibility
 * auditing and structural semantics.
 *
 * Supports WCAG 2.1 SC 1.3.1 (Info and Relationships) by maintaining an
 * explicit heading hierarchy context across nested component boundaries.
 */
export const Main = forwardRef<
  HTMLElement,
  { pageHasH1?: boolean; h6Clamp?: boolean } & HTMLAttributes<HTMLElement>
>(({ pageHasH1 = false, h6Clamp, children, ...props }, ref) => {
  const { level, h6Clamp: parentClamp } = useHeadingLevel(pageHasH1);
  return (
    <main {...props} ref={ref}>
      <HeadingLevelCtx.Provider
        value={{ level, h6Clamp: h6Clamp ?? parentClamp }}
      >
        {children}
      </HeadingLevelCtx.Provider>
    </main>
  );
});
Main.displayName = "Main";
