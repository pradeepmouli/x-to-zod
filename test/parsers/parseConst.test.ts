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
const parseConst = (
	schema: Parameters<typeof parseSchema>[0],
	refs: Context = refsV4,
) => parseSchema(schema, refs);

describe('parseConst', () => {
	it('should handle falsy constants', () => {
		expect(
			parseConst({
				const: false,
			}).text(),
		).toBe('z.literal(false)');
	});
});
