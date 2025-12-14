/**
 * Fluent NumberBuilder: wraps a Zod number schema string and provides chainable methods
 * that delegate to the existing apply* functions.
 */
export class NumberBuilder {
  private code: string;

  constructor(code: string = "z.number()") {
    this.code = code;
  }

  /**
   * Apply integer constraint.
   */
  int(errorMessage?: string): this {
    this.code = applyInt(this.code, errorMessage);
    return this;
  }

  /**
   * Apply multipleOf constraint.
   */
  multipleOf(value: number, errorMessage?: string): this {
    this.code = applyMultipleOf(this.code, value, errorMessage);
    return this;
  }

  /**
   * Apply minimum constraint (gte by default).
   */
  min(value: number, exclusive: boolean = false, errorMessage?: string): this {
    this.code = applyMin(this.code, value, exclusive, errorMessage);
    return this;
  }

  /**
   * Apply maximum constraint (lte by default).
   */
  max(value: number, exclusive: boolean = false, errorMessage?: string): this {
    this.code = applyMax(this.code, value, exclusive, errorMessage);
    return this;
  }

  /**
   * Apply optional constraint.
   */
  optional(): this {
    // Import at method call to avoid circular dependency
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
 * Build a base Zod number schema string.
 */
export function buildNumber(): string {
  return "z.number()";
}

/**
 * Apply integer constraint to a number schema.
 */
export function applyInt(zodStr: string, errorMessage?: string): string {
  if (errorMessage) {
    return `${zodStr}.int(${JSON.stringify(errorMessage)})`;
  }
  return `${zodStr}.int()`;
}

/**
 * Apply multipleOf constraint to a number schema.
 */
export function applyMultipleOf(zodStr: string, value: number, errorMessage?: string): string {
  // Special case: multipleOf 1 is equivalent to int
  if (value === 1) {
    // Avoid duplicate .int() if already present
    if (zodStr.includes(".int(")) {
      return zodStr;
    }
    return applyInt(zodStr, errorMessage);
  }

  if (errorMessage) {
    return `${zodStr}.multipleOf(${JSON.stringify(value)}, ${JSON.stringify(errorMessage)})`;
  }
  return `${zodStr}.multipleOf(${JSON.stringify(value)})`;
}

/**
 * Apply minimum constraint to a number schema.
 */
export function applyMin(
  zodStr: string,
  value: number,
  exclusive: boolean,
  errorMessage?: string,
): string {
  const method = exclusive ? "gt" : "gte";
  if (errorMessage) {
    return `${zodStr}.${method}(${JSON.stringify(value)}, ${JSON.stringify(errorMessage)})`;
  }
  return `${zodStr}.${method}(${JSON.stringify(value)})`;
}

/**
 * Apply maximum constraint to a number schema.
 */
export function applyMax(
  zodStr: string,
  value: number,
  exclusive: boolean,
  errorMessage?: string,
): string {
  const method = exclusive ? "lt" : "lte";
  if (errorMessage) {
    return `${zodStr}.${method}(${JSON.stringify(value)}, ${JSON.stringify(errorMessage)})`;
  }
  return `${zodStr}.${method}(${JSON.stringify(value)})`;
}
