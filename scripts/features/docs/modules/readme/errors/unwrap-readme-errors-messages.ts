import { getErrorMessage } from "@/scripts/core/errors";
import { formatReadmeValidationError } from "./format/format-readme-validation-error";
import { ReadmeValidationError } from "./readme-validation-error";

/**
 * Recursively unwraps AggregateError instances.
 * Formats ReadmeValidationErrors specifically and delegates all other generic errors
 * to getErrorMessage.
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
