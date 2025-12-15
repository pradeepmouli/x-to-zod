/**
 * Fluent NullBuilder: wraps a Zod null schema string and provides chainable methods.
 */
export class NullBuilder {
  private code: string;

  constructor() {
    this.code = "z.null()";
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
 * Build a Zod null schema string.
 */
export function buildNull(): string {
  return "z.null()";
}
