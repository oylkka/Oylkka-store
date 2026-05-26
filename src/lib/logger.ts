const PREFIX = '[Oylkka]';

export function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  // biome-ignore lint/suspicious/noConsole: intentional logger
  console.error(`${PREFIX} [${context}] ${message}`);
  // biome-ignore lint/suspicious/noConsole: intentional logger
  if (stack) console.error(`${PREFIX} [${context}] Stack:`, stack);
}
