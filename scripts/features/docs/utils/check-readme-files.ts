import type { FileValidationResult, ReadmeTarget } from "../types";
import { checkReadmeFile } from "./check-readme-file";

export async function checkReadmeFiles(
  ...targets: ReadmeTarget[]
): Promise<FileValidationResult[]> {
  return Promise.all(targets.map((target) => checkReadmeFile(target)));
}
