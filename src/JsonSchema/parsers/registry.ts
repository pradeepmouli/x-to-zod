import type { JSONSchemaAny as JSONSchema } from '../types/index.js';
import type { ParserConstructor } from '../../Parser/index.js';
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
import { is } from '../is.js';

/**
 * Registry mapping JSON Schema types to parser constructors.
 * This enables dynamic parser selection based on schema characteristics.
 */
export const parserRegistry = new Map<string, ParserConstructor>([
	['object', ObjectParser as ParserConstructor],
	['array', ArrayParser as ParserConstructor],
	['string', StringParser as ParserConstructor],
	['number', NumberParser as ParserConstructor],
	['integer', NumberParser as ParserConstructor],
	['boolean', BooleanParser as ParserConstructor],
	['null', NullParser as ParserConstructor],
	['anyOf', AnyOfParser as ParserConstructor],
	['allOf', AllOfParser as ParserConstructor],
	['oneOf', OneOfParser as ParserConstructor],
]);

/**
 * Register a custom parser for a given typeKind.
 * The parser class must implement the Parser interface (typeKind + parse()).
 * Runtime validation ensures structural correctness (Risk 7).
 *
 * @param typeKind - The schema type identifier this parser handles
 * @param cls - The parser constructor to register
 */
export function registerParser(
	typeKind: string,
	cls: ParserConstructor,
): void {
	// Runtime validation: check the constructor produces a structurally valid Parser
	// We validate the prototype rather than constructing an instance to avoid side-effects
	const proto = cls.prototype as { typeKind?: unknown; parse?: unknown };
	if (typeof proto.parse !== 'function') {
		throw new Error(
			`registerParser: class registered for '${typeKind}' must have a parse() method`,
		);
	}
	parserRegistry.set(typeKind, cls);
}

/**
 * Select the appropriate parser class for a given JSON Schema.
 *
 * Selection priority:
 * 1. Combinators (anyOf, allOf, oneOf) - highest priority
 * 2. Explicit type field lookup in registry
 * 3. Type inference using is.* utilities
 * 4. Default fallback (returns undefined, caller uses functional fallback)
 *
 * @param schema - JSON Schema to analyze
 * @returns Parser constructor or undefined if no match
 */
export function selectParserClass(
	schema: JSONSchema,
): ParserConstructor | undefined {
	// Schema must be an object to have a parser
	if (typeof schema !== 'object' || schema === null) {
		return undefined;
	}

	// Check special cases first (highest priority)
	if (is.nullable(schema)) {
		return NullableParser as ParserConstructor;
	}
	if (is.not(schema)) {
		return NotParser as ParserConstructor;
	}
	// Check for enum keyword directly (including empty arrays)
	if ('enum' in schema && Array.isArray((schema as any).enum)) {
		return EnumParser as ParserConstructor;
	}
	if (is.const(schema)) {
		return ConstParser as ParserConstructor;
	}
	// Check for tuple: prefixItems (2020-12) or items as array (draft-07)
	if ('prefixItems' in schema && Array.isArray((schema as any).prefixItems)) {
		return TupleParser as ParserConstructor;
	}
	if ('items' in schema && Array.isArray((schema as any).items)) {
		return TupleParser as ParserConstructor;
	}
	if (is.multipleType(schema)) {
		return MultipleTypeParser as ParserConstructor;
	}
	if (is.conditional(schema)) {
		return ConditionalParser as ParserConstructor;
	}

	// Check combinators
	if (is.anyOf(schema)) {
		return parserRegistry.get('anyOf');
	}
	if (is.allOf(schema)) {
		return parserRegistry.get('allOf');
	}
	if (is.oneOf(schema)) {
		return parserRegistry.get('oneOf');
	}

	// Check explicit type field
	if ('type' in schema && typeof schema.type === 'string') {
		const parser = parserRegistry.get(schema.type);
		if (parser) {
			return parser;
		}
	}

	// Type inference using is.* utilities
	if (is.object(schema)) {
		return parserRegistry.get('object');
	}
	if (is.array(schema)) {
		return parserRegistry.get('array');
	}
	if (is.primitive(schema, 'string')) {
		return parserRegistry.get('string');
	}
	if (is.primitive(schema, 'number')) {
		return parserRegistry.get('number');
	}
	if (is.primitive(schema, 'integer')) {
		return parserRegistry.get('integer');
	}
	if (is.primitive(schema, 'boolean')) {
		return parserRegistry.get('boolean');
	}
	if (is.primitive(schema, 'null')) {
		return parserRegistry.get('null');
	}

	// No matching parser - caller should use functional fallback
	return undefined;
}
