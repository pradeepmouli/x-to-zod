import { describe, it, expect } from 'vitest';
import { parse } from '../../src/JsonSchema/parsers/index.js';
import type { Context } from '../../src/Types';
import { buildV4 } from '../../src/ZodBuilder/index.js';

const refsV4: Context = {
	path: [],
	seen: new Map(),
	build: buildV4,
	zodVersion: 'v4',
};
const parseArray = (
	schema: Parameters<typeof parse.array>[0],
	refs: Context = refsV4,
) => parse.array(schema as any, refs);

describe('parseArray', () => {
	it('should create tuple with items array', () => {
		expect(
			parseArray({
				type: 'array',
				items: [
					{
						type: 'string',
					},
					{
						type: 'number',
					},
				],
			}).text(),
		).toBe('z.tuple([z.string(),z.number()])');
	});

	it('should apply minItems and maxItems for tuple arrays', () => {
		expect(
			parseArray({
				type: 'array',
				minItems: 1,
				maxItems: 2,
				items: [{ type: 'string' }, { type: 'number' }],
			}).text(),
		).toBe('z.tuple([z.string(),z.number()]).min(1).max(2)');
	});

	it('should create array with items object', () => {
		expect(
			parseArray({
				type: 'array',
				items: {
					type: 'string',
				},
			}).text(),
		).toBe('z.array(z.string())');
	});

	it('should create max for maxItems', () => {
		expect(
			parseArray({
				type: 'array',
				maxItems: 2,
				items: {
					type: 'string',
				},
			}).text(),
		).toBe('z.array(z.string()).max(2)');
	});

	it('should create min and max for regular arrays', () => {
		expect(
			parseArray({
				type: 'array',
				minItems: 1,
				maxItems: 3,
				items: {
					type: 'string',
				},
			}).text(),
		).toBe('z.array(z.string()).min(1).max(3)');
	});
});
