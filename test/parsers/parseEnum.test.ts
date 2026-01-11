import { describe, it, expect } from 'vitest';
import { parseSchema } from '../../src/JsonSchema/parsers/parseSchema.js';
import type { Context } from '../../src/Types';
import { buildV4 } from '../../src/ZodBuilder/index.js';

const refsV4: Context = {
	path: [],
	seen: new Map(),
	build: buildV4,
	zodVersion: 'v4',
};
const parseEnum = (
	schema: Parameters<typeof parseSchema>[0],
	refs: Context = refsV4,
) => parseSchema(schema, refs);

describe('parseEnum', () => {
	it('should create never with empty enum', () => {
		expect(
			parseEnum({
				enum: [],
			}).text(),
		).toBe('z.never()');
	});

	it('should create literal with single item enum', () => {
		expect(
			parseEnum({
				enum: ['someValue'],
			}).text(),
		).toBe(`z.literal("someValue")`);
	});

	it('should create enum array with string enums', () => {
		expect(
			parseEnum({
				enum: ['someValue', 'anotherValue'],
			}).text(),
		).toBe(`z.enum(["someValue","anotherValue"])`);
	});

	it('should create union with mixed enums', () => {
		expect(
			parseEnum({
				enum: ['someValue', 57],
			}).text(),
		).toBe(`z.union([z.literal("someValue"), z.literal(57)])`);
	});
});
