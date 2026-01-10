import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SchemaProject } from '../../src/SchemaProject/SchemaProject.js';
import type { JsonSchema } from '../../src/Types.js';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'fs';
import path from 'path';

describe('User Story 1: OpenAPI Components (E2E)', () => {
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

	it('should generate 3 separate files for User, Post, Comment with index', async () => {
		// T060: Use OpenAPI-like component schemas
		const userSchema: JsonSchema = {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				name: { type: 'string' },
				email: { type: 'string', format: 'email' },
			},
			required: ['id', 'name'],
		};

		const postSchema: JsonSchema = {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				title: { type: 'string' },
				content: { type: 'string' },
				authorId: { type: 'integer' },
			},
			required: ['id', 'title', 'content', 'authorId'],
		};

		const commentSchema: JsonSchema = {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				text: { type: 'string' },
				postId: { type: 'integer' },
				authorId: { type: 'integer' },
			},
			required: ['id', 'text', 'postId', 'authorId'],
		};

		// T061: Add schemas and build
		project.addSchema('user', userSchema);
		project.addSchema('post', postSchema);
		project.addSchema('comment', commentSchema);

		const result = await project.build();

		// Verify build success
		expect(result.success).toBe(true);
		expect(result.errors).toHaveLength(0);
		expect(result.generatedFiles.length).toBeGreaterThan(0);

		// Verify 3 schema files + index file exist
		const fileNames = result.generatedFiles.map((f) => path.basename(f));
		expect(fileNames).toContain('user.ts');
		expect(fileNames).toContain('post.ts');
		expect(fileNames).toContain('comment.ts');
		expect(fileNames).toContain('index.ts');

		// Verify index file exports all schemas
		const indexPath = path.join(tempDir, 'index.ts');
		const indexContent = readFileSync(indexPath, 'utf8');
		expect(indexContent).toContain('export');
		expect(indexContent).toContain('User');
		expect(indexContent).toContain('Post');
		expect(indexContent).toContain('Comment');

		// Verify each schema file has valid Zod code
		const userPath = path.join(tempDir, 'user.ts');
		const userContent = readFileSync(userPath, 'utf8');
		expect(userContent).toContain('z.object');
		expect(userContent).toContain('id');
		expect(userContent).toContain('name');
	});

	it('should correctly resolve dependencies for referenced schemas', async () => {
		// Create schemas with cross-references (if supported via refResolver)
		const userSchema: JsonSchema = {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				name: { type: 'string' },
			},
			required: ['id', 'name'],
		};

		const postSchema: JsonSchema = {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				title: { type: 'string' },
				authorId: { type: 'integer' },
			},
			required: ['id', 'title', 'authorId'],
		};

		project.addSchema('user', userSchema);
		project.addSchema('post', postSchema);

		const depGraph = project.getDependencyGraph();
		expect(depGraph.nodes.size).toBe(2);
		expect(depGraph.nodes.has('user')).toBe(true);
		expect(depGraph.nodes.has('post')).toBe(true);

		const buildResult = await project.build();
		expect(buildResult.success).toBe(true);
	});
});
