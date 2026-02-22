/**
 * Symmetric parse API providing direct access to parser classes.
 *
 * This module exports a parse object with methods for instantiating
 * parser classes directly, offering an alternative to the registry-based
 * selection in parseSchema.
 *
 * @module parsers/index
 */

import type { Context } from '../../Types.js';
import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import type { Builder } from '../../Builder/index.js';
import { parseSchema } from './parseSchema.js';
import { ObjectParser } from './ObjectParser.js';
import { ArrayParser } from './ArrayParser.js';
import { StringParser } from './StringParser.js';
import { NumberParser } from './NumberParser.js';
import { BooleanParser } from './BooleanParser.js';
import { NullParser } from './NullParser.js';
import { AnyOfParser } from './AnyOfParser.js';
import { AllOfParser } from './AllOfParser.js';
import { OneOfParser } from './OneOfParser.js';
import { EnumParser } from './EnumParser.js';
import { ConstParser } from './ConstParser.js';
import { TupleParser } from './TupleParser.js';
import { RecordParser } from './RecordParser.js';

/**
 * Symmetric parse API for creating parser instances.
 * Each method instantiates the corresponding parser class and calls parse().
 */
export const parse = {
	/**
	 * Parse a JSON Schema using the main parseSchema function.
	 * This is the primary entry point with full support for circular references,
	 * post-processors, and parser overrides.
	 *
	 * @param schema - The JSON Schema to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed schema
	 */
	schema(schema: JSONSchema, refs: Context): Builder {
		return parseSchema(schema, refs);
	},

	/**
	 * Parse a JSON Schema object type.
	 *
	 * @param schema - The JSON Schema object to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed object
	 */
	object(schema: JSONSchemaObject & { type?: string }, refs: Context): Builder {
		const parser = new (ObjectParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema array type.
	 *
	 * @param schema - The JSON Schema array to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed array
	 */
	array(schema: JSONSchemaObject & { type?: string }, refs: Context): Builder {
		const parser = new (ArrayParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema string type.
	 *
	 * @param schema - The JSON Schema string to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed string
	 */
	string(schema: JSONSchemaObject & { type?: string }, refs: Context): Builder {
		const parser = new (StringParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema number or integer type.
	 *
	 * @param schema - The JSON Schema number to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed number
	 */
	number(schema: JSONSchemaObject & { type?: string }, refs: Context): Builder {
		const parser = new (NumberParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema boolean type.
	 *
	 * @param schema - The JSON Schema boolean to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed boolean
	 */
	boolean(
		schema: JSONSchemaObject & { type?: string },
		refs: Context,
	): Builder {
		const parser = new (BooleanParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema null type.
	 *
	 * @param schema - The JSON Schema null to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed null
	 */
	null(schema: JSONSchemaObject & { type?: string }, refs: Context): Builder {
		const parser = new (NullParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema anyOf combinator.
	 *
	 * @param schema - The JSON Schema with anyOf to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed anyOf union
	 */
	anyOf(
		schema: JSONSchemaObject & { anyOf: JSONSchema[] },
		refs: Context,
	): Builder {
		const parser = new (AnyOfParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema allOf combinator.
	 *
	 * @param schema - The JSON Schema with allOf to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed allOf intersection
	 */
	allOf(
		schema: JSONSchemaObject & { allOf: JSONSchema[] },
		refs: Context,
	): Builder {
		const parser = new (AllOfParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema oneOf combinator.
	 *
	 * @param schema - The JSON Schema with oneOf to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed oneOf discriminated union
	 */
	oneOf(
		schema: JSONSchemaObject & { oneOf: JSONSchema[] },
		refs: Context,
	): Builder {
		const parser = new (OneOfParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema enum keyword.
	 * Produces `z.enum([...])` via the EnumBuilder.
	 *
	 * @param schema - The JSON Schema with enum to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed enum
	 */
	enum(schema: JSONSchemaObject & { enum: unknown[] }, refs: Context): Builder {
		const parser = new (EnumParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema const keyword.
	 * Produces `z.literal(...)` via the ConstBuilder.
	 *
	 * @param schema - The JSON Schema with const to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed const/literal
	 */
	const(schema: JSONSchemaObject & { const: unknown }, refs: Context): Builder {
		const parser = new (ConstParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema tuple type.
	 * Handles both `prefixItems` (draft 2020-12) and `items` as array (draft-07).
	 * Produces `z.tuple([...])` via the TupleBuilder.
	 *
	 * @param schema - The JSON Schema with tuple items to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed tuple
	 */
	tuple(schema: JSONSchemaObject, refs: Context): Builder {
		const parser = new (TupleParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Convenience alias for `parse.anyOf()`.
	 * Parses a JSON Schema `anyOf` combinator as a Zod union.
	 *
	 * @param schema - The JSON Schema with anyOf to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the union
	 */
	union(
		schema: JSONSchemaObject & { anyOf: JSONSchema[] },
		refs: Context,
	): Builder {
		const parser = new (AnyOfParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Convenience alias for `parse.allOf()`.
	 * Parses a JSON Schema `allOf` combinator as a Zod intersection.
	 *
	 * @param schema - The JSON Schema with allOf to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the intersection
	 */
	intersection(
		schema: JSONSchemaObject & { allOf: JSONSchema[] },
		refs: Context,
	): Builder {
		const parser = new (AllOfParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Convenience alias for `parse.oneOf()`.
	 * Parses a JSON Schema `oneOf` combinator as a Zod discriminated union.
	 *
	 * @param schema - The JSON Schema with oneOf to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the discriminated union
	 */
	discriminatedUnion(
		schema: JSONSchemaObject & { oneOf: JSONSchema[] },
		refs: Context,
	): Builder {
		const parser = new (OneOfParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Produce a `z.any()` builder. No JSON Schema parsing is required.
	 *
	 * @param _schema - Ignored; accepted for API consistency
	 * @param refs - Parsing context (used for builder reference)
	 * @returns A Builder representing `z.any()`
	 */
	any(_schema: JSONSchemaObject | undefined, refs: Context): Builder {
		return refs.build.any();
	},

	/**
	 * Produce a `z.unknown()` builder. No JSON Schema parsing is required.
	 *
	 * @param _schema - Ignored; accepted for API consistency
	 * @param refs - Parsing context (used for builder reference)
	 * @returns A Builder representing `z.unknown()`
	 */
	unknown(_schema: JSONSchemaObject | undefined, refs: Context): Builder {
		return refs.build.unknown();
	},

	/**
	 * Produce a `z.never()` builder. No JSON Schema parsing is required.
	 *
	 * @param _schema - Ignored; accepted for API consistency
	 * @param refs - Parsing context (used for builder reference)
	 * @returns A Builder representing `z.never()`
	 */
	never(_schema: JSONSchemaObject | undefined, refs: Context): Builder {
		return refs.build.never();
	},

	/**
	 * Parse a JSON Schema record / dictionary pattern.
	 * Produces `z.record(keySchema, valueSchema)` via the RecordBuilder.
	 *
	 * @param schema - The JSON Schema with additionalProperties to parse as a record
	 * @param refs - Parsing context including references and configuration
	 * @returns A Builder representing the parsed record
	 */
	record(schema: JSONSchemaObject, refs: Context): Builder {
		const parser = new (RecordParser as any)(schema, refs);
		return parser.parse();
	},
};
