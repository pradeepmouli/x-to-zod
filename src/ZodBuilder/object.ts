import { BaseBuilder } from "./BaseBuilder.js";

/**
 * Fluent ObjectBuilder: wraps a Zod object schema string and provides chainable methods.
 */
export class ObjectBuilder extends BaseBuilder<ObjectBuilder> {
  constructor(properties: Record<string, string> = {}) {
    let code: string;
    if (Object.keys(properties).length === 0) {
      code = "z.object({})";
    } else {
      const propStrings = Object.entries(properties).map(
        ([key, zodStr]) => `${JSON.stringify(key)}: ${zodStr}`,
      );
      code = `z.object({ ${propStrings.join(", ")} })`;
    }
    super(code);
  }

  /**
   * Create ObjectBuilder from existing Zod object code string.
   * Used when applying modifiers to already-built object schemas.
   */
  static fromCode(code: string): ObjectBuilder {
    const builder = new ObjectBuilder({});
    builder.code = code;
    return builder;
  }

  /**
   * Apply strict mode (no additional properties allowed).
   */
  strict(): this {
    this.code = applyStrict(this.code);
    return this;
  }

  /**
   * Apply catchall schema for additional properties.
   */
  catchall(catchallSchemaZod: string): this {
    this.code = applyCatchall(this.code, catchallSchemaZod);
    return this;
  }

  /**
   * Apply loose mode (allow additional properties). Uses .loose() for Zod v4.
   */
  loose(): this {
    this.code = applyLoose(this.code);
    return this;
  }

  /**
   * Apply superRefine for pattern properties validation.
   */
  superRefine(refineFn: string): this {
    this.code = applySuperRefine(this.code, refineFn);
    return this;
  }

  /**
   * Apply and combinator (merge with another schema).
   */
  and(otherSchemaZod: string): this {
    this.code = applyAnd(this.code, otherSchemaZod);
    return this;
  }
}

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
 * Apply loose mode (allow additional properties).
 * In Zod v4, use .loose() instead of .passthrough().
 */
export function applyLoose(zodStr: string): string {
  return `${zodStr}.loose()`;
}

/**
 * Apply passthrough mode (deprecated; use applyLoose for Zod v4).
 * Kept for backward compatibility with existing code.
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
