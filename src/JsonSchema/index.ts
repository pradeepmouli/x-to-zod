export { toZod } from './toZod.js';
import { parse as classParse } from './parsers/index.js';
import { parseDefault } from './parsers/parseDefault.js';
import { parseSchema } from './parsers/parseSchema.js';
import { parseRef } from '../SchemaProject/parseRef.js';
import { its } from './its.js';
import type { JsonSchemaObject, Context } from '../Types.js';

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

	// functional helpers
	default: parseDefault,
	discriminator: undefined, // to be implemented

	// Multi-schema support (capital names for clarity)
	Schema: parseSchema,
	Ref: parseRef,
};

export type transformer = (
	schema: JsonSchemaObject,
	refs: Context,
) => JsonSchemaObject | undefined;

export function select(schema: any) {
	if (its.an.object(schema)) {
		return parse.object;
	} else if (its.an.array(schema)) {
		return parse.array;
	} else if (its.a.primitive(schema, 'string')) {
		return parse.string;
	} else if (
		its.a.primitive(schema, 'number') ||
		its.a.primitive(schema, 'integer')
	) {
		return parse.number;
	} else if (its.a.primitive(schema, 'boolean')) {
		return parse.boolean;
	} else if (its.a.primitive(schema, 'null')) {
		return parse.null;
	}
	// For enum and all other cases, use Schema
	return parse.Schema;
}
