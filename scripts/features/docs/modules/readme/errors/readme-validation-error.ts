import type { ReadmeSectionValidationResult } from "../types";

export class ReadmeValidationError extends Error {
  readonly path: string;
  readonly result: ReadmeSectionValidationResult;

  constructor(path: string, result: ReadmeSectionValidationResult) {
    const failureCount = result.diagnostics.length;
    super(
      `README validation failed for "${path}" with ${failureCount} diagnostic issue(s).`,
    );

    this.name = "ReadmeValidationError";
    this.path = path;
    this.result = result;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ReadmeValidationError);
    }
  }
}
