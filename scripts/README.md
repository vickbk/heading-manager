# Scripts Automation Overview

This directory contains the repository's automation and workflow helpers for release generation, coverage reporting, and GitHub Actions integration.

## Architecture map

```text
scripts/
├── bin/                     # CLI entrypoints for workflow execution
├── config/                  # Environment validation and runtime config
├── core/
│   ├── errors/              # Fatal error handling and CLI task guard
│   └── github/              # GitHub API and Actions environment helpers
├── features/
│   ├── releases/            # Changelog and package-release automation
│   └── vitest/              # Coverage summary and PR comment reporting
├── shared/                  # Reusable path normalization utilities
├── tasks.md                 # Planning notes for the refactor
└── README.md                # This file
```

## Prerequisites

The scripts are designed to run under Node.js with TypeScript execution via `tsx`.

Required runtime context:

- Node.js 20+
- `pnpm` workspace dependencies installed
- GitHub Actions environment variables when run in CI
- A repository checkout with `CHANGELOG.md` and `package.json` available

## Environment variables

| Variable                 | Required                   | Used by                      | Description                                               |
| ------------------------ | -------------------------- | ---------------------------- | --------------------------------------------------------- |
| `GITHUB_REF_NAME`        | Usually                    | release and config utilities | Git branch or tag name in CI                              |
| `RELEASE_VERSION`        | Conditional fallback       | release utilities            | Release version override when `GITHUB_REF_NAME` is absent |
| `GITHUB_TOKEN`           | Yes for PR comment actions | `core/github`                | GitHub API token with repo and PR write permissions       |
| `GITHUB_REPOSITORY`      | Yes for PR actions         | `core/github`                | Repository slug in `owner/repo` format                    |
| `GITHUB_EVENT_PATH`      | Yes for PR actions         | `core/github`                | Event payload JSON path                                   |
| `GITHUB_ENV`             | Optional                   | `githubWriteEnv`             | File path for workflow environment exports                |
| `GITHUB_STEP_SUMMARY`    | Optional                   | `writeStepSummary`           | File path for GitHub step summary output                  |
| `COVERAGE_PATH`          | Optional                   | config schema                | Coverage summary JSON path                                |
| `CHANGELOG_PATH`         | Optional                   | config schema                | Project changelog path                                    |
| `RELEASE_CHANGELOG_PATH` | Optional                   | config schema                | Extracted release notes output path                       |
| `PACKAGE`                | Optional                   | config schema                | Package manifest path                                     |

## Command reference

| Command / trigger       | Script entry                          | Purpose                                                            |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `pnpm release-note`     | `scripts/bin/extract-release-note.ts` | Extracts changelog notes for a release version                     |
| `pnpm release-tag`      | `scripts/bin/extract-version-tag.ts`  | Resolves dist-tag metadata and writes it to the GitHub environment |
| `pnpm comment`          | `scripts/bin/post-vitest-coverage.ts` | Posts or updates a PR coverage comment                             |
| `pnpm coverage-summary` | `scripts/bin/coverage-summary.ts`     | Produces the summary markdown and exports `TOTAL_PCT`              |
| `pnpm test --coverage`  | Vitest                                | Runs the project test suite and coverage generation                |

## Usage examples

```bash
# Generate release notes from CHANGELOG.md
pnpm release-note

# Resolve and write npm dist tag metadata
pnpm release-tag

# Emit the coverage summary markdown for CI
pnpm coverage-summary

# Post or update the sticky coverage comment on a PR
pnpm comment
```

## Design principles

- Keep CLI entrypoints thin and structured around `runTask`.
- Keep domain logic in `features/*` instead of mixing environment concerns into the runnable scripts.
- Keep GitHub Actions interaction isolated in `core/github`.
- Keep fatal error handling centralized in `core/errors`.
- Validate runtime state via `config` before feature execution.

## Related files

- [bin/README.md](./bin/README.md)
- [core/errors/README.md](./core/errors/README.md)
- [core/github/README.md](./core/github/README.md)
- [features/releases/README.md](./features/releases/README.md)
- [features/vitest/README.md](./features/vitest/README.md)
