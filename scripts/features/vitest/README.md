# Vitest Coverage Reporting

This feature module handles the conversion of Vitest coverage output into GitHub-friendly summary content and pull-request comments.

## Overview

The coverage subsystem is responsible for:

- reading the generated coverage summary JSON,
- building markdown tables and step-summary output,
- exporting `TOTAL_PCT` into the workflow environment,
- finding or updating a sticky PR comment for the current run,
- keeping the report content deterministic and readable.

## Key modules

| File                                                                       | Responsibility                                             |
| -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [index.ts](./index.ts)                                                     | Public export surface for coverage workflow actions.       |
| [types.ts](./types.ts)                                                     | Type contracts for coverage metrics and report payloads.   |
| [utils/format.ts](./utils/format.ts)                                       | Builds markdown rows for coverage tables.                  |
| [utils/report.ts](./utils/report.ts)                                       | Parses coverage JSON and assembles summary/comment output. |
| [utils/generate-coverage-summary.ts](./utils/generate-coverage-summary.ts) | Writes summary output and env export data.                 |
| [utils/post-coverage-comment.ts](./utils/post-coverage-comment.ts)         | Creates or updates the PR coverage comment.                |

## Usage example

```ts
import {
  generateCoverageSummary,
  postCoverageComment,
} from "../features/vitest";

generateCoverageSummary();
await postCoverageComment();
```

## Required environment variables

- `GITHUB_TOKEN`
- `GITHUB_REPOSITORY`
- `GITHUB_EVENT_PATH`
- `GITHUB_ENV`
- `GITHUB_STEP_SUMMARY`
- optionally `COVERAGE_PATH`
