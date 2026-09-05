/**
 * Creates a stateful fence tracker for README parsing.
 *
 * @returns {{ shouldSkipLine: (line: string) => boolean }} An object that marks
 * whether the parser should ignore a line while inside a fenced code block.
 */
export function createCodeFenceTracker() {
  let inFence = false;
  let fenceCharacter: "`" | "~" | null = null;

  return {
    shouldSkipLine(line: string): boolean {
      const trimmed = line.trimStart();
      const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);

      if (!fenceMatch) {
        return inFence;
      }

      const marker = fenceMatch[1].charAt(0) as "`" | "~";

      if (!inFence) {
        inFence = true;
        fenceCharacter = marker;
        return true;
      }

      if (fenceCharacter === marker) {
        inFence = false;
        fenceCharacter = null;
        return true;
      }

      return true;
    },
  };
}
