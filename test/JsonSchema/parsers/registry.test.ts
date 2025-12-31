import { describe, it, expect } from 'vitest';
import { selectParserClass, parserRegistry } from '../../../src/JsonSchema/parsers/registry.js';
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
		it('maps all standard types to parser classes', () => {
			expect(parserRegistry.get('object')).toBe(ObjectParser);
			expect(parserRegistry.get('array')).toBe(ArrayParser);
			expect(parserRegistry.get('string')).toBe(StringParser);
			expect(parserRegistry.get('number')).toBe(NumberParser);
			expect(parserRegistry.get('integer')).toBe(NumberParser);
			expect(parserRegistry.get('boolean')).toBe(BooleanParser);
			expect(parserRegistry.get('null')).toBe(NullParser);
		});
	});

	describe('selectParserClass', () => {
		it('selects combinator parsers with highest priority', () => {
			expect(selectParserClass({ anyOf: [{ type: 'string' }] })).toBe(
				AnyOfParser,
			);
			expect(selectParserClass({ allOf: [{ type: 'string' }] })).toBe(
				AllOfParser,
			);
			expect(selectParserClass({ oneOf: [{ type: 'string' }] })).toBe(
				OneOfParser,
			);
		});

		it('selects parser based on explicit type property', () => {
			expect(selectParserClass({ type: 'object' })).toBe(ObjectParser);
			expect(selectParserClass({ type: 'array' })).toBe(ArrayParser);
			expect(selectParserClass({ type: 'string' })).toBe(StringParser);
			expect(selectParserClass({ type: 'number' })).toBe(NumberParser);
			expect(selectParserClass({ type: 'integer' })).toBe(NumberParser);
			expect(selectParserClass({ type: 'boolean' })).toBe(BooleanParser);
			expect(selectParserClass({ type: 'null' })).toBe(NullParser);
		});

		it('infers type from schema structure for objects', () => {
			// Note: its.an.object() checks type === 'object', not properties
			const schema = {
				type: 'object',
				properties: {
					name: { type: 'string' },
				},
			};
			expect(selectParserClass(schema)).toBe(ObjectParser);
		});

		it('infers type from schema structure for arrays', () => {
			// Note: its.an.array() checks type === 'array', not items
			const schema = {
				type: 'array',
				items: { type: 'string' },
			};
			expect(selectParserClass(schema)).toBe(ArrayParser);
		});

		it('infers type from schema structure for strings', () => {
			// Note: its.a.primitive() checks type === 'string'
			const schema = {
				type: 'string',
				minLength: 5,
				maxLength: 10,
			};
			expect(selectParserClass(schema)).toBe(StringParser);
		});

		it('infers type from schema structure for numbers', () => {
			// Note: its.a.primitive() checks type === 'number'
			const schema = {
				type: 'number',
				minimum: 0,
				maximum: 100,
			};
			expect(selectParserClass(schema)).toBe(NumberParser);
		});

		it('returns null for boolean schemas', () => {
			expect(selectParserClass(true)).toBeNull();
			expect(selectParserClass(false)).toBeNull();
		});

		it('returns null for schemas without clear type', () => {
			// Enum, const, not, etc. should return null
			expect(selectParserClass({ enum: ['a', 'b'] })).toBeNull();
			expect(selectParserClass({ const: 'value' })).toBeNull();
			expect(selectParserClass({ not: { type: 'string' } })).toBeNull();
		});

		it('prioritizes combinators over explicit type', () => {
			// Even if schema has explicit type, combinator takes priority
			const schema = {
				type: 'object',
				anyOf: [{ type: 'string' }, { type: 'number' }],
			};
			expect(selectParserClass(schema)).toBe(AnyOfParser);
		});

		it('prioritizes explicit type over inferred type', () => {
			// Schema has properties (would infer object) but explicit type is string
			const schema = {
				type: 'string',
				properties: {}, // This would normally infer object
			};
			expect(selectParserClass(schema)).toBe(StringParser);
		});
	});
});
