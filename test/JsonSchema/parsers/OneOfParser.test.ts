import { describe, it, expect } from 'vitest';
import { OneOfParser } from '../../../src/JsonSchema/parsers/OneOfParser.js';
import type { Context, JsonSchemaObject } from '../../../src/Types.js';
import { buildV3 } from '../../../src/ZodBuilder/v3.js';
import { buildV4 } from '../../../src/ZodBuilder/v4.js';

describe('OneOfParser', () => {
	const createContext = (zodVersion: 'v3' | 'v4' = 'v3'): Context => ({
		zodVersion,
		build: zodVersion === 'v3' ? buildV3 : buildV4,
		path: [],
		seen: new Map(),
	});

	it('should handle empty oneOf array', () => {
		const schema: JsonSchemaObject = {
			oneOf: [],
		};
		const parser = new OneOfParser(schema, createContext());
		const result = parser.parse();
		
		expect(result).toBeDefined();
		expect(result.text()).toContain('z.any()');
	});

	it('should handle single oneOf option', () => {
		const schema: JsonSchemaObject = {
			oneOf: [{ type: 'string' }],
		};
		const parser = new OneOfParser(schema, createContext());
		const result = parser.parse();
		
		expect(result).toBeDefined();
		expect(result.text()).toContain('z.string()');
	});

	it('should create union for multiple oneOf options in v3', () => {
		const schema: JsonSchemaObject = {
			oneOf: [{ type: 'string' }, { type: 'number' }],
		};
		const parser = new OneOfParser(schema, createContext('v3'));
		const result = parser.parse();
		
		expect(result).toBeDefined();
		expect(result.text()).toContain('z.union');
		expect(result.text()).toContain('z.string()');
		expect(result.text()).toContain('z.number()');
	});

	it('should create xor for multiple oneOf options in v4', () => {
		const schema: JsonSchemaObject = {
			oneOf: [{ type: 'string' }, { type: 'number' }],
		};
		const parser = new OneOfParser(schema, createContext('v4'));
		const result = parser.parse();
		
		expect(result).toBeDefined();
		// V4 should use xor if available
		const text = result.text();
		expect(text).toMatch(/z\.(xor|union)/);
	});

	it('should handle complex oneOf with object schemas', () => {
		const schema: JsonSchemaObject = {
			oneOf: [
				{ type: 'object', properties: { name: { type: 'string' } } },
				{ type: 'array', items: { type: 'number' } },
			],
		};
		const parser = new OneOfParser(schema, createContext());
		const result = parser.parse();
		
		expect(result).toBeDefined();
		expect(result.text()).toContain('z.union');
	});

	it('should apply metadata to oneOf result', () => {
		const schema: JsonSchemaObject = {
			oneOf: [{ type: 'string' }, { type: 'number' }],
			description: 'Exactly one of these types',
		};
		const parser = new OneOfParser(schema, createContext());
		const result = parser.parse();
		
		expect(result).toBeDefined();
		expect(result.text()).toContain('Exactly one of these types');
	});

	it('should report canProduceType correctly', () => {
		const schema: JsonSchemaObject = {
			oneOf: [{ type: 'string' }],
		};
		const parser = new OneOfParser(schema, createContext());
		
		// Use type assertion to access protected method for testing
		expect((parser as any).canProduceType('union')).toBe(true);
		expect((parser as any).canProduceType('UnionBuilder')).toBe(true);
		expect((parser as any).canProduceType('oneOf')).toBe(true);
		expect((parser as any).canProduceType('XorBuilder')).toBe(true);
		expect((parser as any).canProduceType('string')).toBe(false);
	});
});
