/**
 * Smoke test for all 18 parser types (Gap 6).
 *
 * Verifies that every parser can be invoked without throwing and returns
 * a non-empty TypeScript code string. This is the behaviour-preservation
 * anchor for the AbstractParser rename step (T028).
 */
import { describe, it, expect } from 'vitest';
import { parseSchema } from '../../../src/JsonSchema/parsers/parseSchema.js';
import { RecordParser } from '../../../src/JsonSchema/parsers/RecordParser.js';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import type { Context } from '../../../src/Types';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	zodVersion: 'v4',
	path: [],
	seen: new Map(),
	...overrides,
});

const smoke = (schema: Parameters<typeof parseSchema>[0], overrides?: Partial<Context>) => {
	const result = parseSchema(schema, ctx(overrides));
	expect(result.text()).toBeTypeOf('string');
	expect(result.text().length).toBeGreaterThan(0);
	return result.text();
};

describe('smoke — all 18 parser types (Gap 6)', () => {
	it('ObjectParser: { type: "object" }', () => {
		expect(() => smoke({ type: 'object' })).not.toThrow();
	});

	it('ArrayParser: { type: "array" }', () => {
		expect(() => smoke({ type: 'array' })).not.toThrow();
	});

	it('StringParser: { type: "string" }', () => {
		expect(smoke({ type: 'string' })).toBe('z.string()');
	});

	it('NumberParser: { type: "number" }', () => {
		expect(smoke({ type: 'number' })).toBe('z.number()');
	});

	it('IntegerParser (NumberParser): { type: "integer" }', () => {
		expect(() => smoke({ type: 'integer' })).not.toThrow();
	});

	it('BooleanParser: { type: "boolean" }', () => {
		expect(smoke({ type: 'boolean' })).toBe('z.boolean()');
	});

	it('NullParser: { type: "null" }', () => {
		expect(smoke({ type: 'null' })).toBe('z.null()');
	});

	it('AnyOfParser: { anyOf: [...] }', () => {
		const text = smoke({ anyOf: [{ type: 'string' }, { type: 'number' }] });
		expect(text).toContain('z.union');
	});

	it('AllOfParser: { allOf: [...] }', () => {
		expect(() => smoke({ allOf: [{ type: 'string' }] })).not.toThrow();
	});

	it('OneOfParser: { oneOf: [...] }', () => {
		expect(() => smoke({ oneOf: [{ type: 'string' }, { type: 'number' }] })).not.toThrow();
	});

	it('EnumParser: { enum: [...] }', () => {
		const text = smoke({ enum: ['a', 'b', 'c'] } as any);
		// All-string enum → z.enum(); mixed enum → z.union([z.literal(...)])
		expect(text).toMatch(/z\.enum|z\.literal/);
	});

	it('ConstParser: { const: value }', () => {
		const text = smoke({ const: 'hello' } as any);
		expect(text).toContain('z.literal');
	});

	it('NullableParser: { type: "string", nullable: true }', () => {
		const text = smoke({ type: 'string', nullable: true } as any);
		expect(text).toContain('nullable');
	});

	it('TupleParser: { prefixItems: [...] }', () => {
		const text = smoke({ prefixItems: [{ type: 'string' }, { type: 'number' }] } as any);
		expect(text).toContain('z.tuple');
	});

	it('MultipleTypeParser: { type: ["string", "null"] }', () => {
		const text = smoke({ type: ['string', 'null'] } as any);
		expect(text).toContain('z.union');
	});

	it('ConditionalParser: { if, then, else }', () => {
		expect(() =>
			smoke({
				if: { type: 'string' },
				then: { type: 'number' },
				else: { type: 'boolean' },
			}),
		).not.toThrow();
	});

	it('NotParser: { not: {...} }', () => {
		expect(() => smoke({ not: { type: 'string' } } as any)).not.toThrow();
	});

	it('RecordParser (direct instantiation): { type: "object", additionalProperties: {...} }', () => {
		const schema: any = {
			type: 'object',
			additionalProperties: { type: 'string' },
		};
		const parser = new RecordParser(schema, ctx());
		const text = parser.parse().text();
		expect(text).toBeTypeOf('string');
		expect(text.length).toBeGreaterThan(0);
		expect(text).toContain('z.record');
	});
});
