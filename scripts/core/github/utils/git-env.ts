import { config } from "@/scripts/config";
import fs from "node:fs";
import { GithubParams } from "../types";

export function getGithubParams(): GithubParams {
  const { token, repository, eventPath, runId } = config.github;

  if (!token || !repository || !eventPath) {
    throw new Error(
      "[GithubEnv] Missing required environment variables (GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_EVENT_PATH).",
    );
  }

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
