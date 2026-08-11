import fs from "node:fs";
import { GithubParams } from "../types";

export function getGithubParams(): GithubParams {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const runId = process.env.GITHUB_RUN_ID;

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
