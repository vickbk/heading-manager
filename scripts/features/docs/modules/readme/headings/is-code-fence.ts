/**
 * Checks whether a line opens a markdown fenced code block.
 *
 * @param {string} line - A line from the README content.
 * @returns {boolean} True when the line begins a fenced code block, otherwise
 * false.
 */
export function isCodeFence(line: string): boolean {
  return /^\s*(`{3,}|~{3,})/.test(line);
}
