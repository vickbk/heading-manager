import path from "node:path";
import process from "node:process";
import { LogFormatter } from "../types";
import { handleFatalError } from "./handle-fatal-error";

/**
 * Executes a CLI task wrapped in fatal error handling ONLY if the running script's path
 * matches the specified script identifier (process.argv[1]).
 *
 * @param scriptName - Substring or filename to match against process.argv[1]
 * @param task - Sync or async callback function to execute
 * @param errorPrefix - Custom prefix or formatter (defaults to `❌ [scriptName] Fatal Error`)
 */
export async function runTask<T>(
  scriptName: string,
  task: () => T | Promise<T>,
  errorPrefix?: LogFormatter,
): Promise<T | undefined> {
  const entryScript = process.argv[1];

  if (!entryScript) {
    return undefined;
  }

  const { name, base } = path.parse(entryScript);

  // Exact comparison against file stem ("extract-version-tag") or full filename ("extract-version-tag.ts")
  const isMatch = scriptName === name || scriptName === base;

  if (!isMatch) {
    return undefined;
  }

  const resolvedPrefix = errorPrefix ?? `❌ [${scriptName}] Fatal Error`;

  try {
    return await task();
  } catch (error) {
    handleFatalError(error, resolvedPrefix);
  }
}
