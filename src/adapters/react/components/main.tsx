"use client";

import { HTMLAttributes, forwardRef } from "react";
import { HeadingCtx, useHeading } from "../hooks/use-heading";

/**
 * Primary `<main>` HTML landmark region wrapper component.
 *
 * @description Serves as the top-level landmark container for page content. Configures initial
 * `HeadingCtx` heading level context. By default (`pageHasH1 = false`), the first child `<Heading>`
 * will render as `<h1>`, which is the correct behaviour for most pages.
 *
 * @param pageHasH1 - Whether the page already contains an `<h1>` **outside** this `<Main>` landmark
 * boundary (e.g. in a global site header). When `true`, the first child `<Heading>` renders as
 * `<h2>` instead. Defaults to `false`.
 *
 * @example
 * ```tsx
 * // Default — first <Heading> renders as <h1>
 * <Main>
 *   <Heading>Main Document Title (H1)</Heading>
 * </Main>
 * ```
 *
 * @example
 * ```tsx
 * // Global <h1> lives outside <Main> (e.g. in a site-wide header component)
 * <Main pageHasH1>
 *   <Heading>Section Heading (H2)</Heading>
 * </Main>
 * ```
 *
 * @a11y Marks the primary content landmark of the page per WAI-ARIA standards and WCAG 2.1 SC 1.3.1.
 * Each page should contain exactly one `<main>` landmark. Set `pageHasH1={true}` only when an
 * `<h1>` already exists outside this landmark boundary.
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
