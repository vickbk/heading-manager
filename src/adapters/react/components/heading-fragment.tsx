"use client";

import React from "react";
import { HeadingLevelCtx, useHeadingLevel } from "../hooks/use-heading-level";

/**
 * Logical heading-section component that creates a new heading-level context
 * without adding a DOM wrapper element.
 *
 * `HeadingFragment` establishes a new `HeadingLevelCtx` scope for its
 * descendants. By default, the heading level is derived from the parent
 * heading context through `useHeadingLevel()`. An explicit `level` prop can
 * be used to override that calculated level.
 *
 * The H6 clamping policy is inherited from the parent context unless an
 * explicit `h6Clamp` prop is provided.
 *
 * @param props - Fragment configuration and child content.
 * @param props.children - React nodes enclosed within this heading-level
 *   scope.
 * @param props.level - Optional explicit zero-based normalized heading level
 *   override:
 *   - `0` → H1
 *   - `1` → H2
 *   - `2` → H3
 *   - `3` → H4
 *   - `4` → H5
 *   - `5` → H6
 *   - `6` → H7
 *   - higher values → corresponding normalized heading levels beyond H6.
 * @param props.h6Clamp - Optional H6 clamping policy for this heading
 *   context.
 *   - `true` — prevents the hierarchy from advancing from H6 to H7.
 *   - `false` — allows normalized heading levels beyond H6.
 *   - `undefined` — inherits the value from the parent heading context.
 *
 * @returns A `HeadingLevelCtx.Provider` containing `children`, without
 *   introducing an additional DOM element.
 *
 * @remarks
 * **Heading Level Resolution:**
 *
 * When `level` is omitted, the fragment advances the current heading context
 * by one normalized level:
 *
 * ```text
 * Parent H1 → Fragment H2
 * Parent H2 → Fragment H3
 * Parent H5 → Fragment H6
 * Parent H6 → Fragment H7 (when h6Clamp=false)
 * ```
 *
 * When `level` is explicitly provided, that value takes precedence over the
 * calculated level:
 *
 * ```tsx
 * <HeadingFragment level={3}>
 *   {/* Descendants use normalized H4 context *\/}
 * </HeadingFragment>
 * ```
 *
 * **H6 Clamping:**
 *
 * `h6Clamp` controls whether the normalized hierarchy may advance beyond the
 * native HTML H6 boundary. The policy is inherited by default, allowing a
 * parent component to establish the behavior for an entire component tree.
 *
 * An explicit value overrides the inherited policy:
 *
 * ```tsx
 * <HeadingFragment h6Clamp>
 *   {/* H6 → H6 instead of H7 *\/}
 * </HeadingFragment>
 * ```
 *
 * ```tsx
 * <HeadingFragment h6Clamp={false}>
 *   {/* H6 → H7 is permitted *\/}
 * </HeadingFragment>
 * ```
 *
 * Because `HeadingFragment` only provides React context, it does not add a
 * semantic HTML section or landmark to the document. It should therefore be
 * used when a logical heading-level boundary is required without introducing
 * an additional DOM container.
 *
 * @example
 * ```tsx
 * <HeadingFragment>
 *   <Heading>Sub-heading without a DOM wrapper</Heading>
 * </HeadingFragment>
 * ```
 *
 * @example
 * ```tsx
 * // Explicitly start descendants at normalized H3.
 * <HeadingFragment level={2}>
 *   <Heading>H3 Heading</Heading>
 * </HeadingFragment>
 * ```
 *
 * @example
 * ```tsx
 * // Inherit the parent's H6 clamping policy.
 * <HeadingFragment>
 *   <Heading>Nested Heading</Heading>
 * </HeadingFragment>
 * ```
 *
 * @example
 * ```tsx
 * // Override the parent's policy and allow normalized levels beyond H6.
 * <HeadingFragment h6Clamp={false}>
 *   <Heading>Nested Heading</Heading>
 * </HeadingFragment>
 * ```
 *
 * @a11y
 * Supports deterministic heading hierarchy management without introducing
 * additional DOM elements. The component provides structural heading context
 * for descendants and can be used to control heading progression as part of
 * accessibility auditing and semantic document organization.
 */
export function HeadingFragment({
  children,
  level,
  h6Clamp,
}: {
  children: React.ReactNode;
  level?: number;
  h6Clamp?: boolean;
}) {
  const { level: parentLevel, h6Clamp: parentClamp } = useHeadingLevel();

  return (
    <HeadingLevelCtx.Provider
      value={{ level: level ?? parentLevel, h6Clamp: h6Clamp ?? parentClamp }}
    >
      {children}
    </HeadingLevelCtx.Provider>
  );
}

HeadingFragment.displayName = "HeadingFragment";
