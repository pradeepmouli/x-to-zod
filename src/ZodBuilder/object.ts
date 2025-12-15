/**
 * Fluent ObjectBuilder: wraps a Zod object schema string and provides chainable methods.
 */
export class ObjectBuilder {
  private code: string;

  constructor(properties: Record<string, string> = {}) {
    if (Object.keys(properties).length === 0) {
      this.code = "z.object({})";
    } else {
      const propStrings = Object.entries(properties).map(
        ([key, zodStr]) => `${JSON.stringify(key)}: ${zodStr}`,
      );
      this.code = `z.object({ ${propStrings.join(", ")} })`;
    }
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

  /**
   * Apply optional constraint.
   */
  optional(): this {
    const { applyOptional } = require("./modifiers.js");
    this.code = applyOptional(this.code);
    return this;
  }

  /**
   * Apply nullable constraint.
   */
  nullable(): this {
    const { applyNullable } = require("./modifiers.js");
    this.code = applyNullable(this.code);
    return this;
  }

  /**
   * Apply default value.
   */
  default(value: any): this {
    const { applyDefault } = require("./modifiers.js");
    this.code = applyDefault(this.code, value);
    return this;
  }

  /**
   * Apply describe modifier.
   */
  describe(description: string): this {
    const { applyDescribe } = require("./modifiers.js");
    this.code = applyDescribe(this.code, description);
    return this;
  }

  /**
   * Unwrap and return the final Zod code string.
   */
  done(): string {
    return this.code;
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
