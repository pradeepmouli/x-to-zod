import { describe, it, expect } from 'vitest';
import { parseNumber as parseNumberImpl } from '../../src/JsonSchema/parsers/parseNumber.js';
import type { Context } from '../../src/Types';
import { buildV4 } from '../../src/ZodBuilder/index.js';

const refsV4: Context = {
	path: [],
	seen: new Map(),
	build: buildV4,
	zodVersion: 'v4',
};
const parseNumber = (
	schema: Parameters<typeof parseNumberImpl>[0],
	refs: Context = refsV4,
) => parseNumberImpl(schema, refs);

describe('parseNumber', () => {
	it('should handle integer', () => {
		expect(
			parseNumber({
				type: 'integer',
			}).text(),
		).toBe(`z.number().int()`);

		expect(
			parseNumber({
				type: 'integer',
				multipleOf: 1,
			}).text(),
		).toBe(`z.number().int()`);

		expect(
			parseNumber({
				type: 'number',
				multipleOf: 1,
			}).text(),
		).toBe(`z.number().int()`);
	});

	it('should handle maximum with exclusiveMinimum', () => {
		expect(
			parseNumber({
				type: 'number',
				exclusiveMinimum: 2,
			}).text(),
		).toBe(`z.number().gt(2)`);
	});

	it('should handle minimum', () => {
		expect(
			parseNumber({
				type: 'number',
				minimum: 2,
			}).text(),
		).toBe(`z.number().gte(2)`);
	});

	it('should handle maximum with exclusiveMaximum', () => {
		expect(
			parseNumber({
				type: 'number',
				exclusiveMaximum: 2,
			}).text(),
		).toBe(`z.number().lt(2)`);
	});

	it('should handle numeric exclusiveMaximum', () => {
		expect(
			parseNumber({
				type: 'number',
				exclusiveMaximum: 2,
			}).text(),
		).toBe(`z.number().lt(2)`);
	});

	it('should accept errorMessage', () => {
		expect(
			parseNumber({
				type: 'number',
				format: 'int64',
				exclusiveMinimum: 0,
				maximum: 2,
				multipleOf: 2,
				errorMessage: {
					format: 'ayy',
					multipleOf: 'lmao',
					exclusiveMinimum: 'deez',
					maximum: 'nuts',
				},
			}).text(),
		).toBe(
			'z.number().int("ayy").multipleOf(2, "lmao").gt(0, "deez").lte(2, "nuts")',
		);
	});
});
