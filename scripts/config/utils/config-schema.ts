import { normalizePath } from "@/scripts/shared/normalize-path";
import path from "node:path";
import { z } from "zod";

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
  }),
});
