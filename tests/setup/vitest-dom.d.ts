/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  // Vitest 5.0.0 changed Assertion to accept Assertion<R = void, T = any>
  interface Assertion<R = void, _T = unknown> extends TestingLibraryMatchers<
    typeof expect.stringContaining,
    R
  > {}

  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<
    typeof expect.stringContaining,
    never
  > {}
}
