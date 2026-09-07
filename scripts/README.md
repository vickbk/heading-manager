# Scripts Automation Overview

This directory contains the repository's CI workflow entrypoints and custom automation helpers for release generation, Vitest coverage reporting, documentation contract validation, and GitHub Actions integration powered by `@vickbk/ci-tools`.

## Architecture map

```text
scripts/
├── bin/                    # Executable CLI entrypoints invoked by pnpm or GitHub Actions
├── features/               # Repository-specific custom workflow helpers and domain logic
└── README.md               # This file
```

> **Note**: Core CI primitives, GitHub Actions API integrations, coverage parsers, and error handling guards are provided directly by `@vickbk/ci-tools`. Local extension code and custom bot policies belong in `scripts/features/`.

---

## Prerequisites

The scripts are designed to run under Node.js with TypeScript execution via `tsx` or standard Node execution.

Required runtime context:

- Node.js 20+
- `pnpm` workspace dependencies installed (including `@vickbk/ci-tools`)
- GitHub Actions environment variables populated in CI workflows
- Repository checkout with `CHANGELOG.md` and `package.json` present

## Environment variables

Standard environment variables consumed by `@vickbk/ci-tools` modules:

| Variable              | Required                | Used by Module              | Description                                                  |
| --------------------- | ----------------------- | --------------------------- | ------------------------------------------------------------ |
| `GITHUB_TOKEN`        | Yes for PR comments     | `@vickbk/ci-tools/github`   | GitHub API token with repository and PR write permissions    |
| `GITHUB_REPOSITORY`   | Automatically set in CI | `@vickbk/ci-tools/github`   | Target repository in `owner/repo` format                     |
| `GITHUB_EVENT_PATH`   | Automatically set in CI | `@vickbk/ci-tools/github`   | Path to event payload JSON (e.g. pull request event context) |
| `GITHUB_REF_NAME`     | Automatically set in CI | `@vickbk/ci-tools/releases` | Git branch or tag name used for release metadata resolution  |
| `GITHUB_STEP_SUMMARY` | Optional in CI          | `@vickbk/ci-tools/vitest`   | Path for appending step summary Markdown in GitHub Actions   |
| `GITHUB_ENV`          | Optional in CI          | `@vickbk/ci-tools/core`     | Path for exporting workflow environment variables            |

## Command reference

| Command / trigger       | Script entry                                | Primary `@vickbk/ci-tools` Export | Purpose                                                        |
| ----------------------- | ------------------------------------------- | --------------------------------- | -------------------------------------------------------------- |
| `pnpm release-note`     | `scripts/bin/extract-release-note.ts`       | `@vickbk/ci-tools/releases`       | Extracts changelog notes for a target version                  |
| `pnpm release-tag`      | `scripts/bin/extract-version-tag.ts`        | `@vickbk/ci-tools/releases`       | Resolves dist-tag metadata and exports to GitHub environment   |
| `pnpm comment`          | `scripts/bin/post-vitest-coverage.ts`       | `@vickbk/ci-tools/vitest`         | Posts or updates a sticky PR coverage comment                  |
| `pnpm coverage-summary` | `scripts/bin/coverage-summary.ts`           | `@vickbk/ci-tools/vitest`         | Generates coverage Markdown summary and exports `TOTAL_PCT`    |
| `pnpm readme-check`     | `scripts/bin/documentation/readme-check.ts` | `@vickbk/ci-tools/docs`           | Validates repository README files against structural contracts |

## Usage examples

```bash
# Generate release notes from CHANGELOG.md for a version
pnpm release-note

# Resolve and write npm dist-tag metadata to GitHub environment
pnpm release-tag

# Emit the Vitest coverage summary markdown for CI
pnpm coverage-summary

# Post or update the sticky coverage comment on a PR
pnpm comment

# Check README files against documentation contracts
pnpm readme-check

```

## Design principles

- **Thin CLI Entrypoints**: Keep `scripts/bin/*` files thin by wrapping callbacks with `runTask` from `@vickbk/ci-tools/core`.
- **Single Responsibility**: Maintain dedicated, single-purpose CLI tasks (e.g., separate contract checks from PR commenting).
- **Custom Extensibility**: Place repository-specific automation helpers inside `scripts/features/` while importing primitives from `@vickbk/ci-tools`.
- **Natural Error Propagation**: Let tasks fail naturally so that `runTask` exits with a non-zero exit code to fail CI steps on errors.

## External Documentation

- [`@vickbk/ci-tools` Package Documentation](https://github.com/vickbk/ci-tools%23readme)
- [Vitest Module API (`@vickbk/ci-tools/vitest`)](https://github.com/vickbk/ci-tools/blob/main/src/features/vitest/README.md)
- [Docs Contract Module API (`@vickbk/ci-tools/docs`)](https://github.com/vickbk/ci-tools/blob/main/src/features/docs/README.md)
- [GitHub Module API (`@vickbk/ci-tools/github`)](https://github.com/vickbk/ci-tools/blob/main/src/core/github/README.md)
- [Releases Module API (`@vickbk/ci-tools/releases`)](https://github.com/vickbk/ci-tools/blob/main/src/features/releases/README.md)
- [Core Utilities API (`@vickbk/ci-tools/core`)](https://github.com/vickbk/ci-tools/blob/main/src/core/README.md)

```

```

```

```
