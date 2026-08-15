import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Top-level execution (if block)", () => {
  const spyError = vi.spyOn(console, "error");
  const defaultSummaryPath = path.resolve(
    process.cwd(),
    "coverage/coverage-summary.json",
  );
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.spyOn(process, "exit").mockImplementation(() => "" as never);
  });
  it("should execute generateCoverageSummary when process.argv[1] contains 'coverage-summary'", async () => {
    process.argv = ["node", "/workspace/scripts/coverage-summary.ts"];

    vi.spyOn(fs, "existsSync").mockReturnValue(true);

    // Dynamic import triggers top-level code execution
    await import("./coverage-summary");

    expect(fs.existsSync).toHaveBeenCalledWith(defaultSummaryPath);
  });

  it("should NOT execute generateCoverageSummary when process.argv[1] does not match", async () => {
    process.argv = ["node", "/workspace/scripts/different-script.ts"];

    const existsSpy = vi.spyOn(fs, "existsSync");

    await import("./coverage-summary");

    expect(existsSpy).not.toHaveBeenCalled();
  });

  it("should include coverage summary [Coverage Script] Fatal Error in error message", async () => {
    process.argv = ["node", "/workspace/scripts/coverage-summary.ts"];

    const spied = vi.spyOn(fs, "existsSync").mockImplementation(() => {
      throw new Error("Just trying errors");
    });

    await import("./coverage-summary");

    expect(spied).toHaveBeenCalled();
    expect(spyError).toHaveBeenCalled();
    expect(spyError).toHaveBeenCalledWith(
      "❌ [Coverage Script] Fatal Error: Just trying errors",
    );
  });
});
