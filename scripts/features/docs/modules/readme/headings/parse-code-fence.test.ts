import { describe, expect, it } from "vitest";

import { createCodeFenceTracker } from "./parse-code-fence";

describe("createCodeFenceTracker", () => {
  it("opens and closes matching backtick fences while skipping their content", () => {
    const tracker = createCodeFenceTracker();

    expect(tracker.shouldSkipLine("```ts")).toBe(true);
    expect(tracker.shouldSkipLine("const value = 1;")).toBe(true);
    expect(tracker.shouldSkipLine("``` ")).toBe(true);
    expect(tracker.shouldSkipLine("## Real Heading")).toBe(false);
  });

  it("opens and closes matching tilde fences separately from backtick fences", () => {
    const tracker = createCodeFenceTracker();

    expect(tracker.shouldSkipLine("~~~md")).toBe(true);
    expect(tracker.shouldSkipLine("~~~")).toBe(true);
    expect(tracker.shouldSkipLine("## Title")).toBe(false);
  });

  it("ignores non-fence lines outside of a fence and keeps fence state stable", () => {
    const tracker = createCodeFenceTracker();

    expect(tracker.shouldSkipLine("# Title")).toBe(false);
    expect(tracker.shouldSkipLine("`code`")).toBe(false);
    expect(tracker.shouldSkipLine("```ts")).toBe(true);
    expect(tracker.shouldSkipLine("const value = 1;")).toBe(true);
    expect(tracker.shouldSkipLine("```tsx")).toBe(true);
    expect(tracker.shouldSkipLine("## Heading")).toBe(false);
  });
});
