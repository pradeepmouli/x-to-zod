import type { JSONSchema as JSONSchema07 } from 'json-schema-typed/draft-07';
import type { JSONSchema as JSONSchema2019 } from 'json-schema-typed/draft-2019-09';
import type { JSONSchema as JSONSchema2020 } from 'json-schema-typed/draft-2020-12';
import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import type { Merge } from 'type-fest';

export type SchemaVersion = '2020-12' | '2019-09' | '07' | 'OpenAPI3.0' | 'OpenAPI3.1';

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


export type OpenAPISchemaV3<T, V extends TypeValue = TypeToTypeValue<T>> =  Merge<OpenAPIV3.BaseSchemaObject, Exclude<JSONSchema2020<T,V>, boolean>>;

export type OpenAPISchemaV3_1<T, V extends TypeValue = TypeToTypeValue<T>> = Merge<OpenAPIV3_1.BaseSchemaObject, Exclude<JSONSchema2020<T,V>, boolean>>;

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

export type JSONSchemaObject<Version extends SchemaVersion = SchemaVersion> =
	Exclude<JSONSchemaAny<Version>, boolean>;
export type transformer = <
	Version extends SchemaVersion = '2020-12',
	T = object,
	V extends TypeValue = TypeValue,
>(
	schema: JSONSchema<Version, T, V>,
	refs: any,
) => JSONSchema<Version, T, TypeValue> | undefined;

export function isJSONSchema(
	schema: JSONSchemaAny,
): schema is JSONSchemaObject {
	return (
		typeof schema === 'object' && schema !== null && !Array.isArray(schema)
	);
}

export function getSchemaVersion<T extends SchemaVersion>(
	schema: JSONSchemaObject<any>,
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
	schema: JSONSchemaObject<any>,
	version: T,
): schema is JSONSchemaObject<T> {
	const schemaVersion = getSchemaVersion(schema);
	return schemaVersion === version;
}
