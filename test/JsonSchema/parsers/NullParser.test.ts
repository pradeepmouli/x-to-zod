import { describe, it, expect } from 'vitest';
import type { Context, JSONSchemaObject } from '../../../src/Types';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import { parse } from '../../../src/JsonSchema/parsers/index.js';
import { NullParser } from '../../../src/JsonSchema/parsers/NullParser.js';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
	...overrides,
});

describe('NullParser', () => {
	it('parses null schema', () => {
		const schema: JSONSchemaObject & { type: 'null' } = { type: 'null' };
		const parser = new NullParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parse.null(schema as any, ctx()).text();

		expect(result).toBe(expected);
	});
});
