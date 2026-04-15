export { toZod } from './toZod.js';
import { parse as classParse } from './parsers/index.js';
import { parseDefault } from './parsers/parseDefault.js';
import { parseSchema } from './parsers/parseSchema.js';
import { parseRef } from '../SchemaProject/parseRef.js';
import { is } from './is.js';
import type {
	JSONSchema,
	SchemaVersion,
	TypeValue,
	transformer,
} from './types/index.js';

export type {
	JSONSchema,
	SchemaVersion,
	TypeValue,
	transformer,
} from './types/index.js';

/**
 * Namespace of JSON Schema parser constructors, one per schema kind.
 *
 * Each member is a parser class or factory that accepts a JSON Schema node and
 * returns a `Builder`. Use `parse.string`, `parse.object`, etc. directly when
 * you know the schema's type, or call `select(schema)` to pick the right parser
 * automatically.
 *
 * Special members:
 * - `parse.schema` — handles all composite / keyword-based schemas
 * - `parse.ref` — resolves `$ref` pointers in multi-schema projects
 * - `parse.default` — wraps another parser with a default value
 *
 * @example
 * ```ts
 * import { JSONSchema } from 'x-to-zod';
 * const builder = JSONSchema.parse.string({ type: 'string' }, refs);
 * ```
 */
export const parse = {
	// class-based parse methods
	array: classParse.array,
	object: classParse.object,
	boolean: classParse.boolean,
	string: classParse.string,
	number: classParse.number,
	null: classParse.null,
	anyOf: classParse.anyOf,
	allOf: classParse.allOf,
	oneOf: classParse.oneOf,
	enum: classParse.enum,
	const: classParse.const,
	tuple: classParse.tuple,
	record: classParse.record,

	// convenience aliases
	union: classParse.union,
	intersection: classParse.intersection,
	discriminatedUnion: classParse.discriminatedUnion,

	// special types
	any: classParse.any,
	unknown: classParse.unknown,
	never: classParse.never,

	// functional helpers
	default: parseDefault,
	discriminator: undefined, // to be implemented

	// Multi-schema support (lowercase for consistency)
	schema: parseSchema,
	ref: parseRef,

	/** @deprecated Use `parse.schema` instead. */
	Schema: parseSchema,
	/** @deprecated Use `parse.ref` instead. */
	Ref: parseRef,
};

/**
 * Selects the most specific parser for a given JSON Schema node.
 *
 * Inspects the schema's structural properties — `type`, keyword presence —
 * and returns the matching `parse.*` handler. Falls back to `parse.schema`
 * for composite schemas (enum, anyOf, allOf, etc.) that do not map to a
 * primitive type discriminator.
 *
 * @param schema - The JSON Schema node to inspect.
 * @returns The appropriate parser from the `parse` namespace.
 *
 * @example
 * ```ts
 * import { JSONSchema, select } from 'x-to-zod';
 * const parser = select({ type: 'string', minLength: 1 });
 * ```
 */
export function select<S extends SchemaVersion = '2020-12'>(
	schema: JSONSchema<S, any, TypeValue>,
) {
	if (is.object(schema)) {
		return parse.object;
	} else if (is.array(schema)) {
		return parse.array;
	} else if (is.primitive(schema, 'string')) {
		return parse.string;
	} else if (
		is.primitive(schema, 'number') ||
		is.primitive(schema, 'integer')
	) {
		return parse.number;
	} else if (is.primitive(schema, 'boolean')) {
		return parse.boolean;
	} else if (is.primitive(schema, 'null')) {
		return parse.null;
	}
	// For enum and all other cases, use schema
	return parse.schema;
}
