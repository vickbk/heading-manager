export type CoverageMetric = {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
};

export type CoverageSummaryJson = {
  total: {
    lines: CoverageMetric;
    statements: CoverageMetric;
    functions: CoverageMetric;
    branches: CoverageMetric;
  };
};

export type CoverageReport = {
  totalPct: string;
  commentBody: string;
  markdownSummary: string;
};
