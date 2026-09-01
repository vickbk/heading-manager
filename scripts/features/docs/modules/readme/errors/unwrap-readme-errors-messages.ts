import { getErrorMessage } from "@/scripts/core/errors";
import { formatReadmeValidationError } from "./format/format-readme-validation-error";
import { ReadmeValidationError } from "./readme-validation-error";

/**
 * Flattens nested AggregateError values into a depth-first list of formatted messages.
 *
 * Each ReadmeValidationError is rendered through its dedicated formatter, while every
 * other value falls back to getErrorMessage. This preserves the original error tree
 * ordering while converting the final payload to plain strings for the CLI renderer.
 *
 * @param error - The error tree or value to unwrap.
 * @returns A flattened array of formatted error strings suitable for CLI output.
 */
export function unwrapReadmeErrorMessages(error: unknown): string[] {
  if (error instanceof AggregateError) {
    return error.errors.flatMap((innerError) =>
      unwrapReadmeErrorMessages(innerError),
    );
  }

  if (error instanceof ReadmeValidationError) {
    return [formatReadmeValidationError(error)];
  }

  return [getErrorMessage(error)];
}
