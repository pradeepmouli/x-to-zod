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
const parseAllOf = (
	schema: Parameters<typeof parse.allOf>[0],
	refs: Context = refsV4,
) => parse.allOf(schema as any, refs);

describe('parseAllOf', () => {
	it('should create never if empty', () => {
		expect(
			parseAllOf({
				allOf: [],
			}).text(),
		).toBe('z.never()');
	});

	it('should handle true values', () => {
		expect(
			parseAllOf({
				allOf: [{ type: 'string' }, true],
			}).text(),
		).toBe('z.intersection(z.string(), z.any())');
	});

	it('should handle false values', () => {
		expect(
			parseAllOf({
				allOf: [{ type: 'string' }, false],
			}).text(),
		).toBe(
			`z.intersection(z.string(), z.any().refine((value) => !z.any().safeParse(value).success, "Invalid input: Should NOT be valid against schema"))`,
		);
	});
});
