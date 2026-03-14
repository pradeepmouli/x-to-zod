import type { SetRequired } from 'type-fest';
import type { Serializable } from '../ZodBuilder/types.js';
import type {
	SchemaNode,
	JSONSchemaAny as JSONSchema,
	SchemaVersion,
} from './types/index.js';

const isSchemaObject = (value: unknown): value is SchemaNode =>
	typeof value === 'object' && value !== null;

export function isObjectSchema(
	value: unknown,
): value is SchemaNode & { type: 'object' } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.type === 'object';
}

export function isArraySchema(
	value: unknown,
): value is SchemaNode & { type: 'array' } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.type === 'array';
}

export function isAnyOfSchema(
	value: unknown,
): value is SchemaNode & { anyOf: JSONSchema[] } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.anyOf !== undefined;
}

export function isAllOfSchema(
	value: unknown,
): value is SchemaNode & { allOf: JSONSchema[] } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.allOf !== undefined;
}

export function isEnumSchema(
	value: unknown,
): value is SchemaNode & { enum: Serializable[] } {
	if (!isSchemaObject(value)) {
		return false;
	}
	return Array.isArray((value as any).enum) && (value as any).enum.length > 0;
}

export function isNullableSchema(
	value: unknown,
): value is SchemaNode & { nullable: true } {
	if (!isSchemaObject(value)) {
		return false;
	}
	return (value as any).nullable === true;
}

export function isMultipleTypeSchema(
	value: unknown,
): value is SchemaNode & { type: string[] } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return Array.isArray(schema.type);
}

export function isNotSchema(
	value: unknown,
): value is SchemaNode & { not: JSONSchema } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.not !== undefined;
}

export function isConstSchema<V extends SchemaVersion>(
	value: unknown,
): value is SetRequired<SchemaNode<V>, 'const'> {
	if (!isSchemaObject(value)) {
		return false;
	}
	return value.const !== undefined;
}

export function isPrimitiveSchema<
	T extends 'string' | 'number' | 'integer' | 'boolean' | 'null',
>(value: unknown, primitive: T): value is SchemaNode & { type: T } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.type === primitive;
}

export function isConditionalSchema(value: unknown): value is SchemaNode & {
	if: JSONSchema;
	then: JSONSchema;
	else: JSONSchema;
} {
	if (!isSchemaObject(value)) {
		return false;
	}
	return Boolean(
		'if' in value &&
		(value as any).if &&
		'then' in value &&
		'else' in value &&
		(value as any).then &&
		(value as any).else,
	);
}

export function isOneOfSchema(
	value: unknown,
): value is SchemaNode & { oneOf: JSONSchema[] } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.oneOf !== undefined;
}

export const is = {
	object: isObjectSchema,
	array: isArraySchema,
	anyOf: isAnyOfSchema,
	allOf: isAllOfSchema,
	enum: isEnumSchema,
	nullable: isNullableSchema,
	multipleType: isMultipleTypeSchema,
	not: isNotSchema,
	const: isConstSchema,
	primitive: isPrimitiveSchema,
	conditional: isConditionalSchema,
	oneOf: isOneOfSchema,
};
