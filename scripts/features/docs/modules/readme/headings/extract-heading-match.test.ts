import { describe, expect, it } from "vitest";

import { extractHeadingMatch } from "./extract-heading-match";

describe("extractHeadingMatch", () => {
  it("matches valid ATX headings for all supported levels", () => {
    expect(extractHeadingMatch("# Title")).toEqual({ level: 1, text: "Title" });
    expect(extractHeadingMatch("## Section")).toEqual({
      level: 2,
      text: "Section",
    });
    expect(extractHeadingMatch("### Subsection")).toEqual({
      level: 3,
      text: "Subsection",
    });
    expect(extractHeadingMatch("#### Detail")).toEqual({
      level: 4,
      text: "Detail",
    });
    expect(extractHeadingMatch("##### More Detail")).toEqual({
      level: 5,
      text: "More Detail",
    });
    expect(extractHeadingMatch("###### Final")).toEqual({
      level: 6,
      text: "Final",
    });
  });

  it("rejects invalid heading syntax, empty text, and H7+ headings", () => {
    expect(extractHeadingMatch("#NotAHeading")).toBeNull();
    expect(extractHeadingMatch("title")).toBeNull();
    expect(extractHeadingMatch("####### Too Deep")).toBeNull();
    expect(extractHeadingMatch("##\u00A0")).toBeNull();
  });

  it("allows trailing closing hashes and whitespace", () => {
    expect(extractHeadingMatch("## Section ###")).toEqual({
      level: 2,
      text: "Section",
    });
    expect(extractHeadingMatch("   ### Level 3   ")).toEqual({
      level: 3,
      text: "Level 3",
    });
  });
});
