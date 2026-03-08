import type { JSONSchema as JSONSchema07 } from 'json-schema-typed/draft-07';
import type { JSONSchema as JSONSchema2019 } from 'json-schema-typed/draft-2019-09';
import type { JSONSchema as JSONSchema2020 } from 'json-schema-typed/draft-2020-12';
import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import type { Merge } from 'type-fest';

export type SchemaVersion =
	| '2020-12'
	| '2019-09'
	| '07'
	| 'OpenAPI3.0'
	| 'OpenAPI3.1';

export type TypeValueToTypeMap = {
	object: object;
	array: unknown[];
	string: string;
	number: number;
	integer: number;
	boolean: boolean;
	null: null;
	any: any;
};

export type TypeValueToType<Val extends TypeValue> = TypeValueToTypeMap[Val];

export type TypeToTypeValue<T> = T extends number
	? 'number' | 'integer'
	: T extends TypeValueToType<infer Val>
		? Val
		: never;

export type RealSchema<T> = T extends
	| JSONSchema07
	| JSONSchema2019
	| JSONSchema2020
	? Exclude<T, boolean>
	: never;

export type TypeValue =
	| 'object'
	| 'array'
	| 'string'
	| 'number'
	| 'integer'
	| 'boolean'
	| 'null'
	| 'any';

export type OpenAPISchemaV3<
	T,
	V extends TypeValue = TypeToTypeValue<T>,
> = Merge<OpenAPIV3.BaseSchemaObject, Exclude<JSONSchema2020<T, V>, boolean>>;

export type OpenAPISchemaV3_1<
	T,
	V extends TypeValue = TypeToTypeValue<T>,
> = Merge<OpenAPIV3_1.BaseSchemaObject, Exclude<JSONSchema2020<T, V>, boolean>>;

type JSONSchemaMap<T, V extends TypeValue = TypeToTypeValue<T>> = {
	'2020-12': JSONSchema2020<T, V>;
	'2019-09': JSONSchema2019<T, V>;
	'07': JSONSchema07<T, V>;
	'OpenAPI3.0': OpenAPISchemaV3<T, V>;
	'OpenAPI3.1': OpenAPISchemaV3_1<T, V>;
};

export type JSONSchema<
	Version extends SchemaVersion,
	T = any,
	V extends TypeValue = TypeToTypeValue<T>,
> = JSONSchemaMap<T, V>[Version];

export type JSONSchemaAny<Version extends SchemaVersion = SchemaVersion> =
	JSONSchema<Version, any, TypeValue>;

export type SchemaNode<Version extends SchemaVersion = SchemaVersion> = Exclude<
	JSONSchemaAny<Version>,
	boolean
>;

/**
 * A `SchemaNode` narrowed to a specific `type` discriminator.
 *
 * Use this instead of the verbose `SchemaNode & { type: 'string' }` intersection.
 *
 * @example
 * ```ts
 * class StringParser extends AbstractParser<TypedSchema<'string'>> { ... }
 * class NumberParser extends AbstractParser<TypedSchema<'number' | 'integer'>> { ... }
 * ```
 */
export type TypedSchema<
	T extends string = string,
	Version extends SchemaVersion = SchemaVersion,
> = SchemaNode<Version> & { type: T };

// Named type-based schema aliases — consistent with Zod's naming (ZodString, ZodNumber, etc.)
export type StringSchema<V extends SchemaVersion = SchemaVersion> = TypedSchema<
	'string',
	V
>;
export type NumberSchema<V extends SchemaVersion = SchemaVersion> = TypedSchema<
	'number' | 'integer',
	V
>;
export type BooleanSchema<V extends SchemaVersion = SchemaVersion> =
	TypedSchema<'boolean', V>;
export type NullSchema<V extends SchemaVersion = SchemaVersion> = TypedSchema<
	'null',
	V
>;
export type ObjectSchema<V extends SchemaVersion = SchemaVersion> = TypedSchema<
	'object',
	V
>;
export type ArraySchema<V extends SchemaVersion = SchemaVersion> = TypedSchema<
	'array',
	V
>;

// Named keyword-based schema aliases — narrowed to their required keyword properties
export type EnumSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & { enum: unknown[] };
export type ConstSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & { const: unknown };
export type AnyOfSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & { anyOf: JSONSchemaAny<V>[] };
export type AllOfSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & { allOf: JSONSchemaAny<V>[] };
export type OneOfSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & { oneOf: JSONSchemaAny<V>[] };
export type NotSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & { not: JSONSchemaAny<V> };
export type ConditionalSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & {
		if: JSONSchemaAny<V>;
		then: JSONSchemaAny<V>;
		else: JSONSchemaAny<V>;
	};
export type NullableSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & { nullable: true };
export type TupleSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & {
		prefixItems?: JSONSchemaAny<V>[];
		items?: JSONSchemaAny<V>[] | JSONSchemaAny<V>;
	};
export type RecordSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & { additionalProperties?: JSONSchemaAny<V> | boolean };
export type MultipleTypeSchema<V extends SchemaVersion = SchemaVersion> =
	SchemaNode<V> & { type: string[] };

export type transformer = <
	Version extends SchemaVersion = '2020-12',
	T = object,
	V extends TypeValue = TypeValue,
>(
	schema: JSONSchema<Version, T, V>,
	refs: any,
) => JSONSchema<Version, T, TypeValue> | undefined;

export function isJSONSchema(schema: JSONSchemaAny): schema is SchemaNode {
	return (
		typeof schema === 'object' && schema !== null && !Array.isArray(schema)
	);
}

export function getSchemaVersion<T extends SchemaVersion>(
	schema: SchemaNode<any>,
): T {
	if ('$schema' in schema && typeof schema.$schema === 'string') {
		const version = schema.$schema;
		if (version.includes('2020-12')) {
			return '2020-12' as T;
		} else if (version.includes('2019-09')) {
			return '2019-09' as T;
		} else if (version.includes('draft-07') || version.includes('07')) {
			return '07' as T;
		} else if (version.includes('openapi') && version.includes('3.0')) {
			return 'OpenAPI3.0' as T;
		}
	}
	// Default to latest if not specified
	return '2020-12' as T;
}

export function isVersion<T extends SchemaVersion>(
	schema: SchemaNode<any>,
	version: T,
): schema is SchemaNode<T> {
	const schemaVersion = getSchemaVersion(schema);
	return schemaVersion === version;
}
