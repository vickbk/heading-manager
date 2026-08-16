"use client";

import { HeadingLevel } from "@/src/shared/dom";
import React from "react";
import { HeadingCtx, useHeading } from "../hooks/use-heading";

/**
 * Logical sectioning component that adjusts heading context level without polluting the DOM with a wrapper element.
 *
 * @description Provides a new `HeadingCtx` value to its children. If an explicit `level` prop is provided,
 * it overrides the current context. Otherwise, it automatically increments the heading level.
 *
 * @param children - React nodes enclosed within this heading level scope.
 * @param level - Optional explicit 0-based heading level override (`0` = H1, `1` = H2, etc.).
 * @returns A Provider component wrapping children with updated `HeadingCtx`.
 *
 * @example
 * ```tsx
 * <HeadingFragment>
 *   <Heading>Sub-heading without DOM container wrapper</Heading>
 * </HeadingFragment>
 * ```
 *
 * @a11y Allows virtual heading hierarchy stepping for UI components that cannot output extra HTML wrapper tags.
 */
export function HeadingFragment({
  children,
  level,
}: {
  children: React.ReactNode;
  level?: HeadingLevel;
}) {
  const computedNextLevel = useHeading();

  return (
    <HeadingCtx.Provider value={level ?? computedNextLevel}>
      {children}
    </HeadingCtx.Provider>
  );
}

HeadingFragment.displayName = "HeadingFragment";
