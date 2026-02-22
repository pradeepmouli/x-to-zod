import { describe, it, expect } from 'vitest';
import { parseSchema } from '../../src/JsonSchema/parsers/parseSchema.js';
import { buildV4 } from '../../src/ZodBuilder/index.js';
import type { Context } from '../../src/Types';

const ctx = (): Context => ({
	build: buildV4,
	zodVersion: 'v4',
	path: [],
	seen: new Map(),
});

describe('parseConditional (if/then/else) — Gap 7', () => {
	it('handles if/then/else and produces valid Zod output', () => {
		const result = parseSchema(
			{
				if: { type: 'string' },
				then: { type: 'number' },
				else: { type: 'boolean' },
			},
			ctx(),
		);
		const text = result.text();
		expect(text).toBeTypeOf('string');
		expect(text.length).toBeGreaterThan(0);
		expect(text).toContain('z.union');
		expect(text).toContain('superRefine');
	});

	it('handles if/then without else', () => {
		const result = parseSchema(
			{
				if: { type: 'string' },
				then: { type: 'number' },
			},
			ctx(),
		);
		expect(result.text()).toBeTypeOf('string');
		expect(result.text().length).toBeGreaterThan(0);
	});

	it('produces a superRefine-based conditional check', () => {
		const result = parseSchema(
			{
				if: { type: 'string' },
				then: { type: 'number' },
				else: { type: 'boolean' },
			},
			ctx(),
		);
		// Verify the conditional outputs a z.string() guard
		expect(result.text()).toContain('z.string()');
		expect(result.text()).toContain('z.number()');
		expect(result.text()).toContain('z.boolean()');
	});
});
