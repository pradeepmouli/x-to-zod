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
const parseOneOf = (
	schema: Parameters<typeof parse.oneOf>[0],
	refs: Context = refsV4,
) => parse.oneOf(schema as any, refs);

describe('parseOneOf', () => {
	it('should create a union from two or more schemas', () => {
		expect(
			parseOneOf({
				oneOf: [
					{
						type: 'string',
					},
					{ type: 'number' },
				],
			}).text(),
		).toBe('z.xor([z.string(),z.number()])');
	});

	it('should extract a single schema', () => {
		expect(parseOneOf({ oneOf: [{ type: 'string' }] }).text()).toBe(
			'z.string()',
		);
	});

	it('should return z.any() if array is empty', () => {
		expect(parseOneOf({ oneOf: [] }).text()).toBe('z.any()');
	});
});
