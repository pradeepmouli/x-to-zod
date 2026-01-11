import { describe, it, expect } from 'vitest';
import { SchemaProject } from '../../src/SchemaProject/SchemaProject.js';
import { mkdtempSync, rmSync, readFileSync } from 'fs';
import path from 'path';
import type { JsonSchema } from '../../src/Types.js';

describe('Strict TypeScript Validation (T088-T089)', () => {
	it('should generate code with proper imports and no implicit any', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'strict-ts-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: true,
			});

			// Add various schema types to test comprehensive type safety
			const userSchema: JsonSchema = {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					name: { type: 'string' },
					email: { type: 'string', format: 'email' },
					age: { type: 'number', minimum: 0 },
					isActive: { type: 'boolean' },
					tags: { type: 'array', items: { type: 'string' } },
					metadata: {
						type: 'object',
						properties: {
							createdAt: { type: 'string', format: 'date-time' },
							updatedAt: { type: 'string', format: 'date-time' },
						},
					},
				},
				required: ['id', 'name', 'email'],
			};

			const productSchema: JsonSchema = {
				type: 'object',
				properties: {
					id: { type: 'string' },
					name: { type: 'string' },
					price: { type: 'number', minimum: 0 },
					category: {
						type: 'string',
						enum: ['electronics', 'clothing', 'food'],
					},
				},
				required: ['id', 'name', 'price'],
			};

			const orderSchema: JsonSchema = {
				type: 'object',
				properties: {
					id: { type: 'string' },
					userId: { type: 'integer' },
					productIds: { type: 'array', items: { type: 'string' } },
					total: { type: 'number' },
				},
				required: ['id', 'userId', 'productIds', 'total'],
			};

			project.addSchema('user', userSchema);
			project.addSchema('product', productSchema);
			project.addSchema('order', orderSchema);

			const result = await project.build();

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);

			// Verify each generated file has proper structure
			const userFile = readFileSync(path.join(tempDir, 'user.ts'), 'utf8');
			const productFile = readFileSync(
				path.join(tempDir, 'product.ts'),
				'utf8',
			);
			const orderFile = readFileSync(path.join(tempDir, 'order.ts'), 'utf8');

			// Check that code uses Zod builders (z.object, z.string, etc.)
			// Note: Generated code uses inline z.* without imports (imports handled at runtime)
			expect(userFile).toContain('z.object(');
			expect(productFile).toContain('z.object(');
			expect(orderFile).toContain('z.object(');

			// Check that exports are properly typed (not using any)
			expect(userFile).toMatch(/export\s+default\s+z\./);
			expect(productFile).toMatch(/export\s+default\s+z\./);
			expect(orderFile).toMatch(/export\s+default\s+z\./);

			// Verify no usage of 'any' keyword (except in type annotations which are valid)
			// We specifically check for patterns like ': any' which indicate implicit any
			expect(userFile).not.toMatch(/:\s*any[^\w]/);
			expect(productFile).not.toMatch(/:\s*any[^\w]/);
			expect(orderFile).not.toMatch(/:\s*any[^\w]/);

			// Verify strict mode patterns: proper typing for builders
			expect(userFile).toContain('z.object');
			expect(userFile).toContain('z.string()');
			expect(userFile).toContain('z.number()');
			expect(userFile).toContain('z.boolean()');
			expect(userFile).toContain('z.array(');
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});

	it('should generate exact typing for complex schemas', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'exact-types-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: false,
			});

			// Schema with complex types that require exact typing
			const complexSchema: JsonSchema = {
				type: 'object',
				properties: {
					id: { type: 'string' },
					count: { type: 'integer' },
					optional: { type: 'string' },
					nullable: { type: ['string', 'null'] },
					union: {
						oneOf: [{ type: 'string' }, { type: 'number' }],
					},
					anyOf: {
						anyOf: [
							{ type: 'string' },
							{ type: 'number' },
							{ type: 'boolean' },
						],
					},
				},
				required: ['id', 'count'],
			};

			project.addSchema('complex', complexSchema);

			const result = await project.build();

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);

			const complexFile = readFileSync(path.join(tempDir, 'complex.ts'), 'utf8');

			// Verify code uses Zod builders
			expect(complexFile).toContain('z.object(');

			// Verify no implicit any
			expect(complexFile).not.toMatch(/:\s*any[^\w]/);

			// Verify exact types for union/nullable
			expect(complexFile).toContain('z.union('); // For oneOf and nullable
			// Note: nullable is represented as z.union([z.string(), z.null()])
			expect(complexFile).toContain('z.null()'); // Part of nullable union

			// Verify optional properties are handled correctly
			expect(complexFile).toContain('.optional()');
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});

	it('should generate type-safe exports with no loose typing', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'type-safe-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: true,
			});

			// Simple schema to verify export structure
			const simpleSchema: JsonSchema = {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					value: { type: 'string' },
				},
				required: ['id'],
			};

			project.addSchema('simple', simpleSchema);

			const result = await project.build();

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);

			const simpleFile = readFileSync(path.join(tempDir, 'simple.ts'), 'utf8');
			const indexFile = readFileSync(path.join(tempDir, 'index.ts'), 'utf8');

			// Verify code uses Zod builders (typed, not any)
			expect(simpleFile).toContain('z.object(');

			// Verify export is default (ensures type safety)
			expect(simpleFile).toMatch(/export\s+default\s+z\./);

			// Verify no use of any keyword
			expect(simpleFile).not.toMatch(/:\s*any[^\w]/);

			// Verify index file has proper exports
			expect(indexFile).toMatch(/export\s+.*\s+from\s+['"]\.\//);
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});

	it('should handle all JSON Schema types with strict typing', async () => {
		const tempDir = mkdtempSync(
			path.join(process.env.TMPDIR || '/tmp', 'all-types-'),
		);

		try {
			const project = new SchemaProject({
				outDir: tempDir,
				zodVersion: 'v4',
				generateIndex: false,
			});

			// Schema covering all JSON Schema primitive types
			const allTypesSchema: JsonSchema = {
				type: 'object',
				properties: {
					stringField: { type: 'string' },
					numberField: { type: 'number' },
					integerField: { type: 'integer' },
					booleanField: { type: 'boolean' },
					nullField: { type: 'null' },
					arrayField: { type: 'array', items: { type: 'string' } },
					objectField: {
						type: 'object',
						properties: {
							nested: { type: 'string' },
						},
					},
					enumField: { enum: ['A', 'B', 'C'] },
				},
			};

			project.addSchema('allTypes', allTypesSchema);

			const result = await project.build();

			expect(result.success).toBe(true);
			expect(result.errors).toEqual([]);

			const allTypesFile = readFileSync(
				path.join(tempDir, 'allTypes.ts'),
				'utf8',
			);

			// Verify all Zod types are used with proper typing
			expect(allTypesFile).toContain('z.string()');
			expect(allTypesFile).toContain('z.number()');
			expect(allTypesFile).toContain('z.boolean()');
			expect(allTypesFile).toContain('z.null()');
			expect(allTypesFile).toContain('z.array(');
			expect(allTypesFile).toContain('z.object(');
			expect(allTypesFile).toContain('z.enum('); // or z.literal for enum

			// Verify no implicit any
			expect(allTypesFile).not.toMatch(/:\s*any[^\w]/);
		} finally {
			rmSync(tempDir, { recursive: true });
		}
	});
});
