import process from "node:process";
import { LogFormatter } from "../types";
import { getErrorMessage } from "./get-error-message";

/**
 * Logs a formatted fatal error message to console.error and terminates the process.
 *
 * @param error - The caught raw error object
 * @param prefixOrFormatter - Prefix string (defaults to "Fatal Error") or custom error formatter function
 * @param exitCode - Process exit code (defaults to 1)
 * @returns never - Signals to TypeScript control flow that execution halts
 */
export function handleFatalError(
  error: unknown,
  prefixOrFormatter: LogFormatter = "Fatal Error",
  exitCode = 1,
): never {
  const formattedLog =
    typeof prefixOrFormatter === "function"
      ? prefixOrFormatter(error)
      : `${prefixOrFormatter}: ${getErrorMessage(error)}`;

  console.error(formattedLog);
  process.exit(exitCode);
}
