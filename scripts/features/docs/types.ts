import { DocumentationContract } from "@/docs/types";
import type { ReadmeSectionValidationResult } from "./modules/readme/types";

export type ReadmeTarget = {
  path: string;
  contract: DocumentationContract;
};

export type FileValidationResult = {
  path: string;
  result?: ReadmeSectionValidationResult;
  error?: string;
};
