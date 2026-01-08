// @ts-nocheck
import { describe, it, expect } from 'vitest';
import type { Context, JsonSchemaObject } from '../../../src/Types';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import { parse } from '../../../src/JsonSchema/parsers/index.js';
import { ObjectParser } from '../../../src/JsonSchema/parsers/ObjectParser.js';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
	...overrides,
});

describe('ObjectParser', () => {
	it('parses properties with required and optional', () => {
		const schema: JsonSchemaObject & { type: 'object' } = {
			type: 'object',
			properties: {
				name: { type: 'string' },
				age: { type: 'number', default: 1 },
			},
			required: ['name'],
			description: 'desc',
			default: { name: 'a' },
		};
		const parser = new ObjectParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parse
			.object(schema as any, ctx())
			.describe('desc')
			.default({ name: 'a' })
			.text();

		expect(result).toBe(expected);
	});

	it('applies additionalProperties and patternProperties', () => {
		const schema: JsonSchemaObject & { type: 'object' } = {
			type: 'object',
			properties: {
				header: { type: 'string' },
			},
			patternProperties: {
				'^x-': { type: 'string' },
			},
			additionalProperties: false,
		};
		const parser = new ObjectParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parse.object(schema as any, ctx()).text();

		expect(result).toBe(expected);
	});
});
