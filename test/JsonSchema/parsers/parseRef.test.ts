import { describe, it, expect, beforeEach } from 'vitest';
import { parseRef, extractRefs } from '../../../src/SchemaProject/parseRef.js';
import { DefaultRefResolver } from '../../../src/SchemaProject/RefResolver.js';
import { SchemaRegistry } from '../../../src/SchemaProject/SchemaRegistry.js';
import type { SchemaEntry } from '../../../src/SchemaProject/types.js';

describe('parseRef', () => {
	let registry: SchemaRegistry;
	let resolver: DefaultRefResolver;

	beforeEach(() => {
		registry = new SchemaRegistry();
		resolver = new DefaultRefResolver(registry);

		// Register two schemas for external resolution
		const userEntry: SchemaEntry = {
			id: 'user',
			schema: { type: 'object', properties: { id: { type: 'number' } } } as any,
			builder: null,
			sourceFile: null,
			exportName: 'User',
			metadata: {},
		};
		const postEntry: SchemaEntry = {
			id: 'models/post',
			schema: {
				type: 'object',
				properties: { title: { type: 'string' } },
			} as any,
			builder: null,
			sourceFile: null,
			exportName: 'Post',
			metadata: {},
		};
		registry.addEntry(userEntry);
		registry.addEntry(postEntry);
	});

	it('returns null for non-ref schemas', () => {
		const result = parseRef({ type: 'string' } as any, resolver, 'user');
		expect(result).toBeNull();
	});

	it('returns null for internal refs starting with #', () => {
		const result = parseRef(
			{ $ref: '#/definitions/User' } as any,
			resolver,
			'user',
		);
		expect(result).toBeNull();
	});

	it('returns a ReferenceBuilder for external schema-id refs', () => {
		const result = parseRef({ $ref: 'user#' } as any, resolver, 'post');
		expect(result).not.toBeNull();
		const text = result!.text();
		expect(typeof text).toBe('string');
		expect(text.length).toBeGreaterThan(0);
	});

	it('returns a ReferenceBuilder for external path refs', () => {
		const result = parseRef({ $ref: 'models/post#' } as any, resolver, 'user');
		expect(result).not.toBeNull();
		const text = result!.text();
		expect(typeof text).toBe('string');
		// Implementation may use z.lazy or direct reference depending on resolver
		expect(text.length).toBeGreaterThan(0);
	});

	it('returns null when resolver cannot resolve target', () => {
		const result = parseRef({ $ref: 'missing#' } as any, resolver, 'user');
		expect(result).toBeNull();
	});
});

describe('extractRefs', () => {
	it('collects refs from nested structures', () => {
		const schema = {
			type: 'object',
			properties: {
				author: { $ref: '#/definitions/User' },
				post: { $ref: 'models/post#' },
			},
			allOf: [{ $ref: '#/definitions/Base' }],
			additionalProperties: { $ref: '#/definitions/Extra' },
			items: { $ref: '#/definitions/Item' },
		} as any;

		const refs = Array.from(extractRefs(schema));
		expect(refs).toContain('#/definitions/User');
		expect(refs).toContain('models/post#');
		expect(refs).toContain('#/definitions/Base');
		expect(refs).toContain('#/definitions/Extra');
		expect(refs).toContain('#/definitions/Item');
	});
});
