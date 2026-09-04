import { Config } from "../types";
import { configSchema } from "./config-schema";

let cachedConfig: Config | null = null;

/**
 * Clears the memoized configuration so tests and isolated execution contexts can re-resolve environment values.
 *
 * @returns void - Resets the cached config singleton.
 */
export const resetConfig = (): void => {
  cachedConfig = null;
};

/**
 * Reads the current process environment, validates it against the workflow schema, and returns a cached config object.
 *
 * @returns The resolved workflow configuration for GitHub Actions metadata, file paths, and runtime flags.
 * @throws {Error} When required configuration values are invalid or fail schema validation.
 */
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
      package: process.env.PACKAGE,
    },
    docs: {
      hasRun: process.env.DOCS_HAS_RUN,
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
