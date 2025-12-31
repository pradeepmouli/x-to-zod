import { describe, it, expect } from 'vitest';
import type { Context, JsonSchemaObject } from '../../../src/Types';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import { parseNull as parseNullFn } from '../../../src/JsonSchema/parsers/parseNull.js';
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
		const schema: JsonSchemaObject & { type: 'null' } = { type: 'null' };
		const parser = new NullParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parseNullFn(schema as any, ctx()).text();

		expect(result).toBe(expected);
	});
});
