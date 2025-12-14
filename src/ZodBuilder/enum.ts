import { Serializable } from "../Types.js";

/**
 * Fluent EnumBuilder: wraps a Zod enum schema string and provides chainable methods.
 */
export class EnumBuilder {
  private code: string;

  constructor(code: string) {
    this.code = code;
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
 * Build a Zod enum schema string from an array of enum values.
 * Handles empty enums, single literals, string enums, and mixed-type unions.
 */
export function buildEnum(values: Serializable[]): string {
  if (values.length === 0) {
    return "z.never()";
  } else if (values.length === 1) {
    // union does not work when there is only one element
    return `z.literal(${JSON.stringify(values[0])})`;
  } else if (values.every((x) => typeof x === "string")) {
    return `z.enum([${values.map((x) => JSON.stringify(x))}])`;
  } else {
    return `z.union([${values.map((x) => `z.literal(${JSON.stringify(x)})`).join(", ")}])`;
  }
}
