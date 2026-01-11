import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SchemaProject } from '../../src/SchemaProject/SchemaProject.js';
import { mkdtempSync, rmSync } from 'fs';
import path from 'path';

const fixturesDir = path.join(process.cwd(), 'test/fixtures/ddd');

describe('User Story 2: Domain-Driven Design with Shared Types (E2E)', () => {
	let tempDir: string;
	let project: SchemaProject;

	beforeEach(() => {
		tempDir = mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'schema-'));
		project = new SchemaProject({
			outDir: tempDir,
			zodVersion: 'v4',
			generateIndex: true,
		});
	});

	afterEach(() => {
		if (tempDir) {
			rmSync(tempDir, { recursive: true });
		}
	});

	it('should support shared common types referenced by domain schemas', async () => {
		project.addSchemaFromFile(
			path.join(fixturesDir, 'common-types.json'),
			'common-types',
		);
		project.addSchemaFromFile(
			path.join(fixturesDir, 'user-schema.json'),
			'user-schema',
		);
		project.addSchemaFromFile(
			path.join(fixturesDir, 'post-schema.json'),
			'post-schema',
		);

		const depGraph = project.getDependencyGraph();
		expect(depGraph.nodes.size).toBe(3);
		expect(depGraph.edges.get('user-schema')?.has('common-types')).toBe(true);
		expect(depGraph.edges.get('post-schema')?.has('common-types')).toBe(true);
		expect(depGraph.edges.get('post-schema')?.has('user-schema')).toBe(true);

		const result = await project.build();
		expect(result.success).toBe(true);
		expect(result.errors).toEqual([]);
		expect(result.generatedFiles.length).toBeGreaterThan(0);
	});

	it('should properly handle dependency graph with multiple schemas', () => {
		// T064: Verify dependency graph ordering
		const commonTypes = {
			type: 'object',
			properties: { id: { type: 'string' } },
		};
		const userSchema = {
			type: 'object',
			properties: { id: { type: 'string' } },
		};
		const postSchema = {
			type: 'object',
			properties: { id: { type: 'string' } },
		};

		project.addSchema('common/types', commonTypes);
		project.addSchema('user/schema', userSchema);
		project.addSchema('post/schema', postSchema);

		const depGraph = project.getDependencyGraph();
		expect(depGraph.nodes.size).toBe(3);
		expect(depGraph.nodes.has('common/types')).toBe(true);
		expect(depGraph.nodes.has('user/schema')).toBe(true);
		expect(depGraph.nodes.has('post/schema')).toBe(true);
	});

	it('should detect cycles in dependency graph', () => {
		// T065: Cycle detection without validation errors
		const userSchema = {
			type: 'object',
			properties: { id: { type: 'string' } },
		};
		const postSchema = {
			type: 'object',
			properties: { id: { type: 'string' } },
		};

		project.addSchema('user/schema', userSchema);
		project.addSchema('post/schema', postSchema);

		const depGraph = project.getDependencyGraph();
		depGraph.addEdge('user/schema', 'post/schema');
		depGraph.addEdge('post/schema', 'user/schema');
		depGraph.detectCycles();

		// Verify cycle was detected
		expect(depGraph.cycles.size).toBeGreaterThan(0);
		const cycleArray = Array.from(depGraph.cycles)[0];
		expect(cycleArray.has('user/schema')).toBe(true);
		expect(cycleArray.has('post/schema')).toBe(true);
	});
});
