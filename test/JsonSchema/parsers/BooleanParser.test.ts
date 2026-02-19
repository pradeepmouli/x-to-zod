import { describe, it, expect } from 'vitest';
import type { Context, JSONSchemaObject } from '../../../src/Types';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import { parse } from '../../../src/JsonSchema/parsers/index.js';
import { BooleanParser } from '../../../src/JsonSchema/parsers/BooleanParser.js';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
	...overrides,
});

describe('BooleanParser', () => {
	it('parses boolean schema', () => {
		const schema: JSONSchemaObject & { type: 'boolean' } = { type: 'boolean' };
		const parser = new BooleanParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parse.boolean(schema as any, ctx()).text();

		expect(result).toBe(expected);
	});
});
