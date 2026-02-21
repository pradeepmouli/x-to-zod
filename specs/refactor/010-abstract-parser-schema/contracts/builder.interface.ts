/**
 * Builder — output contract for all schema parsers.
 *
 * Extracted from the concrete `ZodBuilder` / `BaseBuilder` class so that:
 * - Parser return types are statically verifiable against the interface, not a class.
 * - Alternative output targets (AST, dry-run, Arktype) can be implemented without
 *   touching core parsing code.
 * - `parserOverride` callbacks are type-checked to return a `Builder`, eliminating
 *   the untyped `string` escape hatch.
 *
 * All modifier methods return `Builder` (not `this`) to keep the interface simple and
 * implementable by third parties. The concrete `ZodBuilder` class retains `this` return
 * types for its own fluent chaining — TypeScript accepts this structural assignment.
 *
 * @file src/Builder/index.ts
 */
export interface Builder {
  /**
   * Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
   * Set by the parser that creates this builder.
   */
  readonly typeKind: string;

  /**
   * Emit the final Zod expression as a TypeScript code string.
   * Example: `z.string().optional().describe("name")`
   */
  text(): string;

  /** Apply `.optional()` modifier to the generated schema. */
  optional(): Builder;

  /** Apply `.nullable()` modifier to the generated schema. */
  nullable(): Builder;

  /**
   * Apply `.default(value)` modifier.
   * @param value - Serialised as JSON in the generated code.
   */
  default(value: unknown): Builder;

  /**
   * Apply `.describe(description)` modifier.
   * @param description - JSDoc description string.
   */
  describe(description: string): Builder;

  /**
   * Apply `.brand(brand)` modifier for nominal typing.
   * @param brand - Brand string literal.
   */
  brand(brand: string): Builder;

  /** Apply `.readonly()` modifier to the generated schema. */
  readonly(): Builder;

  /**
   * Apply `.catch(fallback)` modifier for parse-failure recovery.
   * @param value - Fallback value serialised as JSON in the generated code.
   */
  catch(value: unknown): Builder;

  /**
   * Apply `.refine(fn, message?)` constraint.
   * @param refineFn - Refine predicate as a code string (e.g. `"(val) => val > 0"`).
   * @param message - Optional error message string.
   */
  refine(refineFn: string, message?: string): Builder;

  /**
   * Apply `.superRefine(fn)` constraint.
   * @param superRefineFn - SuperRefine function as a code string.
   */
  superRefine(superRefineFn: string): Builder;

  /**
   * Apply `.meta(obj)` metadata (Zod v4+).
   * @param metadata - Arbitrary key/value metadata object.
   */
  meta(metadata: Record<string, unknown>): Builder;

  /**
   * Apply `.transform(fn)` mapping.
   * @param transformFn - Transform function as a code string.
   */
  transform(transformFn: string): Builder;
}
