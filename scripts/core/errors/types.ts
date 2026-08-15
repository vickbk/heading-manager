/**
 * Represents either a static prefix string or a custom formatter function used to render fatal CLI messages.
 */
export type LogFormatter = string | ((message: string) => string);
