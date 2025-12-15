import { Serializable } from "../Types.js";

/**
 * Fluent ConstBuilder: wraps a Zod literal schema string and provides chainable methods.
 */
export class ConstBuilder {
  private code: string;

  constructor(value: Serializable) {
    this.code = `z.literal(${JSON.stringify(value)})`;
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
 * Build a Zod literal schema string from a const value.
 */
export function buildLiteral(value: Serializable): string {
  return `z.literal(${JSON.stringify(value)})`;
}

/**
 * @deprecated Use buildLiteral instead
 */
export const buildConst = buildLiteral;
