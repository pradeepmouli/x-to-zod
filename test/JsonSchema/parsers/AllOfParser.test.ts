import { describe, it, expect } from 'vitest';
import { AllOfParser } from '../../../src/JsonSchema/parsers/AllOfParser.js';
import type { Context, JsonSchemaObject } from '../../../src/Types.js';
import { buildV3 } from '../../../src/ZodBuilder/v3.js';

describe('AllOfParser', () => {
	const createContext = (): Context => ({
		zodVersion: 'v3',
		build: buildV3,
		path: [],
		seen: new Map(),
	});

	it('should handle empty allOf array', () => {
		const schema: JsonSchemaObject = {
			allOf: [],
		};
		const parser = new AllOfParser(schema, createContext());
		const result = parser.parse();
		
		expect(result).toBeDefined();
		expect(result.text()).toContain('z.never()');
	});

	it('should handle single allOf option', () => {
		const schema: JsonSchemaObject = {
			allOf: [{ type: 'string' }],
		};
		const parser = new AllOfParser(schema, createContext());
		const result = parser.parse();
		
		expect(result).toBeDefined();
		expect(result.text()).toContain('z.string()');
	});

	it('should create intersection for multiple allOf options', () => {
		const schema: JsonSchemaObject = {
			allOf: [
				{ type: 'object', properties: { name: { type: 'string' } } },
				{ type: 'object', properties: { age: { type: 'number' } } },
			],
		};
		const parser = new AllOfParser(schema, createContext());
		const result = parser.parse();
		
		expect(result).toBeDefined();
		expect(result.text()).toContain('z.intersection');
	});

	it('should handle complex allOf with nested schemas', () => {
		const schema: JsonSchemaObject = {
			allOf: [
				{ type: 'object', properties: { id: { type: 'string' } } },
				{ type: 'object', properties: { name: { type: 'string' } } },
				{ type: 'object', properties: { email: { type: 'string' } } },
			],
		};
		const parser = new AllOfParser(schema, createContext());
		const result = parser.parse();
		
		expect(result).toBeDefined();
		expect(result.text()).toContain('z.intersection');
	});

	it('should apply metadata to intersection result', () => {
		const schema: JsonSchemaObject = {
			allOf: [
				{ type: 'object', properties: { name: { type: 'string' } } },
				{ type: 'object', properties: { age: { type: 'number' } } },
			],
			description: 'Combined schema',
		};
		const parser = new AllOfParser(schema, createContext());
		const result = parser.parse();
		
		expect(result).toBeDefined();
		expect(result.text()).toContain('Combined schema');
	});

	it('should report canProduceType correctly', () => {
		const schema: JsonSchemaObject = {
			allOf: [{ type: 'string' }],
		};
		const parser = new AllOfParser(schema, createContext());
		
		// Use type assertion to access protected method for testing
		expect((parser as any).canProduceType('intersection')).toBe(true);
		expect((parser as any).canProduceType('IntersectionBuilder')).toBe(true);
		expect((parser as any).canProduceType('allOf')).toBe(true);
		expect((parser as any).canProduceType('string')).toBe(false);
	});
});
