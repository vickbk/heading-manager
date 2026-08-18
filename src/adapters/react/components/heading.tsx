"use client";

import { forwardRef, useContext, type HTMLAttributes } from "react";
import { HeadingCtx } from "../hooks/use-heading";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

/**
 * Context-aware React component that resolves its native HTML heading tag (`<h1>`–`<h6>`)
 * dynamically based on ambient `HeadingCtx`.
 *
 * @param props - Standard HTML heading attributes passed to the underlying heading tag.
 * @param ref - Forwarded ref attached to the rendered HTML heading element.
 * @returns Context-resolved HTML heading element (`<h1>` through `<h6>`).
 *
 * @remarks
 * **Level Resolution & Clamping:**
 * - Reads a zero-based integer level from `HeadingCtx` (e.g., `0` $\rightarrow$ `<h1>`, `1` $\rightarrow$ `<h2>`).
 * - Clamps at `<h6>` for nesting depths of 5 or greater to align with native HTML element boundaries (`<h1>` through `<h6>`).
 *
 * **Accessibility Audit Note:**
 * Promotes deterministic, sequential heading hierarchy throughout component trees without manual level hardcoding.
 * Supports WCAG 2.1 SC 1.3.1 (Info and Relationships) best practices for structural markup.
 *
 * @example
 * ```tsx
 * <Section>
 *   // Automatically renders as <h2> if contained within a level-1 context
 *   <Heading>Section Title</Heading>
 * </Section>
 * ```
 *
 * @a11y Dynamically resolves heading levels based on landmark section nesting.
 * HTML native tags clamp at `<h6>` for depth values $\ge 5$.
 */
export const Heading = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ children, ...props }, ref) => {
  const level = useContext(HeadingCtx);

  const Tag = HEADING_TAGS[level] ?? "h6";

  return (
    <Tag {...props} ref={ref}>
      {children}
    </Tag>
  );
});
Heading.displayName = "Heading";
