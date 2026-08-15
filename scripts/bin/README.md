# CLI Entrypoints

This directory contains the executable workflow entrypoints. Each file is intentionally small: it selects the correct task using the `runTask` guard and then delegates domain work to a feature module.

## Overview

The scripts in this directory are not business-logic implementations. They are thin adapters that:

1. resolve the current runtime script name,
2. match it to a known script identifier,
3. invoke the requested feature task,
4. delegate any fatal errors to the shared error handler.

## Key modules

| File                                                 | Responsibility                                                        |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| [coverage-summary.ts](./coverage-summary.ts)         | Runs the coverage summary generator.                                  |
| [extract-release-note.ts](./extract-release-note.ts) | Extracts release notes from the changelog for a version.              |
| [extract-version-tag.ts](./extract-version-tag.ts)   | Resolves the npm dist-tag and writes it to GitHub Actions env output. |
| [post-vitest-coverage.ts](./post-vitest-coverage.ts) | Posts or updates a sticky coverage comment on a pull request.         |

## Invocation pattern

```ts
import { runTask } from "../core/errors";
import { generateCoverageSummary } from "../features/vitest";

await runTask(
  "coverage-summary",
  generateCoverageSummary,
  "[Coverage Script] Fatal Error",
);
```

## Environment prerequisites

Each entrypoint expects the same general workflow context:

- a valid repository checkout,
- Node execution via `tsx` or the package scripts,
- required environment variables for the target feature,
- a valid `process.argv[1]` match for the `runTask` guard.

## Typical execution

```bash
pnpm coverage-summary
pnpm release-note
pnpm release-tag
pnpm comment
```
