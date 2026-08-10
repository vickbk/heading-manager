"use client";

import { HTMLAttributes, forwardRef } from "react";
import { HeadingCtx, useHeading } from "../hooks/use-heading";

/**
 * Primary `<main>` HTML landmark region wrapper component.
 *
 * @description Serves as the top-level landmark container for page content. Configures initial `HeadingCtx` heading level context.
 *
 * @param pageHasH1 - Set to `false` if this `<Main>` landmark should render its first child `<Heading>` as `<h1>`.
 * Defaults to `true` (assuming an `<h1>` exists in page global header).
 *
 * @example
 * ```tsx
 * <Main pageHasH1={false}>
 *   <Heading>Main Document Title (H1)</Heading>
 * </Main>
 * ```
 *
 * @a11y Marks the primary content landmark of the page per WAI-ARIA standards and WCAG 2.1 SC 1.3.1.
 */
export const Main = forwardRef<
  HTMLElement,
  { pageHasH1?: boolean } & HTMLAttributes<HTMLElement>
>(({ pageHasH1 = true, children, ...props }, ref) => {
  const level = useHeading(pageHasH1);
  return (
    <main {...props} ref={ref}>
      <HeadingCtx.Provider value={level}>{children}</HeadingCtx.Provider>
    </main>
  );
});
Main.displayName = "Main";
