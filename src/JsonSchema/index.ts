export { toZod } from './toZod.js';
import { parse as classParse } from './parsers/index.js';
import { parseConst } from './parsers/parseConst.js';
import { parseDefault } from './parsers/parseDefault.js';
import { parseEnum } from './parsers/parseEnum.js';
import { parseIfThenElse } from './parsers/parseIfThenElse.js';
import { parseMultipleType } from './parsers/parseMultipleType.js';
import { parseNot } from './parsers/parseNot.js';
import { parseNullable } from './parsers/parseNullable.js';
import { parseSchema } from './parsers/parseSchema.js';
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
	enum: parseEnum,

	// functional helpers that remain
	const: parseConst,
	default: parseDefault,
	ifThenElse: parseIfThenElse,
	multipleType: parseMultipleType,
	not: parseNot,
	nullable: parseNullable,
	schema: parseSchema,
	discriminator: undefined, // to be implemented
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
	} else if (its.an.enum(schema)) {
		return parse.enum;
	} else {
		return parse.schema;
	}
}
