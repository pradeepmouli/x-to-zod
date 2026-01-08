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
const parseAnyOf = (
	schema: Parameters<typeof parse.anyOf>[0],
	refs: Context = refsV4,
) => parse.anyOf(schema as any, refs);

describe('parseAnyOf', () => {
	it('should create a union from two or more schemas', () => {
		expect(
			parseAnyOf({
				anyOf: [
					{
						type: 'string',
					},
					{ type: 'number' },
				],
			}).text(),
		).toBe('z.union([z.string(), z.number()])');
	});

	it('should extract a single schema', () => {
		expect(parseAnyOf({ anyOf: [{ type: 'string' }] }).text()).toBe(
			'z.string()',
		);
	});

	it('should return z.any() if array is empty', () => {
		expect(parseAnyOf({ anyOf: [] }).text()).toBe('z.any()');
	});
});
