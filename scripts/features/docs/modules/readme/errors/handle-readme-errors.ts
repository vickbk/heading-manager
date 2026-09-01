import { unwrapReadmeErrorMessages } from "./unwrap-readme-errors-messages";

export const HEADER_TEXT = "❌ [Readme Check] Fatal Error:";

/**
 * Main CLI orchestrator: Unwraps all errors, formats them into a unified block with a standard header prefix.
 */
export function handleReadmeCliError(error: unknown): string {
  const formattedMessages = unwrapReadmeErrorMessages(error);

  if (formattedMessages.length === 0) {
    return "";
  }

  const body = formattedMessages.join("\n\n" + "-".repeat(50) + "\n\n");

  return `${HEADER_TEXT}\n\n${body}`;
}
