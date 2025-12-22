import { describe, it, expect } from 'vitest';
import { parseOneOf } from '../../src/JsonSchema/parsers/parseOneOf';

describe('parseOneOf', () => {
	it('should create a union from two or more schemas', () => {
		expect(
			parseOneOf(
				{
					oneOf: [
						{
							type: 'string',
						},
						{ type: 'number' },
					],
				},
				{ path: [], seen: new Map() },
			).text(),
		).toBe('z.xor([z.string(),z.number()])');
	});

	it('should extract a single schema', () => {
		expect(
			parseOneOf(
				{ oneOf: [{ type: 'string' }] },
				{ path: [], seen: new Map() },
			).text(),
		).toBe('z.string()');
	});

	it('should return z.any() if array is empty', () => {
		expect(
			parseOneOf({ oneOf: [] }, { path: [], seen: new Map() }).text(),
		).toBe('z.any()');
	});
});
