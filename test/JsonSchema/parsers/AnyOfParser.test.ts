// @ts-nocheck
import { describe, it, expect } from 'vitest';
import type { JsonSchema, Context } from '../../../src/Types.js';
import { buildV4, buildV3 } from '../../../src/ZodBuilder/index.js';
import { AnyOfParser } from '../../../src/JsonSchema/parsers/AnyOfParser.js';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
	...overrides,
});

describe('AnyOfParser', () => {
	it('returns union for multiple anyOf options', () => {
		const schema: JsonSchema = {
			anyOf: [{ type: 'string' }, { type: 'number' }],
		};

		const parser = new AnyOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toContain('z.union');
		expect(text).toContain('z.string');
		expect(text).toContain('z.number');
	});

	it('returns single schema when anyOf has one option', () => {
		const schema: JsonSchema = {
			anyOf: [{ type: 'string' }],
		};

		const parser = new AnyOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toContain('z.string');
		expect(text).not.toContain('z.union');
	});

	it('returns any() for empty anyOf', () => {
		const schema: JsonSchema = {
			anyOf: [],
		};

		const parser = new AnyOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toContain('z.any');
	});

	it('handles nested anyOf schemas', () => {
		const schema: JsonSchema = {
			anyOf: [
				{ type: 'string' },
				{ anyOf: [{ type: 'number' }, { type: 'boolean' }] },
			],
		};

		const parser = new AnyOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toContain('z.union');
		expect(text).toContain('z.string');
	});
});
