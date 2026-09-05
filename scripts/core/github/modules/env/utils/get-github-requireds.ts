import { config } from "@/scripts/config";

export function getGithubRequireds() {
  const { token, repository, eventPath } = config.github;

  if (!token || !repository || !eventPath) {
    throw new Error(
      "[GithubEnv] Missing required environment variables (GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_EVENT_PATH).",
    );
  }

  return { ...config.github, token, repository, eventPath };
}
