import { describe, it, expect } from 'vitest';
import { parseNot as parseNotImpl } from '../../src/JsonSchema/parsers/parseNot.js';
import type { Context } from '../../src/Types';
import { buildV4 } from '../../src/ZodBuilder/index.js';

const refsV4: Context = { path: [], seen: new Map(), build: buildV4, zodVersion: 'v4' };
const parseNot = (
	schema: Parameters<typeof parseNotImpl>[0],
	refs: Context = refsV4,
) => parseNotImpl(schema, refs);

describe('parseNot', () => {
	it('', () => {
		expect(
			parseNot({
				not: {
					type: 'string',
				},
			}).text(),
		).toBe(
			'z.any().refine((value) => !z.string().safeParse(value).success, "Invalid input: Should NOT be valid against schema")',
		);
	});
});
