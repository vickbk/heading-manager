import { beforeEach, describe, expect, it } from "vitest";
import { getRegionIdentifier } from "./get-region-identifier";

describe("getRegionIdentifier", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  // Helper to construct elements cleanly
  function createElementFromHTML(html: string): Element {
    container.innerHTML = html.trim();
    return container.firstElementChild!;
  }

  // ==========================================
  // 1. NATIVE HTML TAGS (NO ROLE ATTRIBUTE)
  // ==========================================
  describe("native HTML tags without role attribute", () => {
    it.each([
      ["<main></main>", "main"],
      ["<section></section>", "section"],
      ["<article></article>", "article"],
      ["<nav></nav>", "nav"],
      ["<header></header>", "header"],
      ["<footer></footer>", "footer"],
      ["<div></div>", "div"],
      ["<p></p>", "p"],
    ])("returns lowercase tag name '%s' -> '%s'", (html, expected) => {
      const el = createElementFromHTML(html);
      expect(getRegionIdentifier(el)).toBe(expected);
    });

    it("lowercases standard DOM uppercase tag names (e.g. 'MAIN' -> 'main')", () => {
      const el = document.createElement("SECTION");
      expect(getRegionIdentifier(el)).toBe("section");
    });
  });

  // ==========================================
  // 2. VALID ARIA ROLE ATTRIBUTES
  // ==========================================
  describe("elements with explicit ARIA roles", () => {
    it.each([
      ['<div role="navigation"></div>', 'div[role="navigation"]'],
      ['<div role="main"></div>', 'div[role="main"]'],
      ['<section role="search"></section>', 'section[role="search"]'],
      ['<form role="form"></form>', 'form[role="form"]'],
      ['<aside role="complementary"></aside>', 'aside[role="complementary"]'],
      ['<span role="banner"></span>', 'span[role="banner"]'],
    ])("formats element and role selector '%s' -> '%s'", (html, expected) => {
      const el = createElementFromHTML(html);
      expect(getRegionIdentifier(el)).toBe(expected);
    });
  });

  // ==========================================
  // 3. CASING AND WHITESPACE NORMALIZATION
  // ==========================================
  describe("casing and whitespace normalization", () => {
    it("trims leading and trailing whitespace from role attributes", () => {
      const el = createElementFromHTML('<div role="   navigation   "></div>');
      expect(getRegionIdentifier(el)).toBe('div[role="navigation"]');
    });

    it("lowercases uppercase and mixed-case role values", () => {
      const el1 = createElementFromHTML('<div role="MAIN"></div>');
      const el2 = createElementFromHTML(
        '<section role="ContentInfo"></section>',
      );

      expect(getRegionIdentifier(el1)).toBe('div[role="main"]');
      expect(getRegionIdentifier(el2)).toBe('section[role="contentinfo"]');
    });

    it("handles combination of untrimmed whitespace and uppercase role casing", () => {
      const el = createElementFromHTML('<div role="  SEARCH  "></div>');
      expect(getRegionIdentifier(el)).toBe('div[role="search"]');
    });
  });

  // ==========================================
  // 4. EMPTY, BLANK, AND ABSENT ROLE ATTRIBUTES
  // ==========================================
  describe("empty and whitespace-only role attributes", () => {
    it("falls back to tagName when role attribute is an empty string", () => {
      const el = createElementFromHTML('<div role=""></div>');
      expect(getRegionIdentifier(el)).toBe("div");
    });

    it("falls back to tagName when role attribute contains only whitespace", () => {
      const el = createElementFromHTML('<div role="    "></div>');
      expect(getRegionIdentifier(el)).toBe("div");
    });

    it("falls back to tagName when role attribute is absent", () => {
      const el = document.createElement("article");
      expect(el.hasAttribute("role")).toBe(false);
      expect(getRegionIdentifier(el)).toBe("article");
    });
  });

  // ==========================================
  // 5. CUSTOM ELEMENTS, SVG, & MULTI-WORD ROLES
  // ==========================================
  describe("custom elements, SVG tags, and complex roles", () => {
    it("handles web components / custom element tag names", () => {
      const el = createElementFromHTML(
        '<app-header role="banner"></app-header>',
      );
      expect(getRegionIdentifier(el)).toBe('app-header[role="banner"]');
    });

    it("handles SVG elements with roles", () => {
      const el = createElementFromHTML('<svg role="img"></svg>');
      expect(getRegionIdentifier(el)).toBe('svg[role="img"]');
    });

    it("preserves fallback non-standard or DPUB-ARIA roles", () => {
      const el = createElementFromHTML('<div role="doc-abstract"></div>');
      expect(getRegionIdentifier(el)).toBe('div[role="doc-abstract"]');
    });

    it("handles multi-word or fallback role definitions", () => {
      const el = createElementFromHTML('<div role="button checkbox"></div>');
      expect(getRegionIdentifier(el)).toBe('div[role="button checkbox"]');
    });
  });
});
