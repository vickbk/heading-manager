# Error Handling Core

This directory centralizes fatal error normalization and CLI task execution guards. It keeps runtime failure behavior consistent across the automation scripts and prevents feature modules from owning process-level shutdown logic.

## Overview

The `core/errors` boundary is responsible for:

- recognizing whether the current process is the correct CLI entrypoint,
- running tasks in a guarded, catchable environment,
- formatting fatal messages in a consistent way,
- terminating the process when the CLI must stop.

## Key modules

| File                                                   | Responsibility                                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [index.ts](./index.ts)                                 | Re-exports the task runner for consumers.                                                   |
| [types.ts](./types.ts)                                 | Declares the fatal log formatter contract.                                                  |
| [utils/run-task.ts](./utils/run-task.ts)               | Matches the current script to a configured task and calls `handleFatalError` on exceptions. |
| [utils/handle-fatal-error.ts](./handle-fatal-error.ts) | Normalizes the error and calls `process.exit` with a code.                                  |
| [utils/get-error-message.ts](./get-error-message.ts)   | Extracts a readable failure string from `Error` objects or unknown values.                  |

## Usage example

```ts
import { runTask } from "../core/errors";

await runTask(
  "extract-release-note",
  async () => {
    // feature logic
  },
  "[Release Note] Fatal Error",
);
```

## Error strategy

- Domain functions should throw plain `Error` objects or structured values.
- The CLI boundary should handle system-level failure semantics.
- `process.exit` is intentionally kept at the edge, not in the feature modules.
