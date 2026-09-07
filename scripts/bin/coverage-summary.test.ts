import { shutConsole } from "@/tests/setup/console";
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateCoverageMock = vi.fn();

vi.mock("@vickbk/ci-tools/vitest", () => ({
  generateCoverageSummary: generateCoverageMock,
}));

describe("Top-level execution (if block)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    shutConsole();

    vi.spyOn(process, "exit").mockImplementation(() => "" as never);
  });
  it("should execute generateCoverageSummary when process.argv[1] contains 'coverage-summary'", async () => {
    process.argv = ["node", "/workspace/scripts/coverage-summary.ts"];

    await import("./coverage-summary");

    expect(generateCoverageMock).toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it("should NOT execute generateCoverageSummary when process.argv[1] does not match", async () => {
    process.argv = ["node", "/workspace/scripts/different-script.ts"];

    await import("./coverage-summary");

    expect(generateCoverageMock).not.toHaveBeenCalled();
  });

  it("should include coverage summary [Coverage Script] Fatal Error in error message", async () => {
    process.argv = ["node", "/workspace/scripts/coverage-summary.ts"];

    generateCoverageMock.mockImplementation(() => {
      throw new Error("Just trying errors");
    });

    await import("./coverage-summary");

    expect(generateCoverageMock).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "❌ [Coverage Script] Fatal Error: Just trying errors",
    );
  });
});
