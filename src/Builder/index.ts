import type { ConditionalPick } from 'type-fest';
import type { ZodStringFormat, ZodType } from 'zod';
import z from 'zod';
import type { SomeType } from 'zod/v4/core';

/**
 * Builder — output contract for all schema parsers.
 *
 * Extracted from the concrete `ZodBuilder` class so that:
 * - Parser return types are statically verifiable against the interface, not a class.
 * - Alternative output targets (AST, dry-run, Arktype) can be implemented without
 *   touching core parsing code.
 * - `parserOverride` callbacks are type-checked to return a `Builder`, eliminating
 *   the untyped `string` escape hatch.
 *
 * All modifier methods return `Builder` (not `this`) to keep the interface simple and
 * implementable by third parties. The concrete `ZodBuilder` class retains `this` return
 * types for its own fluent chaining — TypeScript accepts this structural assignment.
 */
export interface Builder<
	Z extends ZodType = ZodType,
	T = Z extends ZodStringFormat ? Z['format'] : Z['type'],
> {
	/**
	 * Parser type discriminator (e.g. `'string'`, `'object'`, `'anyOf'`).
	 * Set by the parser that creates this builder.
	 */
	readonly typeKind: T;

	/**
	 * Emit the final Zod expression as a TypeScript code string.
	 * Example: `z.string().optional().describe("name")`
	 */
	text(): string;

	/** Apply `.optional()` modifier to the generated schema. */
	optional(): this;

	/** Apply `.nullable()` modifier to the generated schema. */
	nullable(): this;

	/**
	 * Apply `.default(value)` modifier.
	 * @param value - Serialised as JSON in the generated code.
	 */
	default(value: unknown): this;

	/**
	 * Apply `.describe(description)` modifier.
	 * @param description - JSDoc description string.
	 */
	describe(description: string): this;

	/**
	 * Apply `.brand(brand)` modifier for nominal typing.
	 * @param brand - Brand string literal.
	 */
	brand(brand: string): this;

	/** Apply `.readonly()` modifier to the generated schema. */
	readonly(): this;

	/**
	 * Apply `.catch(fallback)` modifier for parse-failure recovery.
	 * @param value - Fallback value serialised as JSON in the generated code.
	 */
	catch(value: unknown): this;

	/**
	 * Apply `.refine(fn, message?)` constraint.
	 * @param refineFn - Refine predicate as a code string (e.g. `"(val) => val > 0"`).
	 * @param message - Optional error message string.
	 */
	refine(refineFn: string, message?: string): this;

	/**
	 * Apply `.superRefine(fn)` constraint.
	 * @param superRefineFn - SuperRefine function as a code string.
	 */
	superRefine(superRefineFn: string): this;

	/**
	 * Apply `.meta(obj)` metadata (Zod v4+).
	 * @param metadata - Arbitrary key/value metadata object.
	 */
	meta(metadata: Record<string, unknown>): this;

	/**
	 * Apply `.transform(fn)` mapping.
	 * @param transformFn - Transform function as a code string.
	 */
	transform(transformFn: string): this;
}

type Extensions<Z extends ZodType> = ConditionalPick<
	Omit<Z, keyof ZodType>,
	Function
>;

type BuilderReturn<R> = R extends ZodType ? BuilderFor<R> : R;

/**
 * Helper type to extract the fluent interface of a Builder implementation, for use in parserOverride callbacks.
 * For a given Zod type `z`, `BuilderFor<z>` includes all methods of `Builder` plus any additional fluent methods from `z`.
 * This allows parserOverride implementations to return builders with extended fluent APIs (e.g. Zod v4's `.meta()`) while still being type-checked as returning a `Builder`.
 */
export type BuilderFor<z extends ZodType> = Builder<z> & {
	[K in keyof Extensions<z>]: Extensions<z>[K] extends (
		...args: infer A
	) => infer R
		? (...args: A) => BuilderReturn<R>
		: never;
};

export type TypeKind = ZodType['type'];

/**
 * Keys on the `z` namespace that are NOT schema constructors.
 * These are utilities, wrappers, check/constraint creators, error helpers,
 * and conversion functions that happen to satisfy `(...args: any) => ZodType`
 * due to generic instantiation but should not appear in build APIs.
 */
type NonConstructorKeys =
	// Internal / prefixed helpers
	| '_default'
	| '_function'
	// Parse / encode / decode utilities
	| 'parse'
	| 'parseAsync'
	| 'safeParse'
	| 'safeParseAsync'
	| 'encode'
	| 'encodeAsync'
	| 'decode'
	| 'decodeAsync'
	| 'safeEncode'
	| 'safeEncodeAsync'
	| 'safeDecode'
	| 'safeDecodeAsync'
	// Error formatting
	| 'flattenError'
	| 'formatError'
	| 'prettifyError'
	| 'treeifyError'
	// Configuration & registry
	| 'config'
	| 'registry'
	| 'getErrorMap'
	| 'setErrorMap'
	| 'success'
	// Schema wrappers (modify existing schemas, not constructors)
	| 'clone'
	| 'describe'
	| 'meta'
	| 'optional'
	| 'nullable'
	| 'nullish'
	| 'readonly'
	| 'nonoptional'
	| 'exactOptional'
	| 'catch'
	| 'prefault'
	// Refinement / transform / overwrite
	| 'refine'
	| 'superRefine'
	| 'transform'
	| 'overwrite'
	| 'property'
	| 'check'
	// Number checks (return $ZodCheck, not schemas)
	| 'gt'
	| 'gte'
	| 'lt'
	| 'lte'
	| 'positive'
	| 'negative'
	| 'nonnegative'
	| 'nonpositive'
	| 'multipleOf'
	// String checks
	| 'includes'
	| 'startsWith'
	| 'endsWith'
	| 'regex'
	| 'trim'
	| 'toLowerCase'
	| 'toUpperCase'
	| 'normalize'
	| 'slugify'
	| 'lowercase'
	| 'uppercase'
	// Size checks
	| 'length'
	| 'minLength'
	| 'maxLength'
	| 'size'
	| 'minSize'
	| 'maxSize'
	// MIME check
	| 'mime'
	// JSON Schema conversion
	| 'toJSONSchema'
	| 'fromJSONSchema';

export type Functions = Omit<
	ConditionalPick<typeof z, (...args: any) => ZodType>,
	NonConstructorKeys
>;

type ReplaceZodTypesWithBuilders<T> = T extends ZodType
	? BuilderFor<T>
	: T extends SomeType
		? BuilderFor<Exclude<T['_zod']['parent'], unknown>>
		: T extends (...args: infer A) => infer R
			? (
					...args: { [K in keyof A]: ReplaceZodTypesWithBuilders<A[K]> }
				) => ReplaceZodTypesWithBuilders<R>
			: T extends readonly [...infer U]
				? { [K in keyof U]: ReplaceZodTypesWithBuilders<U[K]> }
				: T extends (infer U)[]
					? ReplaceZodTypesWithBuilders<U>[]
					: T extends object
						? { [K in keyof T]: ReplaceZodTypesWithBuilders<T[K]> }
						: T;

export type ParamsFor<T extends keyof Functions> = ReplaceZodTypesWithBuilders<
	Parameters<FunctionFor<T>>
>;

export type FunctionFor<T extends keyof Functions> = Functions[T];
