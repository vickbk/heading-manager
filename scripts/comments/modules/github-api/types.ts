export type GitHubComment = {
  id: number;
  body: string;
};

export type ApiConfig = {
  token: string;
  repository: string;
  prNumber: number;
};

export type GithubParams = {
  token: string;
  repository: string;
  prNumber: number;
  runId?: string;
};
