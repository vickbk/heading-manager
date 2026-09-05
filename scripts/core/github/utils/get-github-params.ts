import fs from "node:fs";
import { getGithubRequireds } from "../modules/env";
import { GithubParams } from "../types";

/**
 * Reads the GitHub Actions event payload and validates the subset of environment values required to act on a pull request.
 *
 * @returns The repository, token, pull request number, and run metadata necessary for workflow actions.
 * @throws {Error} When required environment variables are missing, the event file cannot be read, or the payload is not attached to a pull request.
 */
export function getGithubParams(): GithubParams {
  const { token, repository, eventPath, runId } = getGithubRequireds();

  if (!fs.existsSync(eventPath)) {
    throw new Error(
      `[GithubEnv] Event payload file not found at path: "${eventPath}"`,
    );
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  const prNumber = eventData.pull_request?.number;

  if (!prNumber) {
    throw new Error(
      "[GithubEnv] Event payload is not associated with a Pull Request.",
    );
  }

  return { token, repository, prNumber, runId };
}
