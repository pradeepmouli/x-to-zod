export { toZod } from './toZod.js';
import { parse as classParse } from './parsers/index.js';
import { parseDefault } from './parsers/parseDefault.js';
import { parseSchema } from './parsers/parseSchema.js';
import { parseRef } from '../SchemaProject/parseRef.js';
import { its } from './its.js';
import * as JSONSchema07 from './types/draft07.js'
import * as JSONSchema2019 from './types/draft2019-9.js'
import * as JSONSchema2020 from './types/draft2020-12.js'
import type { JsonSchemaObject } from '../Types.js';
import type { Simplify } from 'type-fest';
import { Interface } from 'readline/promises';

export type SchemaVersion = '2020-12' | '2019-09' | '07' | 'OpenAPI3.0';

export type TypeValue = 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'any';

type JSONSchemaMap<T,V extends TypeValue> =
{
	'2020-12': JSONSchema2020.default.Interface<T,V>,
	'2019-09': JSONSchema2019.default.Interface<T,V>,
	'07': JSONSchema07.default.Interface<T,V>,
	'OpenAPI3.0': JSONSchema2020.default.Interface<T,V>, // OpenAPI 3.0 uses a subset of Draft 2020-12
}


export type JSONSchema<Version extends SchemaVersion, T, V extends TypeValue> = Simplify<
	JSONSchemaMap<T,V>[Version]
>;

type test = JSONSchema<'07', any, any>;

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

export type transformer = <Version extends SchemaVersion = '2020-12'>(
	schema: JSONSchema<Version, object, any	>,
	refs: any,
) => JsonSchemaObject | undefined;

export function select<S extends SchemaVersion = '2020-12'>(schema: JSONSchema<S,any,any>) {
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
