import { describe, it, expect } from 'vitest';
import { parseArray as parseArrayImpl } from '../../src/JsonSchema/parsers/parseArray.js';
import type { Context } from '../../src/Types';
import { buildV4 } from '../../src/ZodBuilder/index.js';

const refsV4: Context = {
	path: [],
	seen: new Map(),
	build: buildV4,
	zodVersion: 'v4',
};
const parseArray = (
	schema: Parameters<typeof parseArrayImpl>[0],
	refs: Context = refsV4,
) => parseArrayImpl(schema, refs);

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
});
