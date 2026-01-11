import { describe, it, expect } from 'vitest';
import { parseRef, extractRefs } from '../../src/SchemaProject/parseRef.js';
import { DefaultRefResolver } from '../../src/SchemaProject/RefResolver.js';
import { SchemaRegistry } from '../../src/SchemaProject/SchemaRegistry.js';
import type { JsonSchema } from '../../src/Types.js';

describe('parseRef depth limits (T077)', () => {
	it('should handle deeply nested schemas without stack overflow', () => {
		const registry = new SchemaRegistry();
		const resolver = new DefaultRefResolver(registry);

		// Create a chain of 110 schemas (exceeds MAX_REF_DEPTH of 100)
		for (let i = 0; i < 110; i++) {
			registry.addEntry({
				id: `schema${i}`,
				schema: {
					type: 'object',
					properties: { id: { type: 'string' } },
				} as any,
				builder: null,
				sourceFile: null,
				exportName: `Schema${i}`,
				metadata: {},
			});
		}

		// This should not throw and should return a fallback builder
		const result = parseRef(
			{ $ref: 'schema0#' } as any,
			resolver,
			'schema1',
			undefined,
			101, // Exceed max depth
		);

		expect(result).not.toBeNull();
		expect(result!.text()).toBe('z.unknown()');
		expect(result!.unknownFallback).toBe(true);
	});
});

describe('extractRefs depth limits (T077)', () => {
	it('should handle deeply nested schema structures without stack overflow', () => {
		// Create a deeply nested schema (120 levels deep)
		let schema: JsonSchema = { type: 'string' };
		for (let i = 0; i < 120; i++) {
			schema = {
				type: 'object',
				properties: {
					nested: schema,
					ref: { $ref: `#/definitions/level${i}` },
				},
			};
		}

		// This should not throw and should stop at max depth
		const refs = extractRefs(schema);

		// Should have extracted some refs before hitting depth limit
		expect(refs.size).toBeGreaterThan(0);
		expect(refs.size).toBeLessThan(120); // Should stop before extracting all
	});

	it('should extract all refs from moderately nested schema', () => {
		// Create a reasonably nested schema (50 levels deep)
		let schema: JsonSchema = { type: 'string' };
		for (let i = 0; i < 50; i++) {
			schema = {
				type: 'object',
				properties: {
					nested: schema,
					ref: { $ref: `#/definitions/level${i}` },
				},
			};
		}

		const refs = extractRefs(schema);

		// Should extract all 50 refs since it's under the limit
		expect(refs.size).toBe(50);
		for (let i = 0; i < 50; i++) {
			expect(refs.has(`#/definitions/level${i}`)).toBe(true);
		}
	});
});
