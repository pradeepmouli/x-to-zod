import { describe, it, expect } from 'vitest';
import { SchemaProject } from '../../src/SchemaProject/SchemaProject.js';
import { mkdtempSync, rmSync } from 'fs';
import path from 'path';
import type { JsonSchema } from '../../src/Types.js';

describe('Large Schema Performance (T078)', () => {
	it('should build 50+ schemas in under 5 seconds', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'perf-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: true,
			});

			// Create 60 schemas with cross-references
			const schemaCount = 60;
			for (let i = 0; i < schemaCount; i++) {
				const schema: JsonSchema = {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						name: { type: 'string' },
						description: { type: 'string' },
						createdAt: { type: 'string', format: 'date-time' },
						updatedAt: { type: 'string', format: 'date-time' },
						metadata: {
							type: 'object',
							properties: {
								key: { type: 'string' },
								value: { type: 'string' },
							},
						},
						tags: {
							type: 'array',
							items: { type: 'string' },
						},
					},
					required: ['id', 'name'],
				};

				// Add some cross-references for realism (not every schema refs another)
				if (i > 0 && i % 3 === 0) {
					const targetIdx = Math.max(0, i - 5);
					(schema as any).properties.relatedItem = {
						$ref: `schema${targetIdx}#`,
					};
				}

				project.addSchema(`schema${i}`, schema);
			}

			const startTime = Date.now();
			const result = await project.build();
			const duration = Date.now() - startTime;

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);
			expect(result.generatedFiles.length).toBeGreaterThan(schemaCount); // schemas + index

			// Should complete in under 5 seconds
			expect(duration).toBeLessThan(5000);

			console.log(
				`Built ${schemaCount} schemas in ${duration}ms (${(duration / schemaCount).toFixed(2)}ms per schema)`,
			);
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});

	it('should handle 100 simple schemas efficiently', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'perf-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: true,
			});

			// Create 100 simple schemas
			const schemaCount = 100;
			for (let i = 0; i < schemaCount; i++) {
				const schema: JsonSchema = {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						value: { type: 'string' },
					},
					required: ['id'],
				};

				project.addSchema(`simple${i}`, schema);
			}

			const startTime = Date.now();
			const result = await project.build();
			const duration = Date.now() - startTime;

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);

			// Should complete in under 5 seconds
			expect(duration).toBeLessThan(5000);

			console.log(
				`Built ${schemaCount} simple schemas in ${duration}ms (${(duration / schemaCount).toFixed(2)}ms per schema)`,
			);
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});
});
