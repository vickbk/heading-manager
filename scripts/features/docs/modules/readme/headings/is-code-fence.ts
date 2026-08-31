export function isCodeFence(line: string): boolean {
  return /^\s*(`{3,}|~{3,})/.test(line);
}
