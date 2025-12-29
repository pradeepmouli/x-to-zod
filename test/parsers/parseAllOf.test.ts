import { describe, it, expect } from 'vitest';
import { parseAllOf as parseAllOfImpl } from '../../src/JsonSchema/parsers/parseAllOf.js';
import type { Context } from '../../src/Types';
import { buildV4 } from '../../src/ZodBuilder/index.js';

const refsV4: Context = { path: [], seen: new Map(), build: buildV4, zodVersion: 'v4' };
const parseAllOf = (
	schema: Parameters<typeof parseAllOfImpl>[0],
	refs: Context = refsV4,
) => parseAllOfImpl(schema, refs);

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
