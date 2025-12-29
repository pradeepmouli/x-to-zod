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

describe('parseMultipleType', () => {
	it('should handle object with multitype properties with default', () => {
		const schema = {
			type: 'object',
			properties: {
				prop: {
					type: ['string', 'null'],
					default: null,
				},
			},
		};
		expect(parseSchema(schema, refsV4).text()).toBe(
			`z.object({ "prop": z.union([z.string(), z.null()]).default(null) })`,
		);
	});
});
