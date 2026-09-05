import type { ReadmeSectionValidationResult } from "../types";

/**
 * Error raised when a README fails contract validation.
 *
 * The instance preserves the offending file path and the normalized validation
 * result so downstream formatters can render all missing sections and diagnostics.
 */
export class ReadmeValidationError extends Error {
  /** File path associated with the failed validation. */
  readonly path: string;

  /** Aggregated validation outcome for the failing README. */
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
