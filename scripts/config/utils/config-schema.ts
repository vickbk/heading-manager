import { normalizePath } from "@/scripts/shared/normalize-path";
import path from "node:path";
import { z } from "zod";

/**
 * Validates and normalizes the runtime configuration used by workflow automation scripts.
 * The schema resolves working directories, GitHub action paths, and file-system paths consistently across local and CI runs.
 */
export const configSchema = z.object({
  cwd: z
    .string("Current working directory must be a string")
    .transform((wPath) => normalizePath(wPath, true)),

  isCI: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),

  github: z.object({
    stepSummaryPath: z.string().default(""),
    envPath: z.string().default(""),
    refName: z.string().default(""),

    token: z.string().optional(),
    repository: z.string().optional(),
    eventPath: z.string().optional(),

    runId: z.string().optional(),
    stepSummaryFile: z.string().optional(),
  }),

  paths: z.object({
    vitestReport: z
      .string()
      .default("coverage/coverage-summary.json")
      .transform((relPath) =>
        normalizePath(path.resolve(process.cwd(), relPath)),
      ),
    changelog: z
      .string()
      .default("CHANGELOG.md")
      .transform((relPath) =>
        normalizePath(path.resolve(process.cwd(), relPath)),
      ),
    releaseChangelog: z
      .string()
      .default("RELEASE_CHANGELOG.md")
      .transform((relPath) =>
        normalizePath(path.resolve(process.cwd(), relPath)),
      ),
    package: z
      .string()
      .default("package.json")
      .transform((relPath) =>
        normalizePath(path.resolve(process.cwd(), relPath)),
      ),
  }),
  docs: z.object({
    hasRun: z
      .string()
      .optional()
      .transform((val) => ["success", "failure"].includes(val || "")),
  }),
});
