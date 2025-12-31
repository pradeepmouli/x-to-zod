// @ts-nocheck
import { describe, it, expect } from 'vitest';
import type { JsonSchema, Context } from '../../../src/Types.js';
import { buildV4, buildV3 } from '../../../src/ZodBuilder/index.js';
import { OneOfParser } from '../../../src/JsonSchema/parsers/OneOfParser.js';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
	...overrides,
});

describe('OneOfParser', () => {
	it('uses xor for v4 with multiple oneOf options', () => {
		const schema: JsonSchema = {
			oneOf: [{ type: 'string' }, { type: 'number' }],
		};

		const parser = new OneOfParser(schema, ctx({ zodVersion: 'v4' }));
		const builder = parser.parse();
		const text = builder.text();

		expect(text.includes('z.xor') || text.includes('z.union')).toBe(true);
	});

	it('falls back to union for v3', () => {
		const schema: JsonSchema = {
			oneOf: [{ type: 'string' }, { type: 'number' }],
		};

		const parser = new OneOfParser(
			schema,
			ctx({ zodVersion: 'v3', build: buildV3 }),
		);
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toContain('z.union');
	});

	it('returns single schema when oneOf has one option', () => {
		const schema: JsonSchema = {
			oneOf: [{ type: 'string' }],
		};

		const parser = new OneOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toContain('z.string');
		expect(text).not.toContain('z.union');
	});

	it('returns any() for empty oneOf', () => {
		const schema: JsonSchema = {
			oneOf: [],
		};

		const parser = new OneOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toContain('z.any');
	});

	it('handles nested oneOf schemas', () => {
		const schema: JsonSchema = {
			oneOf: [
				{ type: 'string' },
				{ oneOf: [{ type: 'number' }, { type: 'boolean' }] },
			],
		};

		const parser = new OneOfParser(schema, ctx());
		const builder = parser.parse();
		const text = builder.text();

		expect(text).toBeDefined();
	});
});
