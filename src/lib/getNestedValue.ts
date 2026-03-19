/**
 * Safely retrieves nested values from objects using dot-notation paths.
 */
export function getNestedValue(
  obj: Record<string, unknown> | null | undefined,
  path: string
): unknown {
  if (obj === null || obj === undefined || !path) return undefined;
  if (!path.includes('.')) return obj[path];

  const parts = path.split('.');
  let value: unknown = obj;

  for (const part of parts) {
    if (value === null || value === undefined || typeof value !== 'object') return undefined;
    value = (value as Record<string, unknown>)[part];
  }

  return value;
}
