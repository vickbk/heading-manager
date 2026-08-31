/**
 * Normalize markdown heading text to a stable value suitable for matching against
 * the documentation contract, while avoiding overly aggressive fuzzy matching.
 */
export function normalizeHeadingText(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^\)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_~]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'"!@#$%^&*+=<>?/()[\]{}|;:,.]/g, " ")
    .replace(/[-_/]+/g, " ")
    .replace(/[\p{Extended_Pictographic}\u2600-\u27BF]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
