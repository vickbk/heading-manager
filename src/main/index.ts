/**
 * Package entry point for the root public API: `react-heading-manager`.
 *
 * This subpath exposes the React adapter surface, including the context providers,
 * landmark wrappers, heading components, and custom hooks used to manage
 * automated heading hierarchy state in application UIs.
 *
 * @module react-heading-manager
 */
export {
  Article,
  Header,
  Heading,
  HeadingCtx,
  HeadingFragment,
  HeadingLevelCtx,
  Main,
  Section,
  createRegion,
  useHeading,
  useHeadingLevel,
} from "@/src/adapters/react";
