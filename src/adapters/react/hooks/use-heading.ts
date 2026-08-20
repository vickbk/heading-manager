"use client";

import { calculateNextHeadingLevel, HeadingLevel } from "@/src/shared/dom";
import { createContext, useContext } from "react";

/**
 * React Context storing the current 0-based heading level index.
 *
 * @description
 * Provides the ambient heading level context to child `<Heading>` and region
 * wrapper components.
 *
 * @deprecated Use `HeadingLevelCtx` instead. The replacement context supports
 * normalized heading levels beyond H6 and carries the `h6Clamp` policy.
 *
 * @remarks
 * This context is retained for backwards compatibility with the legacy
 * heading-level API. New components should use `HeadingLevelCtx` from
 * `use-heading-level`.
 */
export const HeadingCtx = createContext<HeadingLevel>(0);

/**
 * Calculates the next heading level from the legacy `HeadingCtx`.
 *
 * @param hasH1 - Whether an H1 heading already exists in the current section
 *   hierarchy scope. Defaults to `true`.
 *
 * @returns The calculated next 0-based `HeadingLevel`.
 *
 * @deprecated Use `useHeadingLevel()` instead. The replacement hook returns
 * both the normalized heading level and the inherited `h6Clamp` policy.
 *
 * @remarks
 * This hook uses the legacy `HeadingCtx` and `HeadingLevel` representation,
 * which is limited to native H1–H6 levels. It is retained for backwards
 * compatibility and does not support the newer configurable H6 clamping
 * behavior.
 *
 * @example
 * ```tsx
 * function CustomRegion({ children }: { children: React.ReactNode }) {
 *   const nextLevel = useHeading();
 *
 *   return (
 *     <HeadingCtx.Provider value={nextLevel}>
 *       {children}
 *     </HeadingCtx.Provider>
 *   );
 * }
 * ```
 *
 * @a11y
 * Legacy heading-level computation retained for backwards compatibility.
 * New implementations should use `useHeadingLevel()` for normalized heading
 * hierarchy management.
 */
export function useHeading(hasH1 = true) {
  const level = useContext(HeadingCtx);
  return calculateNextHeadingLevel(level, hasH1);
}
