import { describe, expect, it } from "vitest";

import { normalizeHeadingText } from "./normalize-heading-text";

describe("normalizeHeadingText", () => {
  it("normalizes plain headings to a stable lowercase text form", () => {
    expect(normalizeHeadingText("Quick Start")).toBe("quick start");
    expect(normalizeHeadingText("Installation")).toBe("installation");
  });

  it("removes markdown emphasis, links, and inline code syntax", () => {
    expect(normalizeHeadingText("**Quick Start**")).toBe("quick start");
    expect(normalizeHeadingText("[Features](#features)")).toBe("features");
    expect(normalizeHeadingText("`TypeScript Support` ")).toBe(
      "typescript support",
    );
  });

  it("strips punctuation and repeated whitespace without affecting section identity", () => {
    expect(normalizeHeadingText("API & Entry Points")).toBe("api entry points");
    expect(
      normalizeHeadingText("  Architecture   &   Module Isolation Policy  "),
    ).toBe("architecture module isolation policy");
  });

  it("handles badge markdown and HTML tags safely", () => {
    expect(
      normalizeHeadingText("![npm version](https://example.com/badge.svg)"),
    ).toBe("");
    expect(normalizeHeadingText("<span>Accessibility</span>")).toBe(
      "accessibility",
    );
  });
});
