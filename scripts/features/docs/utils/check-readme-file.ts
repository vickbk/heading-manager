import { readTextFile } from "@/scripts/core/files";
import type { FileValidationResult, ReadmeTarget } from "../types";
import { checkReadmeSections } from "./check-readme-sections";

/**
 * Validates a single README file against its contract.
 * Throws manageable domain errors for I/O and parser failures.
 */
export async function checkReadmeFile(
  target: ReadmeTarget,
): Promise<FileValidationResult> {
  const { path, contract } = target;

  const content: string = await readTextFile(path);

  const result = checkReadmeSections(content, contract);
  return { path, result };
}
