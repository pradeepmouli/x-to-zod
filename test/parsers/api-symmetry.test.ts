import { describe, expect, it } from 'vitest';
import { parse } from '../../src/JsonSchema/parsers/index.js';
import { buildV4 } from '../../src/ZodBuilder/v4.js';
import type { Context } from '../../src/Types.js';

const refs = (): Context => ({
	seen: new Map(),
	path: [],
	build: buildV4,
	zodVersion: 'v4',
});

describe('parser API symmetry', () => {
	it('parse.enum()', () => {
		const result = parse.enum({ enum: ['a', 'b'] } as any, refs()).text();
		expect(result).toBe('z.enum(["a","b"])');
	});

	it('parse.const()', () => {
		const result = parse.const({ const: 'x' } as any, refs()).text();
		expect(result).toBe('z.literal("x")');
	});

	it('parse.tuple() with prefixItems', () => {
		const result = parse
			.tuple(
				{
					type: 'array',
					prefixItems: [{ type: 'string' }, { type: 'number' }],
				} as any,
				refs(),
			)
			.text();
		expect(result).toBe('z.tuple([z.string(),z.number()])');
	});

	it('parse.tuple() with items array', () => {
		const result = parse
			.tuple(
				{
					type: 'array',
					items: [{ type: 'string' }, { type: 'boolean' }],
				} as any,
				refs(),
			)
			.text();
		expect(result).toBe('z.tuple([z.string(),z.boolean()])');
	});

	it('parse.union() aliases parse.anyOf()', () => {
		const schema = { anyOf: [{ type: 'string' }, { type: 'number' }] } as any;
		expect(parse.union(schema, refs()).text()).toBe(
			parse.anyOf(schema, refs()).text(),
		);
	});

	it('parse.intersection() aliases parse.allOf()', () => {
		const schema = {
			allOf: [
				{ type: 'object', properties: { a: { type: 'string' } } },
				{ type: 'object', properties: { b: { type: 'number' } } },
			],
		} as any;
		expect(parse.intersection(schema, refs()).text()).toBe(
			parse.allOf(schema, refs()).text(),
		);
	});

	it('parse.discriminatedUnion() aliases parse.oneOf()', () => {
		const schema = { oneOf: [{ type: 'string' }, { type: 'number' }] } as any;
		expect(parse.discriminatedUnion(schema, refs()).text()).toBe(
			parse.oneOf(schema, refs()).text(),
		);
	});

	it('parse.any()', () => {
		expect(parse.any(undefined as any, refs()).text()).toBe('z.any()');
	});

	it('parse.unknown()', () => {
		expect(parse.unknown(undefined as any, refs()).text()).toBe('z.unknown()');
	});

	it('parse.never()', () => {
		expect(parse.never(undefined as any, refs()).text()).toBe('z.never()');
	});

	it('parse.record()', () => {
		const result = parse
			.record(
				{
					type: 'object',
					additionalProperties: { type: 'string' },
				} as any,
				refs(),
			)
			.text();
		expect(result).toContain('z.record(z.string(), z.string())');
	});
});
