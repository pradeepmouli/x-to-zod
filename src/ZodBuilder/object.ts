/**
 * Build a Zod object schema string from property definitions.
 * Properties should already have Zod schema strings as values.
 */
export function buildObject(properties: Record<string, string>): string {
  if (Object.keys(properties).length === 0) {
    return "z.object({})";
  }

  const props = Object.entries(properties)
    .map(([key, zodStr]) => `${JSON.stringify(key)}: ${zodStr}`)
    .join(", ");

  return `z.object({ ${props} })`;
}

/**
 * Build a Zod record schema string.
 */
export function buildRecord(keySchemaZod: string, valueSchemaZod: string): string {
  return `z.record(${keySchemaZod}, ${valueSchemaZod})`;
}

/**
 * Apply strict mode (no additional properties allowed).
 */
export function applyStrict(zodStr: string): string {
  return `${zodStr}.strict()`;
}

/**
 * Apply catchall schema for additional properties.
 */
export function applyCatchall(zodStr: string, catchallSchemaZod: string): string {
  return `${zodStr}.catchall(${catchallSchemaZod})`;
}

/**
 * Apply passthrough mode (allow additional properties).
 */
export function applyPassthrough(zodStr: string): string {
  return `${zodStr}.passthrough()`;
}

/**
 * Apply superRefine for pattern properties validation.
 */
export function applySuperRefine(zodStr: string, refineFn: string): string {
  return `${zodStr}.superRefine(${refineFn})`;
}

/**
 * Apply and combinator (merge with another schema).
 */
export function applyAnd(zodStr: string, otherSchemaZod: string): string {
  return `${zodStr}.and(${otherSchemaZod})`;
}
