"use client";

import { HTMLAttributes, forwardRef } from "react";
import { HeadingCtx, useHeading } from "../hooks/use-heading";

/**
 * Primary `<main>` landmark region container that establishes the root heading hierarchy context.
 *
 * @param props - Props extending standard HTML attributes for the `<main>` element.
 * @param props.pageHasH1 - Whether an `<h1>` heading exists outside this landmark boundary (e.g., in a global site header). Defaults to `false`.
 * @param ref - Forwarded ref attached to the underlying `<main>` DOM element.
 * @returns The primary `<main>` landmark element providing `HeadingCtx` context to descendants.
 *
 * @remarks
 * **Heading Context Initialization:**
 * Initializes the ambient `HeadingCtx` for all descendant `<Heading>` components.
 * - **Default (`pageHasH1 = false`):** Initial heading level is set to `0` (`<h1>`), appropriate for pages where the primary title lives inside the `<main>` element.
 * - **With External H1 (`pageHasH1 = true`):** Initial heading level is set to `1` (`<h2>`), appropriate when a global site title or banner `<h1>` exists outside the `<main>` boundary.
 *
 * **Landmark Rules:**
 * An accessible document should contain exactly one visible `<main>` element representing the primary content region.
 *
 * @example
 * ```tsx
 * // Default — first descendant <Heading> renders as <h1>
 * <Main>
 *   <Heading>Page Title</Heading>
 * </Main>
 * ```
 *
 * @example
 * ```tsx
 * // When a global <h1> exists outside <Main> (e.g., in a top banner)
 * <Header>
 *   <h1>Site Name</h1>
 * </Header>
 * <Main pageHasH1>
 *   <Heading>Section Title (H2)</Heading>
 * </Main>
 * ```
 *
 * @a11y Marks the primary document landmark per WAI-ARIA specs and supports WCAG 2.1 SC 1.3.1 (Info and Relationships).
 */
export const Main = forwardRef<
  HTMLElement,
  { pageHasH1?: boolean } & HTMLAttributes<HTMLElement>
>(({ pageHasH1 = false, children, ...props }, ref) => {
  return (
    <main {...props} ref={ref}>
      <HeadingCtx.Provider value={useHeading(pageHasH1)}>
        {children}
      </HeadingCtx.Provider>
    </main>
  );
});
Main.displayName = "Main";
