import { describe, expect, it } from "vitest";

import { cleanHeadingText } from "./clean-heading-text";

describe("cleanHeadingText", () => {
  it("removes markdown links and images", () => {
    expect(cleanHeadingText("[Features](#features)")).toBe("Features");
    expect(
      cleanHeadingText("![npm version](https://example.com/badge.svg)"),
    ).toBe("");
  });

  it("removes inline code formatting and emphasis markers", () => {
    expect(cleanHeadingText("`TypeScript Support` ")).toBe(
      "TypeScript Support",
    );
    expect(cleanHeadingText("**Quick Start**")).toBe("Quick Start");
    expect(cleanHeadingText("_Installation_")).toBe("Installation");
  });

  it("strips trailing heading hashes and normalizes whitespace", () => {
    expect(cleanHeadingText("  API & Entry Points  ")).toBe(
      "API & Entry Points",
    );
    expect(cleanHeadingText("Quick Start ###")).toBe("Quick Start");
  });

  it("preserves unicode content while removing markdown syntax", () => {
    expect(cleanHeadingText("[Résumé](#résumé)")).toBe("Résumé");
    expect(cleanHeadingText("**Überblick**")).toBe("Überblick");
  });
});
