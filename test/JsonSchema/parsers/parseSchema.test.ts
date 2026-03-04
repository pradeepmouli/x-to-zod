import { describe, it, expect, afterEach } from 'vitest';
import { parseSchema } from '../../../src/JsonSchema/parsers/parseSchema.js';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import {
	registerParser,
	parserRegistry,
} from '../../../src/JsonSchema/parsers/registry.js';
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

	// T013: registerParser dispatches to custom parser (replaces parserOverride test)
	afterEach(() => {
		parserRegistry.delete('x-test');
	});

	it('uses registered custom parser for matching type', () => {
		registerParser(
			'x-test',
			class {
				readonly typeKind = 'x-test' as const;
				constructor(
					_schema: any,
					private refs: Context,
				) {}
				parse() {
					return this.refs.build.number();
				}
			},
		);
		const result = parseSchema({ type: 'x-test' } as any, ctx());
		expect(result.text()).toBe('z.number()');
	});
});
