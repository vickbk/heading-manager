/**
 * Coverage metric populated by the generated Vitest JSON summary.
 */
export type CoverageMetric = {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
};

/**
 * Raw Vitest JSON summary structure read from coverage-summary.json.
 */
export type CoverageSummaryJson = {
  total: {
    lines: CoverageMetric;
    statements: CoverageMetric;
    functions: CoverageMetric;
    branches: CoverageMetric;
  };
};

/**
 * Final markdown and comment payloads generated for GitHub Actions reporting.
 */
export type CoverageReport = {
  totalPct: string;
  commentBody: string;
  markdownSummary: string;
};
