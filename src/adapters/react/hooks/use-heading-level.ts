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
 * Resolves the next normalized heading-level context from the current
 * `HeadingLevelCtx`.
 *
 * The hook reads the current zero-based normalized heading level and the
 * inherited H6 clamping policy, then calculates the next heading level using
 * `calculateNextHeadingLevel()`.
 *
 * The returned context contains:
 *
 * - `level` — the next zero-based normalized heading level.
 * - `h6Clamp` — the inherited H6 clamping policy, preserved so it can be
 *   passed to a child heading-level context.
 *
 * The normalized `level` is represented as:
 *
 * ```text
 * 0 → H1
 * 1 → H2
 * 2 → H3
 * ...
 * 5 → H6
 * 6 → H7
 * 7 → H8
 * ```
 *
 * When `h6Clamp` is enabled, the transition from H6 to H7 is clamped:
 *
 * ```text
 * H5 → H6
 * H6 → H6
 * ```
 *
 * When `h6Clamp` is disabled, the normalized hierarchy may continue beyond
 * the native HTML H6 boundary:
 *
 * ```text
 * H5 → H6
 * H6 → H7
 * H7 → H8
 * ```
 *
 * @param hasH1 - Indicates whether an H1 already exists in the current
 *   section context. Defaults to `true`, meaning the next heading normally
 *   advances from the current context level.
 *
 * @returns An object containing the next normalized heading level and the
 *   inherited H6 clamping policy.
 *
 * @remarks
 * This hook does not render or determine the HTML heading element itself.
 * The returned `level` represents the normalized semantic hierarchy and can
 * subsequently be mapped to a native `<h1>`–`<h6>` element. When normalized
 * levels greater than H6 are permitted, they may be represented using an
 * `<h6>` element with an explicit `role="heading"` and `aria-level`.
 *
 * The returned `h6Clamp` value is intentionally preserved from the current
 * context so that callers creating nested heading contexts can propagate the
 * same rendering policy to their descendants.
 *
 * @example
 * ```tsx
 * function Section() {
 *   const headingContext = useHeadingLevel();
 *
 *   return (
 *     <HeadingLevelCtx.Provider value={headingContext}>
 *       {children}
 *     </HeadingLevelCtx.Provider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With the default context:
 * // { level: 0, h6Clamp: false }
 * const context = useHeadingLevel();
 *
 * // → { level: 1, h6Clamp: false }
 * ```
 *
 * @example
 * ```tsx
 * // With:
 * // { level: 5, h6Clamp: false }
 * const context = useHeadingLevel();
 *
 * // → { level: 6, h6Clamp: false }
 * //    normalized H7
 * ```
 *
 * @example
 * ```tsx
 * // With:
 * // { level: 5, h6Clamp: true }
 * const context = useHeadingLevel();
 *
 * // → { level: 5, h6Clamp: true }
 * //    clamped at H6
 * ```
 *
 * @a11y
 * Supports deterministic heading hierarchy management by deriving the next
 * normalized heading level from ambient context while preserving the
 * inherited H6 rendering policy for nested heading contexts.
 */
export function useHeadingLevel(hasH1 = true): HeadingLevelContext {
  const { level, h6Clamp = false } = useContext(HeadingLevelCtx);

  return {
    level: calculateNextHeadingLevel(level, hasH1, h6Clamp),
    h6Clamp,
  };
}
