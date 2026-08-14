import fs from "node:fs";
import path from "path";
import { CoverageReport, CoverageSummaryJson } from "../types";
import { formatRow } from "./format";

export const COMMENT_IDENTIFIER = "<!-- coverage-report-id -->";

export function getReport(
  summaryPath = path.resolve(process.cwd(), "coverage/coverage-summary.json"),
  repository?: string,
  runId?: string,
): CoverageReport {
  if (!fs.existsSync(summaryPath)) {
    throw new Error(
      `[CoverageReport] Summary JSON file not found at: "${summaryPath}"`,
    );
  }

  const rawData = fs.readFileSync(summaryPath, "utf8");
  const summaryData = JSON.parse(rawData) as CoverageSummaryJson;

  if (!summaryData?.total) {
    throw new Error(
      "[CoverageReport] Invalid JSON structure: missing 'total' coverage node.",
    );
  }

  const { total } = summaryData;
  const totalPct = `${total.statements.pct}%`;
  const runUrl =
    repository && runId
      ? `https://github.com/${repository}/actions/runs/${runId}`
      : "#";

  const tableRows = [
    formatRow("Statements", total.statements),
    formatRow("Branches", total.branches),
    formatRow("Functions", total.functions),
    formatRow("Lines", total.lines),
  ].join("\n");

  const markdownSummary = [
    "## 🧪 Test Coverage Summary",
    `### Total Statement Coverage: \`${totalPct}\``,
    "",
    "| Metric | Coverage |",
    "| :--- | :--- |",
    tableRows,
  ].join("\n");

  const commentBody = [
    COMMENT_IDENTIFIER,
    "## 🧪 Test Coverage Report",
    `**Overall Statement Coverage:** \`${totalPct}\``,
    "",
    "| Metric | Coverage |",
    "| :--- | :--- |",
    tableRows,
    "",
    `> View full breakdown in [Actions Step Summary](${runUrl}).`,
  ].join("\n");

  return { totalPct, commentBody, markdownSummary };
}
