import type { Builder } from '../Builder/index.js';
import type { Context } from '../Types.js';

export interface Parser {
	/**
	 * Type discriminator string. Used by the registry to identify which parser handles
	 * a given schema node, and surfaced in error messages.
	 *
	 * Examples: `'string'`, `'object'`, `'anyOf'`, `'custom-datetime'`
	 */
	readonly typeKind: string;

	/**
	 * Parse the schema node this parser was constructed with and return a `Builder`
	 * that emits valid Zod code when `.text()` is called.
	 */
	parse(): Builder;
}

/**
 * Constructor shape required by the parser registry.
 *
 * The `schema: any` parameter is intentional — it bypasses TypeScript constructor
 * parameter contravariance, allowing concrete parsers with schema-specific constructor
 * types (e.g. `JSONSchemaObject<Version>`) to be registered without modification.
 * Runtime validation is performed by `registerParser` to ensure structural correctness.
 *
 * See: research.md §2 — ParserClass registry type widening.
 */
export type ParserConstructor = new (schema: any, refs: Context) => Parser;

export { AbstractParser } from './AbstractParser.js';
