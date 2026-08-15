# Release Automation

This feature module handles release-note extraction, version normalization, and dist-tag publication metadata for the repository's workflow automation.

## Overview

The release subsystem is responsible for:

- resolving version tags from CLI arguments or environment variables,
- validating version alignment with `package.json`,
- parsing target sections from `CHANGELOG.md`,
- writing extracted notes to a release output file,
- exporting the correct npm dist-tag for publishing.

## Key modules

| File                                                 | Responsibility                                             |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| [index.ts](./index.ts)                               | Public barrel for release entrypoints.                     |
| [types.ts](./types.ts)                               | Input options for changelog extraction.                    |
| [utils/version-tag.ts](./utils/version-tag.ts)       | Resolves and normalizes release versions.                  |
| [utils/release-type.ts](./utils/release-type.ts)     | Maps versions to prerelease and dist-tag metadata.         |
| [utils/assert-version.ts](./utils/assert-version.ts) | Validates package version and tag alignment.               |
| [utils/changelog.ts](./utils/changelog.ts)           | Extracts the markdown section for a target version.        |
| [utils/extract-note.ts](./utils/extract-note.ts)     | Writes release notes to the configured output path.        |
| [utils/write-dist-tag.ts](./utils/write-dist-tag.ts) | Writes the computed dist-tag to GitHub Actions env output. |

## Usage example

```ts
import {
  extractReleaseNotes,
  writeDistTagToGithubOutput,
} from "../features/releases";

const outputPath = extractReleaseNotes({ versionTag: "1.2.3" });
writeDistTagToGithubOutput();
```

## Environment variables

- `GITHUB_REF_NAME`
- `RELEASE_VERSION`
- `GITHUB_ENV`
- `PACKAGE` (optional override)

These values are resolved by the config layer before the feature logic executes.
