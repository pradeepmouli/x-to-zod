/**
 * Fluent ArrayBuilder: wraps a Zod array schema string and provides chainable methods.
 */
export class ArrayBuilder {
  private code: string;

  constructor(itemSchemaZod: string) {
    this.code = `z.array(${itemSchemaZod})`;
  }

  /**
   * Apply minItems constraint.
   */
  min(value: number, errorMessage?: string): this {
    this.code = applyMinItems(this.code, value, errorMessage);
    return this;
  }

  /**
   * Apply maxItems constraint.
   */
  max(value: number, errorMessage?: string): this {
    this.code = applyMaxItems(this.code, value, errorMessage);
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
