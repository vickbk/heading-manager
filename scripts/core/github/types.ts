/**
 * GitHub issue comment payload returned by the REST API.
 */
export type GitHubComment = {
  id: number;
  body: string;
};

/**
 * Repository and auth metadata required for pull-request comment operations.
 */
export type ApiConfig = {
  token: string;
  repository: string;
  prNumber: number;
};

/**
 * Runtime data loaded from the current GitHub Actions event and environment.
 */
export type GithubParams = {
  token: string;
  repository: string;
  prNumber: number;
  runId?: string;
};
