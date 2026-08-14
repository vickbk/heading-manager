import { Config } from "../types";
import { configSchema } from "./config-schema";

let cachedConfig: Config | null = null;

/**
 * Resets the cached configuration. Essential for test isolation in Vitest/Jest.
 */
export const resetConfig = (): void => {
  cachedConfig = null;
};

export const getConfig = (): Config => {
  if (cachedConfig) return cachedConfig;

  const cwd = process.cwd();

  const parsed = configSchema.safeParse({
    cwd,
    isCI: process.env.CI,
    github: {
      stepSummaryPath: process.env.GITHUB_STEP_SUMMARY,
      envPath: process.env.GITHUB_ENV,
      refName: process.env.GITHUB_REF_NAME || process.env.RELEASE_VERSION,
      token: process.env.GITHUB_TOKEN,
      repository: process.env.GITHUB_REPOSITORY,
      eventPath: process.env.GITHUB_EVENT_PATH,
      runId: process.env.GITHUB_RUN_ID,
      stepSummaryFile: process.env.GITHUB_STEP_SUMMARY,
    },
    paths: {
      vitestReport: process.env.COVERAGE_PATH,
      changelog: process.env.CHANGELOG_PATH,
      releaseChangelog: process.env.RELEASE_CHANGELOG_PATH,
    },
  });

  if (!parsed.success) {
    const errorMessages = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }

  cachedConfig = parsed.data;
  return cachedConfig;
};
