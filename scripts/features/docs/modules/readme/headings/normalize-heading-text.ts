/**
 * Normalizes a heading label into a stable comparison key for contract matching.
 *
 * @param {string} value - The heading text to normalize.
 * @returns {string} A lowercase, punctuation-normalized label suitable for
 * comparing section names and aliases.
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
