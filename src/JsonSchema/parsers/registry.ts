import type { JSONSchemaAny as JSONSchema } from '../types/index.js';
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
import { NotParser } from './NotParser.js';
import { NullableParser } from './NullableParser.js';
import { MultipleTypeParser } from './MultipleTypeParser.js';
import { ConditionalParser } from './ConditionalParser.js';
import { TupleParser } from './TupleParser.js';
import { its } from '../its.js';

/**
 * Type for parser class constructors.
 * Uses typeof to capture the actual class type including protected constructor.
 */
type ParserClass =
	| typeof ObjectParser
	| typeof ArrayParser
	| typeof StringParser
	| typeof NumberParser
	| typeof BooleanParser
	| typeof NullParser
	| typeof AnyOfParser
	| typeof AllOfParser
	| typeof OneOfParser
	| typeof EnumParser
	| typeof ConstParser
	| typeof NotParser
	| typeof NullableParser
	| typeof MultipleTypeParser
	| typeof ConditionalParser
	| typeof TupleParser;

/**
 * Registry mapping JSON Schema types to parser classes.
 * This enables dynamic parser selection based on schema characteristics.
 */
export const parserRegistry = new Map<string, ParserClass>([
	['object', ObjectParser],
	['array', ArrayParser],
	['string', StringParser],
	['number', NumberParser],
	['integer', NumberParser],
	['boolean', BooleanParser],
	['null', NullParser],
	['anyOf', AnyOfParser],
	['allOf', AllOfParser],
	['oneOf', OneOfParser],
]);

/**
 * Select the appropriate parser class for a given JSON Schema.
 *
 * Selection priority:
 * 1. Combinators (anyOf, allOf, oneOf) - highest priority
 * 2. Explicit type field lookup in registry
 * 3. Type inference using its.* utilities
 * 4. Default fallback (returns undefined, caller uses functional fallback)
 *
 * @param schema - JSON Schema to analyze
 * @returns Parser class constructor or undefined if no match
 */
export function selectParserClass(schema: JSONSchema): ParserClass | undefined {
	// Schema must be an object to have a parser
	if (typeof schema !== 'object' || schema === null) {
		return undefined;
	}

	// Check special cases first (highest priority)
	if (its.nullable(schema)) {
		return NullableParser;
	}
	if (its.not(schema)) {
		return NotParser;
	}
	// Check for enum keyword directly (including empty arrays)
	if ('enum' in schema && Array.isArray((schema as any).enum)) {
		return EnumParser;
	}
	if (its.const(schema)) {
		return ConstParser;
	}
	// Check for tuple: prefixItems (2020-12) or items as array (draft-07)
	if ('prefixItems' in schema && Array.isArray((schema as any).prefixItems)) {
		return TupleParser;
	}
	if ('items' in schema && Array.isArray((schema as any).items)) {
		return TupleParser;
	}
	if (its.multipleType(schema)) {
		return MultipleTypeParser;
	}
	if (its.conditional(schema)) {
		return ConditionalParser;
	}

	// Check combinators
	if (its.anyOf(schema)) {
		return parserRegistry.get('anyOf');
	}
	if (its.allOf(schema)) {
		return parserRegistry.get('allOf');
	}
	if (its.oneOf(schema)) {
		return parserRegistry.get('oneOf');
	}

	// Check explicit type field
	if ('type' in schema && typeof schema.type === 'string') {
		const parser = parserRegistry.get(schema.type);
		if (parser) {
			return parser;
		}
	}

	// Type inference using its.* utilities
	if (its.object(schema)) {
		return parserRegistry.get('object');
	}
	if (its.array(schema)) {
		return parserRegistry.get('array');
	}
	if (its.primitive(schema, 'string')) {
		return parserRegistry.get('string');
	}
	if (its.primitive(schema, 'number')) {
		return parserRegistry.get('number');
	}
	if (its.primitive(schema, 'integer')) {
		return parserRegistry.get('integer');
	}
	if (its.primitive(schema, 'boolean')) {
		return parserRegistry.get('boolean');
	}
	if (its.primitive(schema, 'null')) {
		return parserRegistry.get('null');
	}

	// No matching parser - caller should use functional fallback
	return undefined;
}
