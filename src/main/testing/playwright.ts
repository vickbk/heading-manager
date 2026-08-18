/**
 * Package entry point for the Playwright assertion adapter: `react-heading-manager/testing/playwright`.
 *
 * This subpath exposes the explicit matcher registration helper and the
 * `toHaveValidHeadingHierarchy` assertion so E2E tests can audit heading order
 * against WCAG rules without side-effectful imports.
 *
 * @module react-heading-manager/testing/playwright
 */
export * from "@/src/adapters/playwright";
