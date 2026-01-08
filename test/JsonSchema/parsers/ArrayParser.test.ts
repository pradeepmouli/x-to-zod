// @ts-nocheck
import { describe, it, expect } from 'vitest';
import type { Context, JsonSchemaObject } from '../../../src/Types';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import { parse } from '../../../src/JsonSchema/parsers/index.js';
import { ArrayParser } from '../../../src/JsonSchema/parsers/ArrayParser.js';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
	...overrides,
});

describe('ArrayParser', () => {
	it('parses simple array with min/max and metadata', () => {
		const schema: JsonSchemaObject & { type: 'array' } = {
			type: 'array',
			items: { type: 'string' },
			minItems: 1,
			maxItems: 3,
			description: 'desc',
			default: ['a'],
			errorMessage: {
				minItems: 'too-few',
				maxItems: 'too-many',
			},
		};
		const parser = new ArrayParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parse
			.array(schema as any, ctx())
			.describe('desc')
			.default(['a'])
			.text();

		expect(result).toBe(expected);
	});

	it('parses tuple array', () => {
		const schema: JsonSchemaObject & { type: 'array' } = {
			type: 'array',
			items: [
				{ type: 'string' } as JsonSchemaObject,
				{ type: 'number' } as JsonSchemaObject,
			],
			minItems: 2,
			errorMessage: { minItems: 'too-few' },
		};
		const parser = new ArrayParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parse
			.array(schema as any, ctx())
			.describe(undefined as any)
			.text();

		expect(result).toBe(expected);
	});
});
