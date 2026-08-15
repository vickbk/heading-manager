# GitHub Actions Integration

This directory wraps the GitHub Actions environment and REST API interactions used by release and coverage scripts. It is the boundary between workflow runtime data and the repository's domain logic.

## Overview

The GitHub layer is responsible for:

- reading event payload metadata for pull requests,
- writing workflow variables to `$GITHUB_ENV`,
- writing markdown to `$GITHUB_STEP_SUMMARY`,
- creating or updating PR comments,
- authenticating GitHub REST requests with the proper headers.

## Key modules

| File                                                         | Responsibility                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [index.ts](./index.ts)                                       | Public GitHub helper barrel export.                                     |
| [types.ts](./types.ts)                                       | Defines the payload and config contracts used by the GitHub helpers.    |
| [utils/get-headers.ts](./utils/get-headers.ts)               | Builds the standard GitHub REST API headers.                            |
| [utils/git-env.ts](./utils/git-env.ts)                       | Validates `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, and `GITHUB_EVENT_PATH`. |
| [utils/github-write-env.ts](./utils/github-write-env.ts)     | Appends workflow variables to `$GITHUB_ENV`.                            |
| [utils/write-step-summary.ts](./utils/write-step-summary.ts) | Appends markdown to `$GITHUB_STEP_SUMMARY`.                             |
| [utils/comment-action.ts](./utils/comment-action.ts)         | Creates or updates a PR comment via the GitHub Issues API.              |
| [utils/get-comment.ts](./utils/get-comment.ts)               | Finds an existing comment by identifier before updating it.             |

## Required environment variables

- `GITHUB_TOKEN`
- `GITHUB_REPOSITORY`
- `GITHUB_EVENT_PATH`
- `GITHUB_ENV` (for env exports)
- `GITHUB_STEP_SUMMARY` (for step summary writes)
- `GITHUB_REF_NAME` or `RELEASE_VERSION` (for release workflows)

## Usage example

```ts
import {
  getGithubParams,
  writeStepSummary,
  githubWriteEnv,
} from "../core/github";

const config = getGithubParams();
writeStepSummary("## Coverage report\n- Done");
githubWriteEnv({ TOTAL_PCT: 96.5 });
```
