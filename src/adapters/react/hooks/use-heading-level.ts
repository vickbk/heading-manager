import { calculateNextHeadingLevel } from "@/src/shared/dom";
import { createContext, useContext } from "react";
import type { HeadingLevelContext } from "../types";

/**
 * React context containing the current normalized heading-level state.
 *
 * The `level` value is zero-based:
 *
 * - `0` → H1
 * - `1` → H2
 * - `2` → H3
 * - ...
 * - `5` → H6
 * - `6` → normalized H7
 * - `7` → normalized H8
 * - etc.
 *
 * `h6Clamp` controls whether heading-level calculation is restricted to the
 * native HTML heading range. It defaults to `false`, allowing the normalized
 * hierarchy to continue beyond H6.
 *
 * The context is intended to be overridden by higher-level heading/section
 * providers so that nested components inherit both the current heading level
 * and the H6 clamping policy.
 *
 * @example
 * ```tsx
 * <HeadingLevelCtx.Provider value={{ level: 5, h6Clamp: false }}>
 *   <Heading />
 * </HeadingLevelCtx.Provider>
 * ```
 *
 * In this example, the next heading level resolves to normalized H7.
 */
export const HeadingLevelCtx = createContext<HeadingLevelContext>({
  level: 0,
  h6Clamp: false,
});

/**
 * Resolves the next normalized heading level from the current heading context.
 *
 * The hook reads the current zero-based heading level and H6 clamping policy
 * from `HeadingLvlCtx`, then delegates the level calculation to
 * `calculateNextHeadingLevel()`.
 *
 * The returned value is a zero-based normalized level rather than a native
 * HTML heading tag:
 *
 * ```text
 * 0 → H1
 * 1 → H2
 * ...
 * 5 → H6
 * 6 → H7
 * 7 → H8
 * ```
 *
 * When `h6Clamp` is enabled in the inherited context, the result is capped
 * at `5` (H6). When it is disabled, normalized levels may continue beyond
 * H6.
 *
 * @param hasH1 - Indicates whether an H1 already exists in the current
 *   section context. Defaults to `true`, meaning the next heading normally
 *   advances from the current context level.
 *
 * @returns The next zero-based normalized heading level.
 *
 * @remarks
 * This hook does not render or determine the HTML heading element itself.
 * The returned normalized level can subsequently be mapped to a native
 * `<h1>`–`<h6>` element or, when levels greater than H6 are permitted,
 * represented using an H6 element with an explicit ARIA heading level.
 *
 * @example
 * ```tsx
 * function Heading() {
 *   const level = useHeadingLevel();
 *
 *   // level is the normalized level to render.
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With the default context:
 * // level = 0, h6Clamp = false
 * const level = useHeadingLevel();
 * // → 1 (H2)
 * ```
 *
 * @example
 * ```tsx
 * // With:
 * // { level: 5, h6Clamp: false }
 * const level = useHeadingLevel();
 * // → 6 (normalized H7)
 * ```
 *
 * @example
 * ```tsx
 * // With:
 * // { level: 5, h6Clamp: true }
 * const level = useHeadingLevel();
 * // → 5 (clamped H6)
 * ```
 *
 * @a11y
 * Supports deterministic heading hierarchy management by deriving heading
 * levels from ambient context rather than requiring individual components to
 * hard-code their heading level.
 */
export function useHeadingLevel(hasH1 = true): number {
  const { level, h6Clamp = false } = useContext(HeadingLevelCtx);

  return calculateNextHeadingLevel(level, hasH1, h6Clamp);
}
