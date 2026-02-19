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
