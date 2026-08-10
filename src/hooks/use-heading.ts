"use client";

import { createContext, useContext } from "react";
import type { HeadingLevel } from "../types";
import { calculateNextHeadingLevel } from "../utils/heading-level";

/**
 * React Context storing the current 0-based heading level index (`0` for H1, `1` for H2, etc.).
 *
 * @description Provides the ambient heading level context to child `<Heading>` and region wrapper components.
 */
export const HeadingCtx = createContext<HeadingLevel>(0);

/**
 * Custom hook to calculate the next 0-based heading level index for a nested section.
 *
 * @description Reads current `HeadingCtx` and computes the next level using `calculateNextHeadingLevel`.
 *
 * @param hasH1 - Whether the current section or page already contains an H1 heading (defaults to `true`).
 * @returns The next 0-based `HeadingLevel` index (`0` through `5`).
 *
 * @example
 * ```tsx
 * function CustomRegion({ children }: { children: React.ReactNode }) {
 *   const nextLevel = useHeading();
 *   return <HeadingCtx.Provider value={nextLevel}>{children}</HeadingCtx.Provider>;
 * }
 * ```
 *
 * @a11y Computes heading levels sequentially to ensure compliance with WCAG 2.1 SC 1.3.1.
 */
export function useHeading(hasH1 = true) {
  const level = useContext(HeadingCtx);
  return calculateNextHeadingLevel(level, hasH1);
}
