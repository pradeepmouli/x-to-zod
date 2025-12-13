/**
 * Build a Zod array schema string from an item schema.
 */
export function buildArray(itemSchemaZod: string): string {
  return `z.array(${itemSchemaZod})`;
}

/**
 * Build a Zod tuple schema string from item schemas.
 */
export function buildTuple(itemSchemasZod: string[]): string {
  return `z.tuple([${itemSchemasZod.join(",")}])`; // No space after comma
}

/**
 * Apply minItems constraint to an array schema.
 */
export function applyMinItems(zodStr: string, value: number, errorMessage?: string): string {
  return errorMessage
    ? `${zodStr}.min(${JSON.stringify(value)}, ${JSON.stringify(errorMessage)})`
    : `${zodStr}.min(${JSON.stringify(value)})`;
}

/**
 * Apply maxItems constraint to an array schema.
 */
export function applyMaxItems(zodStr: string, value: number, errorMessage?: string): string {
  return errorMessage
    ? `${zodStr}.max(${JSON.stringify(value)}, ${JSON.stringify(errorMessage)})`
    : `${zodStr}.max(${JSON.stringify(value)})`;
}
