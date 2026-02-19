import { describe, expect, it } from 'vitest';
import { TupleParser } from '../../../src/JsonSchema/parsers/TupleParser.js';
import { buildV4 } from '../../../src/ZodBuilder/v4.js';
import type { Context } from '../../../src/Types.js';

const ctx = (): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
});

describe('TupleParser', () => {
	it('parses prefixItems tuples (draft 2020-12)', () => {
		const schema = {
			type: 'array' as const,
			prefixItems: [{ type: 'string' as const }, { type: 'number' as const }],
		};

		const parser = new TupleParser(schema as any, ctx());
		const result = parser.parse().text();

		expect(result).toBe('z.tuple([z.string(),z.number()])');
	});

	it('parses items array tuples (draft-07)', () => {
		const schema = {
			type: 'array' as const,
			items: [{ type: 'string' as const }, { type: 'boolean' as const }],
		};

		const parser = new TupleParser(schema as any, ctx());
		const result = parser.parse().text();

		expect(result).toBe('z.tuple([z.string(),z.boolean()])');
	});

	it('handles empty tuples', () => {
		const schema = {
			type: 'array' as const,
			prefixItems: [],
		};

		const parser = new TupleParser(schema as any, ctx());
		const result = parser.parse().text();

		expect(result).toBe('z.tuple([])');
	});
});
