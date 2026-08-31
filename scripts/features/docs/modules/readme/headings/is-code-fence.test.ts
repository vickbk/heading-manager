import { describe, expect, it } from "vitest";

import { isCodeFence } from "./is-code-fence";

describe("isCodeFence", () => {
  it("detects fenced code blocks opened with backticks or tildes", () => {
    expect(isCodeFence("```ts")).toBe(true);
    expect(isCodeFence("   ```md")).toBe(true);
    expect(isCodeFence("~~~")).toBe(true);
    expect(isCodeFence("~~~~python")).toBe(true);
  });

  it("ignores inline code backticks and regular markdown text", () => {
    expect(isCodeFence("`const answer = 42;`")).toBe(false);
    expect(isCodeFence("use `code` here")).toBe(false);
    expect(isCodeFence("## Heading")).toBe(false);
  });
});
