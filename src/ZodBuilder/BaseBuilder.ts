/**
 * BaseBuilder: Abstract base class for all Zod schema builders.
 * Provides shared modifier methods that apply to all schema types.
 */
export abstract class BaseBuilder<T extends BaseBuilder<T>> {
  protected code: string;

  constructor(initialCode: string) {
    this.code = initialCode;
  }

  /**
   * Apply optional constraint.
   */
  optional(): T {
    const { applyOptional } = require("./modifiers.js");
    this.code = applyOptional(this.code);
    return this as unknown as T;
  }

  /**
   * Apply nullable constraint.
   */
  nullable(): T {
    const { applyNullable } = require("./modifiers.js");
    this.code = applyNullable(this.code);
    return this as unknown as T;
  }

  /**
   * Apply default value.
   */
  default(value: any): T {
    const { applyDefault } = require("./modifiers.js");
    this.code = applyDefault(this.code, value);
    return this as unknown as T;
  }

  /**
   * Apply describe modifier.
   */
  describe(description: string): T {
    const { applyDescribe } = require("./modifiers.js");
    this.code = applyDescribe(this.code, description);
    return this as unknown as T;
  }

  /**
   * Apply brand modifier.
   */
  brand(brand: string): T {
    const { applyBrand } = require("./modifiers.js");
    this.code = applyBrand(this.code, brand);
    return this as unknown as T;
  }

  /**
   * Apply readonly modifier.
   */
  readonly(): T {
    const { applyReadonly } = require("./modifiers.js");
    this.code = applyReadonly(this.code);
    return this as unknown as T;
  }

  /**
   * Apply catch modifier.
   */
  catch(fallback: any): T {
    const { applyCatch } = require("./modifiers.js");
    this.code = applyCatch(this.code, fallback);
    return this as unknown as T;
  }

  /**
   * Unwrap and return the final Zod code string.
   */
  done(): string {
    return this.code;
  }
}
