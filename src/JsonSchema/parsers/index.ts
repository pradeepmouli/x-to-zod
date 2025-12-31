/**
 * Symmetric parse API providing direct access to parser classes.
 *
 * This module exports a parse object with methods for instantiating
 * parser classes directly, offering an alternative to the registry-based
 * selection in parseSchema.
 *
 * @module parsers/index
 */

import type { Context, JsonSchema, JsonSchemaObject } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
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
	 * @returns A ZodBuilder representing the parsed schema
	 */
	schema(schema: JsonSchema, refs: Context): ZodBuilder {
		return parseSchema(schema, refs);
	},

	/**
	 * Parse a JSON Schema object type.
	 *
	 * @param schema - The JSON Schema object to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A ZodBuilder representing the parsed object
	 */
	object(
		schema: JsonSchemaObject & { type?: string },
		refs: Context,
	): ZodBuilder {
		const parser = new (ObjectParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema array type.
	 *
	 * @param schema - The JSON Schema array to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A ZodBuilder representing the parsed array
	 */
	array(
		schema: JsonSchemaObject & { type?: string },
		refs: Context,
	): ZodBuilder {
		const parser = new (ArrayParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema string type.
	 *
	 * @param schema - The JSON Schema string to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A ZodBuilder representing the parsed string
	 */
	string(
		schema: JsonSchemaObject & { type?: string },
		refs: Context,
	): ZodBuilder {
		const parser = new (StringParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema number or integer type.
	 *
	 * @param schema - The JSON Schema number to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A ZodBuilder representing the parsed number
	 */
	number(
		schema: JsonSchemaObject & { type?: string },
		refs: Context,
	): ZodBuilder {
		const parser = new (NumberParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema boolean type.
	 *
	 * @param schema - The JSON Schema boolean to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A ZodBuilder representing the parsed boolean
	 */
	boolean(
		schema: JsonSchemaObject & { type?: string },
		refs: Context,
	): ZodBuilder {
		const parser = new (BooleanParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema null type.
	 *
	 * @param schema - The JSON Schema null to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A ZodBuilder representing the parsed null
	 */
	null(
		schema: JsonSchemaObject & { type?: string },
		refs: Context,
	): ZodBuilder {
		const parser = new (NullParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema anyOf combinator.
	 *
	 * @param schema - The JSON Schema with anyOf to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A ZodBuilder representing the parsed anyOf union
	 */
	anyOf(
		schema: JsonSchemaObject & { anyOf: JsonSchema[] },
		refs: Context,
	): ZodBuilder {
		const parser = new (AnyOfParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema allOf combinator.
	 *
	 * @param schema - The JSON Schema with allOf to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A ZodBuilder representing the parsed allOf intersection
	 */
	allOf(
		schema: JsonSchemaObject & { allOf: JsonSchema[] },
		refs: Context,
	): ZodBuilder {
		const parser = new (AllOfParser as any)(schema, refs);
		return parser.parse();
	},

	/**
	 * Parse a JSON Schema oneOf combinator.
	 *
	 * @param schema - The JSON Schema with oneOf to parse
	 * @param refs - Parsing context including references and configuration
	 * @returns A ZodBuilder representing the parsed oneOf discriminated union
	 */
	oneOf(
		schema: JsonSchemaObject & { oneOf: JsonSchema[] },
		refs: Context,
	): ZodBuilder {
		const parser = new (OneOfParser as any)(schema, refs);
		return parser.parse();
	},
};
