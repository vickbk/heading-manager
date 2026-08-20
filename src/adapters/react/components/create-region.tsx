"use client";

import { forwardRef, HTMLAttributes, JSX } from "react";
import { HeadingLevelCtx, useHeadingLevel } from "../hooks/use-heading-level";

/**
 * Creates a React landmark region component that establishes a nested
 * heading-level context for its descendants.
 *
 * The generated component renders the specified HTML landmark element and
 * automatically advances the normalized heading level through
 * `useHeadingLevel()`.
 *
 * @param Tag - HTML intrinsic element used as the region wrapper
 *   (for example, `section`, `article`, or `aside`).
 * @returns A forward-ref React component that provides the updated
 *   `HeadingLevelCtx` to its descendants.
 *
 * @remarks
 * The optional `h6Clamp` prop overrides the inherited H6 clamping policy.
 * When omitted, the parent context policy is preserved.
 *
 * Normalized levels may continue beyond H6 when clamping is disabled.
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
 * @example
 * ```tsx
 * // Allow normalized heading levels beyond H6.
 * const Section = createRegion<HTMLElement>("section");
 *
 * <Section h6Clamp={false}>
 *   <Heading>Nested Heading</Heading>
 * </Section>
 * ```
 *
 * @a11y
 * Establishes a semantic landmark boundary while maintaining deterministic
 * heading hierarchy context for accessibility-oriented document structure.
 */
export function createRegion<T extends HTMLElement>(
  Tag: keyof JSX.IntrinsicElements,
) {
  const Component = forwardRef<T, HTMLAttributes<T> & { h6Clamp?: boolean }>(
    ({ children, h6Clamp, ...props }, ref) => {
      // To avoid ts error use a section tag wrapper to clear the legend type mismatch
      const SectionTag = Tag as "section";

      const { level, h6Clamp: parentClamp } = useHeadingLevel();
      return (
        <SectionTag {...props} ref={ref}>
          <HeadingLevelCtx.Provider
            value={{ level, h6Clamp: h6Clamp ?? parentClamp }}
          >
            {children}
          </HeadingLevelCtx.Provider>
        </SectionTag>
      );
    },
  );
  Component.displayName =
    String(Tag).charAt(0).toUpperCase() + String(Tag).slice(1);
  return Component;
}
