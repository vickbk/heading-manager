# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to
[Semantic Versioning].

## [Unreleased]

## [0.3.0] - 2026-08-19

### Added

- Added deterministic normalized heading hierarchy auditing based on `HeadingDetail.numLevel`.
- Added `checkNormalizedHeadingReport()` and `checkNormalizedHeading()`.
- **Heading level context and hook**
  - Added `HeadingLevelCtx` with normalized heading-level state.
  - Added `useHeadingLevel()` for resolving the next heading level from context.
  - Added optional `h6Clamp` support, defaulting to `false`, allowing normalized levels beyond H6.

### Changed

- Extended `HeadingDetail` with `numLevel` as the canonical numeric heading representation.
- Preserved the existing heading-order APIs for backward compatibility.
- Deprecated `checkHeadingOrderReport` and `checkHeadingOrder` along with their respectiveutilities in favor of `checkNormalizedHeadingReport` and `checkNormalizedHeading`.
- **`calculateNextHeadingLevel()`**
  - Added the optional `h6Clamp` parameter.
  - Preserves H6 clamping when enabled while allowing levels beyond H6 when disabled.
- **Heading hierarchy context**
  - Refactored heading-level propagation around `HeadingLevelCtx` and `useHeadingLevel()`.
  - Added optional `h6Clamp` support, allowing applications to either clamp native headings at H6 or preserve normalized levels beyond H6.
  - Updated `Main`, `HeadingFragment`, and generated landmark regions (`Section`, `Article`, `Header`, `Aside`, and `Legend`) to inherit and optionally override the H6 clamping policy.
  - Updated `Heading` rendering to support normalized heading levels beyond H6 through ARIA semantics.
  - Added normalized heading hierarchy auditing and support for levels greater than H6.
  - Expanded test coverage for heading-level calculation, context propagation, H6 clamping, and normalized hierarchy validation.
- playwright test `InitialHeading` type has been relaxed to number to support headings greater than 6.

### Deprecated

- **`HeadingLevel`** (`shared/dom`): Deprecated in favor of `number` for normalized heading levels, allowing heading hierarchies to extend beyond the native H1–H6 range.
- **`HeadingCtx`** (`react`): Deprecated in favor of `HeadingLevelCtx`, which supports normalized heading levels and the configurable `h6Clamp` policy.
- **`useHeading`** (`react`): Deprecated in favor of `useHeadingLevel`, which returns the resolved normalized heading level together with the inherited `h6Clamp` policy.

## [0.2.1-test] - 2026-08-15

### Changed

- Refactored release and project scripts into a domain-oriented architecture.
- Standardized CLI task execution and asynchronous error handling.
- Removed import-time environment configuration side effects.
- Improved script test isolation and module reset behavior.
- Added comprehensive documentation for exported script APIs.

## [0.2.1] - 2026-08-13

### Fixed

- Fixed runtime and TypeScript declaration exports for Playwright testing utilities.
- Moved Playwright integration to
  `react-heading-manager/testing/playwright`.

### Changed

- Improved release-note extraction during publish workflows.
- Added strict version/tag consistency checks.

## [0.2.0-beta.3] - 2026-08-13

### Added

- Added strict release version validation.
- Improved changelog extraction for prerelease versions.

### Changed

- Updated release automation to determine npm distribution tags and prerelease state dynamically.

## [0.2.0-beta.2] - 2026-08-13

### Fixed

- Fixed release-note extraction for prerelease tags.
- Fixed changelog section boundary detection during publish workflows.

## [0.2.0-beta.1] - 2026-08-13

### Fixed

- Preserved Playwright module augmentation in generated TypeScript declarations.
- Improved TypeScript support for `toHaveValidHeadingHierarchy()`.

### Added

- Exported the `HeadingLevel` type for strongly typed heading-level inputs.

## [0.2.0] - 2026-08-11

### Breaking Changes

- Removed implicit Playwright matcher registration.
- Replaced automatic matcher initialization with explicit
  `registerPlaywright(customExpect?)`.
- Introduced the dedicated
  `react-heading-manager/testing/playwright` entry point.

### Added

- Added explicit Playwright matcher registration.
- Added support for custom Playwright `expect` instances.

### Fixed

- Fixed Playwright matcher type augmentation.
- Prevented Playwright types from leaking into core utility consumers.

## [0.1.1] - 2026-08-11

### Security

- Migrated npm publishing authentication from static tokens to npm OIDC Trusted Publishers.

## [0.1.0] - 2026-08-11

### Added

- Introduced context-driven heading hierarchy management.
- Added `<Heading>`, `<Main>`, `<Section>`, `<Article>`, `<Header>`, `<Aside>`, and `<Legend>` components.
- Added `<HeadingFragment>` for non-rendering heading context boundaries.
- Added `createRegion()` for custom landmark components.
- Added `useHeading()` and `HeadingCtx` for advanced integrations.
- Added framework-agnostic DOM parsing and heading auditing utilities.
- Added Playwright heading hierarchy assertions.
- Added shared TypeScript types.
- Added ESM, CommonJS, and TypeScript declaration builds.
- Added Next.js App Router compatibility.
- Added comprehensive automated tests and accessibility-oriented auditing.

[Unreleased]: https://github.com/vickbk/heading-manager/compare/v0.2.1...HEAD
[0.3.0]: https://github.com/vickbk/heading-manager/releases/tag/v0.3.0
[0.2.1-test]: https://github.com/vickbk/heading-manager/releases/tag/v0.2.1-test
[0.2.1]: https://github.com/vickbk/heading-manager/releases/tag/v0.2.1
[0.2.0-beta.3]: https://github.com/vickbk/heading-manager/releases/tag/v0.2.0-beta.3
[0.2.0-beta.2]: https://github.com/vickbk/heading-manager/releases/tag/v0.2.0-beta.2
[0.2.0-beta.1]: https://github.com/vickbk/heading-manager/releases/tag/v0.2.0-beta.1
[0.2.0]: https://github.com/vickbk/heading-manager/releases/tag/v0.2.0
[0.1.1]: https://github.com/vickbk/heading-manager/releases/tag/v0.1.1
[0.1.0]: https://github.com/vickbk/heading-manager/releases/tag/v0.1.0
[Keep a Changelog]: https://keepachangelog.com/en/0.1.0/
[Semantic Versioning]: https://semver.org/spec/v2.0.0.html
