import { describe, it, expect, beforeEach } from 'vitest';
import { SchemaRegistry } from '../../src/SchemaProject/SchemaRegistry.js';
import { DefaultNameResolver } from '../../src/SchemaProject/NameResolver.js';
import { DefaultRefResolver } from '../../src/SchemaProject/RefResolver.js';
import { Validator } from '../../src/SchemaProject/Validator.js';
import type {
	SchemaEntry,
	DependencyGraph,
} from '../../src/SchemaProject/types.js';

describe('Validator', () => {
	let registry: SchemaRegistry;
	let nameResolver: DefaultNameResolver;
	let refResolver: DefaultRefResolver;
	let depGraph: DependencyGraph;

	const makeEntry = (id: string, schema: Record<string, any>): SchemaEntry => ({
		id,
		schema,
		builder: null,
		sourceFile: null,
		exportName: '',
		metadata: {},
	});

	beforeEach(() => {
		registry = new SchemaRegistry();
		nameResolver = new DefaultNameResolver('schemaId');
		refResolver = new DefaultRefResolver(registry);
		depGraph = {
			nodes: new Set<string>(),
			edges: new Map<string, Set<string>>(),
			cycles: new Set<Set<string>>(),
		};
	});

	it('detects export name conflicts', () => {
		// Two IDs whose last segment resolves to the same export name: "User"
		registry.addEntry(makeEntry('user', { type: 'object' }));
		registry.addEntry(makeEntry('api/user', { type: 'object' }));

		const validator = new Validator(
			registry,
			nameResolver as any,
			refResolver as any,
			depGraph,
		);
		const result = validator.validate();

		expect(result.valid).toBe(false);
		expect(result.errors.some((e) => e.code === 'EXPORT_CONFLICT')).toBe(true);
		const conflict = result.errors.find((e) => e.code === 'EXPORT_CONFLICT');
		expect(conflict?.details?.exportName).toBe('User');
		expect(Array.isArray(conflict?.details?.affectedSchemaIds)).toBe(true);
		expect(conflict?.details?.affectedSchemaIds.length).toBe(2);
	});

	it('warns on missing refs (unresolved $ref)', () => {
		// Schema references a non-existent target
		registry.addEntry(
			makeEntry('post', {
				type: 'object',
				properties: {
					author: { $ref: 'missing' },
				},
			}),
		);

		const validator = new Validator(
			registry,
			nameResolver as any,
			refResolver as any,
			depGraph,
		);
		const result = validator.validate();

		expect(result.valid).toBe(true); // warnings should not invalidate
		expect(result.warnings.some((w) => w.code === 'MISSING_REF')).toBe(true);
		const warn = result.warnings.find((w) => w.code === 'MISSING_REF');
		expect(warn?.schemaId).toBe('post');
		expect(warn?.details?.ref).toBe('missing');
	});

	it('warns on cycles from dependency graph (SCCs)', () => {
		// Simulate a cycle between user and post
		const cycle = new Set<string>(['user', 'post']);
		depGraph.cycles.add(cycle);

		registry.addEntry(makeEntry('user', { type: 'object' }));
		registry.addEntry(makeEntry('post', { type: 'object' }));

		const validator = new Validator(
			registry,
			nameResolver as any,
			refResolver as any,
			depGraph,
		);
		const result = validator.validate();

		expect(result.warnings.some((w) => w.code === 'CIRCULAR_REF')).toBe(true);
		const circ = result.warnings.find((w) => w.code === 'CIRCULAR_REF');
		expect(Array.isArray(circ?.details?.cycle)).toBe(true);
		expect(circ?.details?.cycle).toContain('user');
		expect(circ?.details?.cycle).toContain('post');
	});

	it('returns valid when no errors and only non-blocking warnings exist', () => {
		// No conflicts, refs resolve internally, no cycles
		registry.addEntry(
			makeEntry('address', {
				type: 'object',
				properties: {
					street: { type: 'string' },
				},
			}),
		);

		const validator = new Validator(
			registry,
			nameResolver as any,
			refResolver as any,
			depGraph,
		);
		const result = validator.validate();

		expect(result.valid).toBe(true);
		expect(result.errors.length).toBe(0);
	});

	it('flags invalid schema types as errors', () => {
		registry.addEntry(makeEntry('invalid', 'not-an-object' as any));

		const validator = new Validator(
			registry,
			nameResolver as any,
			refResolver as any,
			depGraph,
		);

		const result = validator.validate();
		expect(result.valid).toBe(false);
		const invalid = result.errors.find((e) => e.code === 'INVALID_SCHEMA');
		expect(invalid?.schemaId).toBe('invalid');
	});
});
