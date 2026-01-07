import type { JsonSchema } from '../../Types.js';
import { ObjectParser } from './ObjectParser.js';
import { ArrayParser } from './ArrayParser.js';
import { StringParser } from './StringParser.js';
import { NumberParser } from './NumberParser.js';
import { BooleanParser } from './BooleanParser.js';
import { NullParser } from './NullParser.js';
import { AnyOfParser } from './AnyOfParser.js';
import { AllOfParser } from './AllOfParser.js';
import { OneOfParser } from './OneOfParser.js';
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
	| typeof OneOfParser;

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
export function selectParserClass(schema: JsonSchema): ParserClass | undefined {
	// Schema must be an object to have a parser
	if (typeof schema !== 'object' || schema === null) {
		return undefined;
	}

	// Check combinators first (highest priority)
	if (its.an.anyOf(schema)) {
		return parserRegistry.get('anyOf');
	}
	if (its.an.allOf(schema)) {
		return parserRegistry.get('allOf');
	}
	if (its.a.oneOf(schema)) {
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
	if (its.an.object(schema)) {
		return parserRegistry.get('object');
	}
	if (its.an.array(schema)) {
		return parserRegistry.get('array');
	}
	if (its.a.primitive(schema, 'string')) {
		return parserRegistry.get('string');
	}
	if (its.a.primitive(schema, 'number')) {
		return parserRegistry.get('number');
	}
	if (its.a.primitive(schema, 'integer')) {
		return parserRegistry.get('integer');
	}
	if (its.a.primitive(schema, 'boolean')) {
		return parserRegistry.get('boolean');
	}
	if (its.a.primitive(schema, 'null')) {
		return parserRegistry.get('null');
	}

	// No matching parser - caller should use functional fallback
	return undefined;
}
