import { describe, it, expect } from 'vitest';
import { parseSchema } from '../../../src/JsonSchema/parsers/parseSchema.js';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import type { Context } from '../../../src/Types';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	zodVersion: 'v4',
	path: [],
	seen: new Map(),
	...overrides,
});

describe('parseSchema — gap tests', () => {
	// T004: boolean schemas (Gap 1)
	it('returns z.any() for boolean true schema', () => {
		expect(parseSchema(true as any, ctx()).text()).toBe('z.any()');
	});

	it('returns z.never() for boolean false schema', () => {
		expect(parseSchema(false as any, ctx()).text()).toBe('z.never()');
	});

	// T005: parserOverride void/undefined fallthrough (Gap 2)
	it('falls through to default parser when parserOverride returns undefined', () => {
		const result = parseSchema(
			{ type: 'string' },
			ctx({ parserOverride: () => undefined }),
		);
		expect(result.text()).toBe('z.string()');
	});

	it('falls through to default parser when parserOverride returns void', () => {
		const result = parseSchema(
			{ type: 'number' },
			ctx({
				parserOverride: (_schema, _refs) => {
					/* returns undefined implicitly */
				},
			}),
		);
		expect(result.text()).toBe('z.number()');
	});

	// T006: circular reference depth limit (Gap 3)
	it('terminates without throwing when circular schema hits depth limit', () => {
		const schema: any = { type: 'object', properties: {} };
		schema.properties.self = schema; // self-reference via object identity
		expect(() => parseSchema(schema, ctx({ depth: 2 }))).not.toThrow();
	});

	it('returns z.any() for circular reference beyond depth limit', () => {
		const schema: any = { type: 'object', properties: {} };
		schema.properties.self = schema;
		const result = parseSchema(schema, ctx({ depth: 2 }));
		// The outer object parses; the circular child resolves to z.any()
		expect(result.text()).toContain('z.any()');
	});

	// T013: parserOverride returning a Builder (not a string) [US1]
	it('uses parserOverride Builder return value as the result', () => {
		const result = parseSchema(
			{ type: 'string' },
			ctx({ parserOverride: (_schema, refs) => refs.build.number() }),
		);
		expect(result.text()).toBe('z.number()');
	});
});
