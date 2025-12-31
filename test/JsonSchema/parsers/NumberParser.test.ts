import { describe, it, expect } from 'vitest';
import type { Context, JsonSchemaObject } from '../../../src/Types';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import { parseNumber as parseNumberFn } from '../../../src/JsonSchema/parsers/parseNumber.js';
import { NumberParser } from '../../../src/JsonSchema/parsers/NumberParser.js';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
	...overrides,
});

describe('NumberParser', () => {
	it('parses integer with min/max and multipleOf', () => {
		const schema: JsonSchemaObject & { type: 'integer' } = {
			type: 'integer',
			minimum: 1,
			maximum: 5,
			multipleOf: 2,
			errorMessage: {
				type: 'not-int',
				minimum: 'too-small',
				maximum: 'too-big',
				multipleOf: 'not-multiple',
			},
		};
		const parser = new NumberParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parseNumberFn(schema as any, ctx()).text();

		expect(result).toBe(expected);
	});

	it('parses number with exclusive bounds', () => {
		const schema: JsonSchemaObject & { type: 'number' } = {
			type: 'number',
			exclusiveMinimum: 0,
			exclusiveMaximum: 10,
			errorMessage: {
				exclusiveMinimum: 'too-small',
				exclusiveMaximum: 'too-big',
			},
		};
		const parser = new NumberParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parseNumberFn(schema as any, ctx()).text();

		expect(result).toBe(expected);
	});
});
