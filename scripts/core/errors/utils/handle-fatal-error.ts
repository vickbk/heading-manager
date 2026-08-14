import process from "node:process";
import { LogFormatter } from "../types";
import { getErrorMessage } from "./get-error-message";

/**
 * Normalizes an error, logs a formatted fatal message to console.error, and terminates the process.
 *
 * @param error - The caught error object
 * @param prefixOrFormatter - Prefix string (defaults to "Fatal Error") or custom template function
 * @param exitCode - Process exit code (defaults to 1)
 * @returns never - Signals to TypeScript control flow that execution halts
 */
export function handleFatalError(
  error: unknown,
  prefixOrFormatter: LogFormatter = "Fatal Error",
  exitCode = 1,
): never {
  const message = getErrorMessage(error);

  const formattedLog =
    typeof prefixOrFormatter === "function"
      ? prefixOrFormatter(message)
      : `${prefixOrFormatter}: ${message}`;

  console.error(formattedLog);
  process.exit(exitCode);
}
