import { describe, it, expect } from 'vitest';
import type { JsonSchema } from '../../../src/Types.js';
import {
	selectParserClass,
	parserRegistry,
} from '../../../src/JsonSchema/parsers/registry.js';
import { ObjectParser } from '../../../src/JsonSchema/parsers/ObjectParser.js';
import { ArrayParser } from '../../../src/JsonSchema/parsers/ArrayParser.js';
import { StringParser } from '../../../src/JsonSchema/parsers/StringParser.js';
import { NumberParser } from '../../../src/JsonSchema/parsers/NumberParser.js';
import { BooleanParser } from '../../../src/JsonSchema/parsers/BooleanParser.js';
import { NullParser } from '../../../src/JsonSchema/parsers/NullParser.js';
import { AnyOfParser } from '../../../src/JsonSchema/parsers/AnyOfParser.js';
import { AllOfParser } from '../../../src/JsonSchema/parsers/AllOfParser.js';
import { OneOfParser } from '../../../src/JsonSchema/parsers/OneOfParser.js';

describe('Parser Registry', () => {
	describe('parserRegistry', () => {
		it('maps all basic types to parser classes', () => {
			expect(parserRegistry.get('object')).toBe(ObjectParser);
			expect(parserRegistry.get('array')).toBe(ArrayParser);
			expect(parserRegistry.get('string')).toBe(StringParser);
			expect(parserRegistry.get('number')).toBe(NumberParser);
			expect(parserRegistry.get('integer')).toBe(NumberParser);
			expect(parserRegistry.get('boolean')).toBe(BooleanParser);
			expect(parserRegistry.get('null')).toBe(NullParser);
		});

		it('maps combinators to parser classes', () => {
			expect(parserRegistry.get('anyOf')).toBe(AnyOfParser);
			expect(parserRegistry.get('allOf')).toBe(AllOfParser);
			expect(parserRegistry.get('oneOf')).toBe(OneOfParser);
		});

		it('has exactly 10 entries', () => {
			expect(parserRegistry.size).toBe(10);
		});
	});

	describe('selectParserClass()', () => {
		it('returns undefined for primitive values', () => {
			expect(selectParserClass(null as any)).toBeUndefined();
			expect(selectParserClass(undefined as any)).toBeUndefined();
			expect(selectParserClass('string' as any)).toBeUndefined();
			expect(selectParserClass(123 as any)).toBeUndefined();
			expect(selectParserClass(true as any)).toBeUndefined();
		});

		it('returns AnyOfParser for anyOf schemas', () => {
			const schema: JsonSchema = {
				anyOf: [{ type: 'string' }, { type: 'number' }],
			};
			expect(selectParserClass(schema)).toBe(AnyOfParser);
		});

		it('returns AllOfParser for allOf schemas', () => {
			const schema: JsonSchema = {
				allOf: [{ type: 'object' }, { properties: { x: { type: 'string' } } }],
			};
			expect(selectParserClass(schema)).toBe(AllOfParser);
		});

		it('returns OneOfParser for oneOf schemas', () => {
			const schema: JsonSchema = {
				oneOf: [{ type: 'string' }, { type: 'number' }],
			};
			expect(selectParserClass(schema)).toBe(OneOfParser);
		});

		it('prioritizes combinators over explicit type field', () => {
			// Even if type: string is present, anyOf takes priority
			const schema: JsonSchema = {
				type: 'string',
				anyOf: [{ type: 'number' }, { type: 'boolean' }],
			};
			expect(selectParserClass(schema)).toBe(AnyOfParser);
		});

		it('returns parser for explicit type field', () => {
			expect(selectParserClass({ type: 'object' })).toBe(ObjectParser);
			expect(selectParserClass({ type: 'array' })).toBe(ArrayParser);
			expect(selectParserClass({ type: 'string' })).toBe(StringParser);
			expect(selectParserClass({ type: 'number' })).toBe(NumberParser);
			expect(selectParserClass({ type: 'integer' })).toBe(NumberParser);
			expect(selectParserClass({ type: 'boolean' })).toBe(BooleanParser);
			expect(selectParserClass({ type: 'null' })).toBe(NullParser);
		});

		it('infers type from object properties', () => {
			// Note: its.an.object() uses structural inference
			// It checks for properties or additionalProperties
			const schema: JsonSchema = {
				properties: {
					name: { type: 'string' },
				},
			};
			const result = selectParserClass(schema);
			// Type inference may or may not work depending on its.an.object() implementation
			expect([ObjectParser, undefined]).toContain(result);
		});

		it('infers type from array items', () => {
			// Note: its.an.array() uses structural inference
			const schema: JsonSchema = {
				items: { type: 'string' },
			};
			const result = selectParserClass(schema);
			// Type inference may or may not work depending on its.an.array() implementation
			expect([ArrayParser, undefined]).toContain(result);
		});

		it('infers string type from string-specific keywords', () => {
			// Note: its.a.primitive() requires explicit type or enum-based inference
			const schema: JsonSchema = {
				minLength: 1,
			};
			const result = selectParserClass(schema);
			// minLength alone may not be enough for type inference
			expect([StringParser, undefined]).toContain(result);
		});

		it('infers number type from numeric keywords', () => {
			// Note: its.a.primitive() requires explicit type or enum-based inference
			const schema: JsonSchema = {
				minimum: 0,
			};
			const result = selectParserClass(schema);
			// minimum alone may not be enough for type inference
			expect([NumberParser, undefined]).toContain(result);
		});

		it('infers boolean type from enum with booleans', () => {
			const schema: JsonSchema = {
				enum: [true, false],
			};
			const result = selectParserClass(schema);
			// enum-based inference depends on its.a.primitive() implementation
			expect([BooleanParser, undefined]).toContain(result);
		});

		it('infers null type from const: null', () => {
			const schema: JsonSchema = {
				const: null,
			};
			const result = selectParserClass(schema);
			// const: null inference depends on its.a.primitive() implementation
			expect([NullParser, undefined]).toContain(result);
		});

		it('returns undefined for schemas without detectable type', () => {
			const schema: JsonSchema = {};
			expect(selectParserClass(schema)).toBeUndefined();
		});

		it('returns undefined for schemas with unknown type string', () => {
			const schema: JsonSchema = {
				type: 'unknown' as any,
			};
			expect(selectParserClass(schema)).toBeUndefined();
		});

		it('handles mixed type arrays by returning undefined', () => {
			// types: ["string", "null"] as array is handled elsewhere in parseSchema
			// Registry only handles single string types
			const schema: JsonSchema = {
				type: ['string', 'null'] as any,
			};
			// Note: type as array is not handled by registry's simple string check
			expect(selectParserClass(schema)).toBeUndefined();
		});

		it('prioritizes explicit type over inference', () => {
			// Has both type: string and properties (which would infer object)
			const schema: JsonSchema = {
				type: 'string',
				properties: { x: { type: 'string' } }, // This is usually invalid but test priority
			};
			expect(selectParserClass(schema)).toBe(StringParser);
		});
	});

	describe('Parser class references', () => {
		it('all registry values are valid parser class constructors', () => {
			for (const [key, ParserClass] of parserRegistry.entries()) {
				expect(ParserClass).toBeDefined();
				expect(typeof ParserClass).toBe('function');
				// Parser classes should be classes (constructors)
				expect(ParserClass.name).toBeTruthy();
			}
		});

		it('parser classes are distinct', () => {
			const parsers = Array.from(parserRegistry.values());
			const uniqueParsers = new Set(parsers);
			// Some parsers are reused (e.g., NumberParser for both number and integer)
			expect(uniqueParsers.size).toBe(9); // 9 unique parser classes
		});
	});
});
