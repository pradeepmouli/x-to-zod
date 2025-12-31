import type { JsonSchema, Context } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
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
 * Type for parser class constructors
 */
export type ParserClass = new (schema: JsonSchema, refs: Context) => BaseParser;

/**
 * Maps JSON Schema types to their corresponding parser classes
 */
export const parserRegistry = new Map<string, ParserClass>([
	['object', ObjectParser],
	['array', ArrayParser],
	['string', StringParser],
	['number', NumberParser],
	['integer', NumberParser],
	['boolean', BooleanParser],
	['null', NullParser],
]);

/**
 * Selects the appropriate parser class for a given JSON Schema.
 * 
 * Selection priority:
 * 1. Combinator schemas (anyOf, allOf, oneOf)
 * 2. Explicit type property
 * 3. Inferred type from schema structure
 * 4. Default fallback (any)
 * 
 * @param schema - The JSON Schema to parse
 * @returns The appropriate parser class constructor
 */
export function selectParserClass(schema: JsonSchema): ParserClass | null {
	// Handle boolean schemas
	if (typeof schema === 'boolean') {
		return null; // Boolean schemas are handled directly in parseSchema
	}

	const schemaObj = schema;

	// Priority 1: Check combinators first (highest priority)
	if (its.an.anyOf(schemaObj)) {
		return AnyOfParser;
	}
	if (its.an.allOf(schemaObj)) {
		return AllOfParser;
	}
	if (its.a.oneOf(schemaObj)) {
		return OneOfParser;
	}

	// Priority 2: Explicit type property
	if (typeof (schemaObj as any).type === 'string') {
		const ParserClass = parserRegistry.get((schemaObj as any).type);
		if (ParserClass) {
			return ParserClass;
		}
	}

	// Priority 3: Infer type from schema structure using its.* utilities
	if (its.an.object(schemaObj)) {
		return ObjectParser;
	}
	if (its.an.array(schemaObj)) {
		return ArrayParser;
	}
	if (its.a.primitive(schemaObj, 'string')) {
		return StringParser;
	}
	if (its.a.primitive(schemaObj, 'number') || its.a.primitive(schemaObj, 'integer')) {
		return NumberParser;
	}
	if (its.a.primitive(schemaObj, 'boolean')) {
		return BooleanParser;
	}
	if (its.a.primitive(schemaObj, 'null')) {
		return NullParser;
	}

	// Priority 4: No clear type - return null and let parseSchema handle it
	// (parseSchema will fall back to existing logic for enum, const, not, etc.)
	return null;
}
