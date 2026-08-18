"use client";

import { calculateNextHeadingLevel, HeadingLevel } from "@/src/shared/dom";
import { createContext, useContext } from "react";

/**
 * React Context storing the current 0-based heading level index (`0` for H1, `1` for H2, etc.).
 *
 * @description Provides the ambient heading level context to child `<Heading>` and region wrapper components.
 */
export const HeadingCtx = createContext<HeadingLevel>(0);

/**
 * Custom hook to calculate the next 0-based heading level index for a nested section.
 *
 * @param hasH1 - Whether an H1 heading already exists in the current section hierarchy scope. Defaults to `true`.
 * @returns The calculated next 0-based `HeadingLevel` integer (`0` through `5`).
 *
 * @remarks
 * **Heading Level Computation:**
 * Reads the ambient `HeadingCtx` value and uses `calculateNextHeadingLevel` to compute the incremented
 * child context level (clamping at `5` for `<h6>`).
 *
 * @example
 * ```tsx
 * function CustomRegion({ children }: { children: React.ReactNode }) {
 *   const nextLevel = useHeading();
 *   return <HeadingCtx.Provider value="{nextLevel}">{children}</HeadingCtx.Provider>;
 * }
 * ```
 *
 * @a11y Computes heading levels sequentially to ensure compliance with WCAG 2.1 SC 1.3.1.
 */
export function useHeading(hasH1 = true) {
  const level = useContext(HeadingCtx);
  return calculateNextHeadingLevel(level, hasH1);
}
