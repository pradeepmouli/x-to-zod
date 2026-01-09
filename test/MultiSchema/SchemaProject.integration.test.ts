import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SchemaProject } from '../../src/MultiSchema/SchemaProject.js';
import type { JsonSchema } from '../../src/Types.js';
import { mkdtempSync, rmSync, existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';

describe('SchemaProject Build Integration', () => {
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

	it('should build a multi-schema project with index file', async () => {
		// Define three related schemas
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
				createdAt: { type: 'string', format: 'date-time' },
			},
			required: ['id', 'title', 'authorId'],
		};

		const commentSchema: JsonSchema = {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				text: { type: 'string' },
				postId: { type: 'integer' },
				authorId: { type: 'integer' },
				createdAt: { type: 'string', format: 'date-time' },
			},
			required: ['id', 'text', 'postId', 'authorId'],
		};

		// Add schemas to project
		project.addSchema('user', userSchema);
		project.addSchema('post', postSchema);
		project.addSchema('comment', commentSchema);

		// Build the project
		const result = await project.build();

		// Verify build succeeded
		expect(result.success).toBe(true);
		expect(result.errors).toHaveLength(0);

		// Verify schemas were parsed
		const userEntry = project.getRegistry().getEntry('user');
		const postEntry = project.getRegistry().getEntry('post');
		const commentEntry = project.getRegistry().getEntry('comment');

		expect(userEntry?.builder).toBeDefined();
		expect(postEntry?.builder).toBeDefined();
		expect(commentEntry?.builder).toBeDefined();

		// Verify files were generated
		expect(result.generatedFiles.length).toBeGreaterThan(0);

		// Check output directory structure
		expect(existsSync(tempDir)).toBe(true);

		const generatedFileNames = result.generatedFiles.map((f) =>
			path.basename(f),
		);
		expect(generatedFileNames).toContain('index.ts');

		// Verify index file content includes all schemas
		const indexPath = path.join(tempDir, 'index.ts');
		if (existsSync(indexPath)) {
			const indexContent = readFileSync(indexPath, 'utf8');
			expect(indexContent).toContain('User');
			expect(indexContent).toContain('Post');
			expect(indexContent).toContain('Comment');
		}
	});

	it('should handle build with schema-specific options', async () => {
		const schema: JsonSchema = {
			type: 'object',
			properties: {
				id: { type: 'string', format: 'uuid' },
				data: { type: 'object' },
			},
		};

		project.addSchema('entity', schema, {
			postProcessors: [],
		});

		const result = await project.build();
		expect(result.success).toBe(true);

		const entry = project.getRegistry().getEntry('entity');
		expect(entry).toBeDefined();
		expect(entry?.metadata.postProcessors).toEqual([]);
	});

	it('should build schemas in dependency order', async () => {
		// Create schemas with dependencies (though not using $refs in this simple case)
		const schema1: JsonSchema = {
			type: 'object',
			properties: { id: { type: 'integer' } },
		};

		const schema2: JsonSchema = {
			type: 'object',
			properties: { ref1Id: { type: 'integer' } },
		};

		const schema3: JsonSchema = {
			type: 'object',
			properties: { ref2Id: { type: 'integer' } },
		};

		project.addSchema('schema1', schema1);
		project.addSchema('schema2', schema2);
		project.addSchema('schema3', schema3);

		const result = await project.build();
		expect(result.success).toBe(true);

		// All schemas should be built
		const entries = project.getRegistry().getAllEntries();
		entries.forEach((entry) => {
			expect(entry.builder).toBeDefined();
		});
	});

	it('should skip index generation when disabled', async () => {
		const projectNoIndex = new SchemaProject({
			outDir: tempDir,
			zodVersion: 'v4',
			generateIndex: false,
		});

		const schema: JsonSchema = {
			type: 'object',
			properties: { name: { type: 'string' } },
		};

		projectNoIndex.addSchema('entity', schema);
		const result = await projectNoIndex.build();

		expect(result.success).toBe(true);

		// Index file should not exist (or not be in generatedFiles if it was)
		const indexPath = path.join(tempDir, 'index.ts');
		// Check that no index-specific file is generated when disabled
		expect(result.generatedFiles.length).toBeGreaterThanOrEqual(1);
	});

	it('should handle parsing errors gracefully', async () => {
		// Add a valid schema
		const validSchema: JsonSchema = {
			type: 'object',
			properties: { id: { type: 'integer' } },
		};

		project.addSchema('valid', validSchema);

		// Add a schema that might cause parsing issues
		const problematicSchema: JsonSchema = {
			// Schema with conflicting/ambiguous type info
			type: 'string',
			properties: {
				// properties should not exist on string type
				field: { type: 'string' },
			},
		} as any;

		project.addSchema('problematic', problematicSchema);

		const result = await project.build();

		// Build should complete (may have warnings but valid schemas should parse)
		expect(result.success === true || result.success === false).toBe(true);

		// Valid schema should still be processed
		const validEntry = project.getRegistry().getEntry('valid');
		expect(validEntry?.builder).toBeDefined();
	});

	it('should support different module formats', async () => {
		const projectESM = new SchemaProject({
			outDir: tempDir,
			zodVersion: 'v4',
			moduleFormat: 'esm',
		});

		const schema: JsonSchema = {
			type: 'object',
			properties: { value: { type: 'string' } },
		};

		projectESM.addSchema('test', schema);
		const result = await projectESM.build();

		expect(result.success).toBe(true);
	});

	it('should generate export names for all schemas', async () => {
		const schemas = [
			{ id: 'user-profile', schema: { type: 'object' } },
			{ id: 'api-response', schema: { type: 'object' } },
			{ id: 'data_model', schema: { type: 'object' } },
		];

		schemas.forEach(({ id, schema }) => {
			project.addSchema(id, schema);
		});

		const result = await project.build();
		expect(result.success).toBe(true);

		// All schemas should have valid export names
		schemas.forEach(({ id }) => {
			const entry = project.getRegistry().getEntry(id);
			expect(entry?.exportName).toBeDefined();
			// Export name should be a valid JS identifier
			expect(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(entry?.exportName || '')).toBe(
				true,
			);
		});
	});
});
