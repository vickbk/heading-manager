import { config } from "@/scripts/config";
import fs from "node:fs";
import path from "path";
import { CoverageReport, CoverageSummaryJson } from "../types";
import { formatRow } from "./format";

/**
 * Stable HTML comment marker used to detect previously posted coverage updates on the pull request.
 */
export const COMMENT_IDENTIFIER = "<!-- coverage-report-id -->";

/**
 * Parses the aggregated Vitest coverage report and builds the markdown summary and PR comment payload.
 *
 * @param summaryPath - File path to the coverage-summary.json file.
 * @param repository - GitHub repository slug used to build the Actions run link.
 * @param runId - GitHub run identifier used in the documentation link.
 * @returns Structured coverage data for a summary table and sticky PR comment.
 * @throws {Error} When the summary file is missing or the JSON payload is malformed.
 */
export function getReport(
  summaryPath = path.resolve(config.cwd, config.paths.vitestReport),
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
