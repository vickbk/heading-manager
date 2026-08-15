import { CoverageMetric } from "../types";

/**
 * Formats a single coverage metric row for markdown tables used in workflow summaries and PR comments.
 *
 * @param label - Human-readable metric name such as Statements or Lines.
 * @param metric - Coverage values extracted from the Vitest summary payload.
 * @returns The markdown table row for the provided metric.
 */
export const formatRow = (label: string, metric: CoverageMetric): string =>
  `| ${label} | ${metric.pct}% (${metric.covered}/${metric.total}) |`;
