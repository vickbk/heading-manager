"use client";

import { forwardRef, HTMLAttributes, JSX } from "react";
import { HeadingCtx, useHeading } from "../hooks/use-heading";

/**
 * Higher-order factory helper to create accessible landmark region wrapper components cleanly.
 *
 * @description Automatically increments the nested heading context level for any nested `<Heading>` components
 * and wraps children in the specified HTML landmark element (`<section>`, `<article>`, `<aside>`, etc.).
 *
 * @param Tag - HTML intrinsic element tag name to render as the landmark wrapper element.
 * @returns A forwardRef React component that provides updated `HeadingCtx` context to its children.
 *
 * @example
 * ```tsx
 * const Section = createRegion<HTMLElement>("section");
 * 
 * <Section>
 *   <Heading>Section Title</Heading>
 * </Section>
 * ```
 *
 * @a11y Ensures screen readers perceive structural sectioning boundaries per WCAG 2.1 SC 1.3.1.
 */
export function createRegion<T extends HTMLElement>(
  Tag: keyof JSX.IntrinsicElements,
) {
  const Component = forwardRef<T, HTMLAttributes<T>>(
    ({ children, ...props }, ref) => {
      const level = useHeading();
      // To avoid ts error use a section tag wrapper to clear the legend type mismatch
      const SectionTag = Tag as "section";

      return (
        <SectionTag {...props} ref={ref}>
          <HeadingCtx.Provider value={level}>{children}</HeadingCtx.Provider>
        </SectionTag>
      );
    },
  );
  Component.displayName =
    String(Tag).charAt(0).toUpperCase() + String(Tag).slice(1);
  return Component;
}
