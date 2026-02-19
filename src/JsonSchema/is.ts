import type { SetReadonly, SetRequired } from 'type-fest';
import type { Serializable } from '../Types.js';
import type {
	JSONSchemaObject,
	JSONSchemaAny as JSONSchema,
	SchemaVersion,
} from './types/index.js';

const isSchemaObject = (value: unknown): value is JSONSchemaObject =>
	typeof value === 'object' && value !== null;

export function isObjectSchema(
	value: unknown,
): value is JSONSchemaObject & { type: 'object' } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.type === 'object';
}

export function isArraySchema(
	value: unknown,
): value is JSONSchemaObject & { type: 'array' } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.type === 'array';
}

export function isAnyOfSchema(
	value: unknown,
): value is JSONSchemaObject & { anyOf: JSONSchema[] } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.anyOf !== undefined;
}

export function isAllOfSchema(
	value: unknown,
): value is JSONSchemaObject & { allOf: JSONSchema[] } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.allOf !== undefined;
}

export function isEnumSchema(
	value: unknown,
): value is JSONSchemaObject & { enum: Serializable[] } {
	if (!isSchemaObject(value)) {
		return false;
	}
	return Array.isArray((value as any).enum) && (value as any).enum.length > 0;
}

export function isNullableSchema(
	value: unknown,
): value is JSONSchemaObject & { nullable: true } {
	if (!isSchemaObject(value)) {
		return false;
	}
	return (value as any).nullable === true;
}

export function isMultipleTypeSchema(
	value: unknown,
): value is JSONSchemaObject & { type: string[] } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return Array.isArray(schema.type);
}

export function isNotSchema(
	value: unknown,
): value is JSONSchemaObject & { not: JSONSchema } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.not !== undefined;
}

export function isConstSchema<V extends SchemaVersion>(
	value: unknown,
): value is SetRequired<JSONSchemaObject<V>, 'const'> {
	if (!isSchemaObject(value)) {
		return false;
	}
	return value.const !== undefined;
}

export function isPrimitiveSchema<
	T extends 'string' | 'number' | 'integer' | 'boolean' | 'null',
>(value: unknown, primitive: T): value is JSONSchemaObject & { type: T } {
	if (!isSchemaObject(value)) {
		return false;
	}
	const schema = value as any;
	return schema.type === primitive;
}

export function isConditionalSchema(
	value: unknown,
): value is JSONSchemaObject & {
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
): value is JSONSchemaObject & { oneOf: JSONSchema[] } {
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
