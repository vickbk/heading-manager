# Documentation Guardrails Roadmap

This document defines the planned documentation-guardrail system for the `react-heading-manager` package. It is a design and implementation roadmap only; it does not represent a currently implemented validator or CI job.

The purpose of the guardrails is to keep package documentation aligned with the actual product surface and repository structure. In practice, these guardrails are intended to prevent:

- missing documentation
- documentation drift
- stale package entry-point documentation
- undocumented public API changes
- broken documentation links
- stale or invalid examples
- missing release/change documentation
- architecture documentation drift

The guardrail system should be introduced in stages so each layer has a clear responsibility and a known implementation boundary.

## Design principles

The documentation guardrails are intentionally divided into layers:

- `docs/documentation-contract.ts` defines the declarative documentation requirements.
- `docs/implementation.md` defines the roadmap, design intent, and planned enforcement phases.
- `scripts/docs/*` will later implement validation logic and automation.

This separation keeps the contract readable and reusable while leaving enforcement work for future implementation tasks.

## Phase 1 — Core Documentation Guardrails

Status: Planned

### 1. Required README sections

The initial guardrail concept is a documentation contract: a package-level declaration of the documentation sections that are expected to exist, their relative importance, and their relationship to the package surface.

This contract distinguishes between:

- required sections: documentation that is expected to be present for the package to be considered complete
- recommended or conditional sections: useful documentation that may be present depending on package scope, maturity, or release context
- package-specific sections: sections that describe the actual package’s public surface and supported workflows

For this package, the initial expected README structure is:

```text
Identity
Quick Start
Features
Installation
Usage
API & Entry Points
Accessibility
Diagnostics
TypeScript Support
Testing
Architecture
Contributing
Changelog
License
```

At the contract level, the stable IDs are intentionally not based on visible Markdown heading text. Instead, the validator can map a package document to a section registry like:

- `identity`
- `quick-start`
- `features`
- `installation`
- `usage`
- `api`
- `accessibility`
- `diagnostics`
- `typescript`
- `testing`
- `architecture`
- `contributing`
- `changelog`
- `license`

The contract should make the distinction between mandatory and recommended sections machine-readable, but section existence alone should not be the only validation criterion. A document can contain a heading but still drift from the actual package behavior. For example:

- the README may mention an export that no longer exists
- a code sample may use an outdated import path
- a section may be present but no longer reflect the current public API or architecture

The future validator should therefore evolve from `section exists` to `section exists + correct content + correct examples + correct API references`.

### 2. README structure validation

A subsequent validation stage should parse README headings and interpret the package’s documented structure.

The future validator should eventually:

- parse README headings to identify documented sections
- map headings to stable section IDs in the documentation contract
- detect missing required sections
- detect stale or renamed sections
- identify optional sections that are absent but recommended for the package
- optionally validate ordering according to a preferred section sequence
- produce structured diagnostics with section IDs, missing sections, and ordering warnings

This stage is intentionally limited to structure and contract matching. It is not the same as validating the actual meaning or correctness of examples or code references.

### 3. Public entry-point documentation validation

The package exposes public entry points through `package.json` exports. The future guardrail should compare:

```text
package.json exports
        ↓
public package entry points
        ↓
README documentation
```

This should eventually detect:

- undocumented public entry points
- documented entry points that no longer exist
- stale import paths
- incorrect package subpaths
- drift between the published package surface and the README’s usage examples

For this package, the initial important public entry points include:

- the root package entry point: `react-heading-manager`
- the framework-agnostic utilities entry point: `react-heading-manager/utils`
- the Playwright integration entry point: `react-heading-manager/testing/playwright`

This validation should be future-facing and should not be implemented as part of this task.

### 4. Documentation links

The future link-validation stage should check for broken or stale documentation references.

This should eventually validate:

- internal README links
- referenced documentation files in the repository
- repository-relative links
- relevant anchors for headings and sections
- package/import references where practical

The goal is not only to detect dead links but to catch references that no longer align with the package structure or documentation organization.

### 5. Executable documentation examples

The package includes examples across multiple usage modes, including:

- React usage
- core utilities
- Playwright integration

The future guardrail should ensure those examples remain synchronized with the actual API surface. Important examples should eventually become executable and typechecked fixtures rather than remaining unverified Markdown snippets.

This should cover:

- React component examples
- utility-function usage
- Playwright matcher registration and assertions
- package import examples across supported entry points

This stage is explicitly out of scope for the current task.

## Phase 2 — API & Release Documentation Safety

Status: Planned

### Public API snapshots

A later phase should generate a machine-readable representation of the package’s public exports and track changes over time.

This system should eventually:

- generate a machine-readable snapshot of public exports
- track added exports
- track removed exports
- track changed signatures or type-level surface area
- detect breaking or non-breaking API changes
- require intentional snapshot updates when the public package contract changes

This is a safety net against undocumented API drift.

### Changelog/change metadata

Release-relevant changes should eventually be associated with structured change metadata.

The system should distinguish between:

- feature additions
- fixes
- API changes
- breaking changes
- internal-only changes

This is distinct from a manual changelog narrative and is intended as a structured metadata layer for future release and documentation checks.

### Breaking API detection

Breaking API changes should eventually require:

- explicit classification as breaking
- changelog or release documentation updates
- migration guidance when appropriate

This prevents major version changes from occurring without a documented explanation for consumers.

## Phase 3 — Architecture & Repository Guardrails

Status: Planned

The package architecture is intentionally layered:

```text
shared → core → adapters → main
```

The intended dependency direction is:

```text
src/shared
  ↓
src/core
  ↓
src/adapters
  ↓
src/main
```

This means:

- `src/shared` should contain framework-agnostic primitives and types
- `src/core` may depend on shared utilities, but not on adapters or main
- `src/adapters` may depend on shared and core code, but not on sibling adapters
- `src/main` depends on package-level public surfaces and re-export composition

A future architecture guardrail should detect forbidden dependency directions and prevent architecture drift.

The documentation system may also eventually use a documentation manifest to associate:

```text
public API
    ↓
documentation section
    ↓
examples
    ↓
additional documentation requirements
```

This manifest would help connect public exports to the sections that describe them and the examples that exercise them.

## Phase 4 — CI & Release Integration

Status: Planned

The documentation checks should eventually be integrated into a unified command conceptually similar to:

```bash
npm run docs:check
```

This command should eventually combine:

- README structure validation
- documentation links
- API documentation coverage
- public entry-point validation
- executable examples
- API snapshots
- changelog/change validation
- architecture and documentation consistency

The implementation of this command is explicitly out of scope for the current task.

## Phase 5 — Documentation Quality & Maintenance

Status: Planned

The final stage focuses on sustainable documentation quality and ownership.

Planned areas include:

- generated API/reference documentation
- documentation ownership and stewardship
- distinction between generated and manually maintained documentation
- contributor documentation workflow
- local documentation validation
- CI documentation requirements
- release documentation requirements

The goal is to make documentation maintenance a predictable part of the project workflow, not a late-stage cleanup task.

## Current implementation boundary

This document intentionally describes the future guardrail system, not the currently implemented automation.

At present, the repository establishes the foundation through:

- the package README as the current reference source
- the package export map as the current public entry-point contract
- the declarative package documentation contract in `docs/documentation-contract.ts`

No validation scripts, CI automation, or documentation parsers are being added in this task.

## Relationship to the documentation contract

The contract in `docs/documentation-contract.ts` defines what the package documentation is expected to include.

This roadmap explains how a future validation layer will enforce that contract across:

- section presence
- stale package entry documentation
- API coverage
- link integrity
- example validity
- release/change metadata
- architecture consistency

The contract remains declarative; the implementation layer remains separate and future-facing.
