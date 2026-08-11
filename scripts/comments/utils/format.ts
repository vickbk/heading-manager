import { CoverageMetric } from "../types";

export const formatRow = (label: string, metric: CoverageMetric): string =>
  `| ${label} | ${metric.pct}% (${metric.covered}/${metric.total}) |`;
