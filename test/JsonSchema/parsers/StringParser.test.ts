import { describe, it, expect } from 'vitest';
import type { Context, JsonSchemaObject } from '../../../src/Types';
import { buildV4 } from '../../../src/ZodBuilder/index.js';
import { parse } from '../../../src/JsonSchema/parsers/index.js';
import { StringParser } from '../../../src/JsonSchema/parsers/StringParser.js';

const ctx = (overrides: Partial<Context> = {}): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
	...overrides,
});

describe('StringParser', () => {
	it('parses base string with metadata', () => {
		const schema: JsonSchemaObject & { type: 'string' } = {
			type: 'string',
			description: 'desc',
			default: 'def',
		};
		const parser = new StringParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parse.string(schema as any, ctx())
			.describe('desc')
			.default('def')
			.text();

		expect(result).toBe(expected);
	});

	it('applies format, pattern, min/max length', () => {
		const schema: JsonSchemaObject & { type: 'string' } = {
			type: 'string',
			format: 'email',
			pattern: '^foo',
			minLength: 2,
			maxLength: 5,
			errorMessage: {
				format: 'bad-email',
				pattern: 'bad-pattern',
				minLength: 'too-short',
				maxLength: 'too-long',
			},
		};
		const parser = new StringParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parse.string(schema as any, ctx()).text();

		expect(result).toBe(expected);
	});

	it('handles base64 encoding', () => {
		const schema: JsonSchemaObject & { type: 'string' } = {
			type: 'string',
			contentEncoding: 'base64',
			errorMessage: { contentEncoding: 'encode-error' },
		};
		const parser = new StringParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parse.string(schema as any, ctx()).text();

		expect(result).toBe(expected);
	});

	it('handles contentMediaType json with contentSchema pipe', () => {
		const schema: JsonSchemaObject & { type: 'string' } = {
			type: 'string',
			contentMediaType: 'application/json',
			contentSchema: { type: 'number', minimum: 1 },
			errorMessage: {
				contentMediaType: 'bad-json',
				contentSchema: 'bad-content-schema',
			},
		};
		const parser = new StringParser(schema, ctx());

		const result = parser.parse().text();
		const expected = parse.string(schema as any, ctx()).text();

		expect(result).toBe(expected);
	});
});
