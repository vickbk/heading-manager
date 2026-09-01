import { unwrapReadmeErrorMessages } from "./unwrap-readme-errors-messages";

/**
 * Standardized CLI prefix for README validation failures.
 * The caller uses this text to label the final formatted fatal-error output.
 */
export const HEADER_TEXT = "❌ [Readme Check] Fatal Error:";

/**
 * Formats any nested README validation error tree into a single CLI-safe string.
 *
 * The function recursively unwraps AggregateError instances, formats
 * ReadmeValidationError entries with their custom detail block, and falls back to
 * the generic error-message helper for everything else. When the unwrapped list is
 * empty, it returns an empty string instead of printing anything.
 *
 * @param error - The thrown value, nested aggregate, or primitive rejection to format.
 * @returns A formatted fatal-error block prefixed with HEADER_TEXT, or an empty
 * string when no messages are available.
 */
export function handleReadmeCliError(error: unknown): string {
  const formattedMessages = unwrapReadmeErrorMessages(error);

  if (formattedMessages.length === 0) {
    return "";
  }

  const body = formattedMessages.join("\n\n" + "-".repeat(50) + "\n\n");

  return `${HEADER_TEXT}\n\n${body}`;
}
