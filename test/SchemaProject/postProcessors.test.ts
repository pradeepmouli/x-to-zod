import { describe, it, expect, vi } from 'vitest';
import { SchemaProject } from '../../src/SchemaProject/SchemaProject.js';
import { mkdtempSync, rmSync, readFileSync } from 'fs';
import path from 'path';
import type { JSONSchemaAny as JSONSchema } from '../../src/JsonSchema/types/index.js';

describe('Post-Processor Integration (T081-T083)', () => {
	it('should apply global post-processors to all schemas', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'postproc-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: false,
				globalPostProcessors: [
					{ name: 'strictObjects' }, // All objects should be strict
				],
			});

			const userSchema: JSONSchema = {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					name: { type: 'string' },
				},
			};

			project.addSchema('user', userSchema);

			const result = await project.build();

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);

			// Read generated file and verify .strict() was applied
			const userFile = readFileSync(path.join(tempDir, 'user.ts'), 'utf8');
			expect(userFile).toContain('.strict()');
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});

	it('should merge global and per-schema post-processors', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'postproc-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: false,
				globalPostProcessors: [
					{ name: 'strictObjects' }, // Global: make objects strict
				],
			});

			const userSchema: JSONSchema = {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					name: { type: 'string' },
					tags: { type: 'array', items: { type: 'string' } },
				},
			};

			// Per-schema: make arrays non-empty
			project.addSchema('user', userSchema, {
				postProcessors: [{ name: 'nonemptyArrays' }],
			});

			const result = await project.build();

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);

			// Verify both post-processors were applied
			const userFile = readFileSync(path.join(tempDir, 'user.ts'), 'utf8');
			expect(userFile).toContain('.strict()'); // from global
			expect(userFile).toContain('.min(1)'); // from per-schema
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});

	it('should apply post-processors with options', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'postproc-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: false,
				globalPostProcessors: [
					{ name: 'brandIds', options: { 0: 'UserID' } }, // Brand id fields with 'UserID'
				],
			});

			const userSchema: JSONSchema = {
				type: 'object',
				properties: {
					id: { type: 'string' },
					name: { type: 'string' },
				},
			};

			project.addSchema('user', userSchema);

			const result = await project.build();

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);

			// Verify brand was applied
			const userFile = readFileSync(path.join(tempDir, 'user.ts'), 'utf8');
			expect(userFile).toContain('.brand');
			expect(userFile).toContain('UserID');
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});

	it('should fail build for invalid post-processor names', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'postproc-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: false,
				globalPostProcessors: [
					{ name: 'nonExistentProcessor' }, // Invalid processor
					{ name: 'strictObjects' }, // Valid processor
				],
			});

			const userSchema: JSONSchema = {
				type: 'object',
				properties: {
					id: { type: 'integer' },
				},
			};

			project.addSchema('user', userSchema);

			const result = await project.build();

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(result.errors?.[0]?.message).toContain(
				'Post-processor "nonExistentProcessor" not found in presets.',
			);
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});

	it('should apply post-processors in order', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'postproc-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: false,
				globalPostProcessors: [
					{ name: 'strictObjects' },
					{ name: 'nonemptyArrays' },
				],
			});

			const schema: JSONSchema = {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					items: { type: 'array', items: { type: 'string' } },
				},
			};

			project.addSchema('test', schema);

			const result = await project.build();

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);

			const testFile = readFileSync(path.join(tempDir, 'test.ts'), 'utf8');

			// Both post-processors should be applied
			expect(testFile).toContain('.strict()');
			expect(testFile).toContain('.min(1)');
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});
});
