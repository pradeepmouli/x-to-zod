import { describe, expect, it } from 'vitest';
import { parse } from '../../src/JsonSchema/index.js';
import { buildV4 } from '../../src/ZodBuilder/v4.js';
import type { Context } from '../../src/Types.js';

const refs = (): Context => ({
	seen: new Map(),
	path: [],
	build: buildV4,
	zodVersion: 'v4',
});

describe('parse naming consistency', () => {
	it('exposes lowercase schema and ref', () => {
		expect(typeof parse.schema).toBe('function');
		expect(typeof parse.ref).toBe('function');
	});

	it('keeps deprecated aliases Schema and Ref', () => {
		expect(parse.Schema).toBe(parse.schema);
		expect(parse.Ref).toBe(parse.ref);
	});

	it('parse.schema still parses schemas', () => {
		const result = parse.schema({ type: 'string' } as any, refs()).text();
		expect(result).toBe('z.string()');
	});
});
