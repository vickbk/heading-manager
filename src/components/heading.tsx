"use client";

import { forwardRef, useContext, type HTMLAttributes } from "react";
import { HeadingCtx } from "../hooks/use-heading";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

/**
 * Context-aware HTML heading element that automatically resolves its DOM tag (`<h1>` - `<h6>`) based on ambient `HeadingCtx`.
 *
 * @description Reads the current 0-based heading level from `HeadingCtx` and renders the matching HTML tag (`h1` for 0, `h2` for 1, up to `h6` for 5).
 * Falls back safely to `<h6>` if context exceeds level 5.
 *
 * @example
 * ```tsx
 * <Section>
 *   <Heading>Automatically renders as H2 inside Section</Heading>
 * </Section>
 * ```
 *
 * @a11y Guarantees sequential heading tags without manual level hardcoding, conforming to WCAG 2.1 SC 1.3.1.
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
