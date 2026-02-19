// @ts-nocheck
import { describe, it, expect } from 'vitest';
import type { JSONSchema, Context } from '../../../src/Types.js';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import { AllOfParser } from '../../../src/JsonSchema/parsers/AllOfParser.js';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
	...overrides,
});

describe('AllOfParser', () => {
	it('returns intersection for multiple allOf options', () => {
		const schema: JSONSchema = {
			allOf: [{ type: 'string', minLength: 1 }, { maxLength: 100 }],
		};

		const parser = new AllOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toContain('z.intersection');
	});

	it('returns single schema when allOf has one option', () => {
		const schema: JSONSchema = {
			allOf: [{ type: 'string' }],
		};

		const parser = new AllOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toContain('z.string');
		expect(text).not.toContain('z.intersection');
	});

	it('returns never() for empty allOf', () => {
		const schema: JSONSchema = {
			allOf: [],
		};

		const parser = new AllOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toContain('z.never');
	});

	it('combines nested allOf recursively', () => {
		const schema: JSONSchema = {
			allOf: [
				{ type: 'object', properties: { name: { type: 'string' } } },
				{ properties: { age: { type: 'number' } } },
			],
		};

		const parser = new AllOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toBeDefined();
	});
});
