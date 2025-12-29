import { describe, it, expect } from 'vitest';
import { parseSchema } from '../../src';
import { buildV4 } from '../../src/ZodBuilder/v4.js';

describe('parseNullable', () => {
	it('parseSchema should not add default twice', () => {
		expect(
			parseSchema(
				{
					type: 'string',
					nullable: true,
					default: null,
				},
				{ build: buildV4, path: [], seen: new Map() },
			).text(),
		).toBe('z.string().nullable().default(null)');
	});
});
