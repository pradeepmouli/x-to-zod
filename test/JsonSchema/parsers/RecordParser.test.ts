import { describe, expect, it } from 'vitest';
import { RecordParser } from '../../../src/JsonSchema/parsers/RecordParser.js';
import { buildV4 } from '../../../src/ZodBuilder/v4.js';
import type { Context } from '../../../src/Types.js';

const ctx = (): Context => ({
	build: buildV4,
	path: [],
	seen: new Map(),
	zodVersion: 'v4',
});

describe('RecordParser', () => {
	it('parses additionalProperties schema', () => {
		const schema = {
			type: 'object' as const,
			additionalProperties: { type: 'string' as const },
		};

		const parser = new RecordParser(schema as any, ctx());
		const result = parser.parse().text();

		expect(result).toContain('z.record(z.string(), z.string())');
	});

	it('handles additionalProperties true as any', () => {
		const schema = {
			type: 'object' as const,
			additionalProperties: true,
		};

		const parser = new RecordParser(schema as any, ctx());
		const result = parser.parse().text();

		expect(result).toContain('z.record(z.string(), z.any())');
	});

	it('handles additionalProperties false as any fallback', () => {
		const schema = {
			type: 'object' as const,
			additionalProperties: false,
		};

		const parser = new RecordParser(schema as any, ctx());
		const result = parser.parse().text();

		expect(result).toContain('z.record(z.string(), z.any())');
	});
});
