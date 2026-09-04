export function isNotFoundError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const cause = err.cause as { code?: string } | undefined;
  return cause?.code === "ENOENT" || err.message.includes("ENOENT");
}
