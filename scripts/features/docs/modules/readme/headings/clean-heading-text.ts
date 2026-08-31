/**
 * Cleans a markdown heading label for contract comparison.
 *
 * @param {string} value - The raw heading text extracted from a README line.
 * @returns {string} The heading text with markdown decoration removed while
 * preserving the readable section name.
 */
export function cleanHeadingText(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/\s+#+\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
