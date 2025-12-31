import { describe, it, expect } from 'vitest';
import { AnyOfParser } from '../../../src/JsonSchema/parsers/AnyOfParser.js';
import type { Context, JsonSchemaObject } from '../../../src/Types.js';
import { buildV3 } from '../../../src/ZodBuilder/v3.js';

describe('AnyOfParser', () => {
	const createContext = (): Context => ({
		zodVersion: 'v3',
		build: buildV3,
		path: [],
		seen: new Map(),
	});

	it('should handle empty anyOf array', () => {
		const schema: JsonSchemaObject = {
			anyOf: [],
		};
		const parser = new AnyOfParser(schema, createContext());
		const result = parser.parse();

		expect(result).toBeDefined();
		expect(result.text()).toContain('z.any()');
	});

	it('should handle single anyOf option', () => {
		const schema: JsonSchemaObject = {
			anyOf: [{ type: 'string' }],
		};
		const parser = new AnyOfParser(schema, createContext());
		const result = parser.parse();

		expect(result).toBeDefined();
		expect(result.text()).toContain('z.string()');
	});

	it('should create union for multiple anyOf options', () => {
		const schema: JsonSchemaObject = {
			anyOf: [{ type: 'string' }, { type: 'number' }],
		};
		const parser = new AnyOfParser(schema, createContext());
		const result = parser.parse();

		expect(result).toBeDefined();
		expect(result.text()).toContain('z.union');
		expect(result.text()).toContain('z.string()');
		expect(result.text()).toContain('z.number()');
	});

	it('should handle complex anyOf with object schemas', () => {
		const schema: JsonSchemaObject = {
			anyOf: [
				{ type: 'object', properties: { name: { type: 'string' } } },
				{ type: 'array', items: { type: 'number' } },
			],
		};
		const parser = new AnyOfParser(schema, createContext());
		const result = parser.parse();

		expect(result).toBeDefined();
		expect(result.text()).toContain('z.union');
	});

	it('should apply metadata to union result', () => {
		const schema: JsonSchemaObject = {
			anyOf: [{ type: 'string' }, { type: 'number' }],
			description: 'A string or number value',
		};
		const parser = new AnyOfParser(schema, createContext());
		const result = parser.parse();

		expect(result).toBeDefined();
		expect(result.text()).toContain('A string or number value');
	});

	it('should report canProduceType correctly', () => {
		const schema: JsonSchemaObject = {
			anyOf: [{ type: 'string' }],
		};
		const parser = new AnyOfParser(schema, createContext());

		// Use type assertion to access protected method for testing
		expect((parser as any).canProduceType('union')).toBe(true);
		expect((parser as any).canProduceType('UnionBuilder')).toBe(true);
		expect((parser as any).canProduceType('anyOf')).toBe(true);
		expect((parser as any).canProduceType('string')).toBe(false);
	});
});
