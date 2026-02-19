import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SchemaProject } from '../../src/SchemaProject/SchemaProject.js';
import type { JSONSchema } from '../../src/Types.js';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('SchemaProject - Extract Definitions', () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), 'schema-project-test-'));
	});

	afterEach(() => {
		try {
			rmSync(tempDir, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	describe('extractDefinitions option', () => {
		it('should extract definitions when enabled', () => {
			const project = new SchemaProject({
				outDir: tempDir,
				extractDefinitions: true,
			});

			const schema: JSONSchema = {
				type: 'object',
				properties: {
					address: { $ref: '#/definitions/Address' },
				},
				definitions: {
					Address: {
						type: 'object',
						properties: {
							street: { type: 'string' },
							city: { type: 'string' },
						},
					},
				},
			};

			project.addSchema('user', schema);

			// Check that Address was extracted as a separate schema
			const registry = project.getRegistry();
			const addressEntry = registry.getEntry('definitions/Address');

			expect(addressEntry).toBeDefined();
			expect(addressEntry?.schema.type).toBe('object');
			expect(addressEntry?.schema.properties).toHaveProperty('street');
			expect(addressEntry?.schema.properties).toHaveProperty('city');
		});

		it('should extract OpenAPI components/schemas', () => {
			const project = new SchemaProject({
				outDir: tempDir,
				extractDefinitions: {
					enabled: true,
					subdir: 'components/schemas',
				},
			});

			const openApiSchema: any = {
				components: {
					schemas: {
						User: {
							type: 'object',
							properties: {
								id: { type: 'string' },
								name: { type: 'string' },
							},
						},
						Post: {
							type: 'object',
							properties: {
								id: { type: 'string' },
								title: { type: 'string' },
							},
						},
					},
				},
			};

			project.addSchema('api', openApiSchema);

			// Check that components were extracted
			const registry = project.getRegistry();
			const userEntry = registry.getEntry('components/schemas/User');
			const postEntry = registry.getEntry('components/schemas/Post');

			expect(userEntry).toBeDefined();
			expect(userEntry?.schema.type).toBe('object');
			expect(postEntry).toBeDefined();
			expect(postEntry?.schema.type).toBe('object');
		});

		it('should extract JSON Schema 2020-12 $defs', () => {
			const project = new SchemaProject({
				outDir: tempDir,
				extractDefinitions: true,
			});

			const schema: JSONSchema = {
				type: 'object',
				properties: {
					contact: { $ref: '#/$defs/Contact' },
				},
				$defs: {
					Contact: {
						type: 'object',
						properties: {
							email: { type: 'string' },
							phone: { type: 'string' },
						},
					},
				},
			};

			project.addSchema('user', schema);

			// Check that $defs was extracted
			const registry = project.getRegistry();
			const contactEntry = registry.getEntry('definitions/Contact');

			expect(contactEntry).toBeDefined();
			expect(contactEntry?.schema.type).toBe('object');
		});

		it('should use custom subdir when specified', () => {
			const project = new SchemaProject({
				outDir: tempDir,
				extractDefinitions: {
					enabled: true,
					subdir: 'custom/defs',
				},
			});

			const schema: JSONSchema = {
				type: 'object',
				definitions: {
					MyType: {
						type: 'string',
					},
				},
			};

			project.addSchema('schema', schema);

			const registry = project.getRegistry();
			const entry = registry.getEntry('custom/defs/MyType');

			expect(entry).toBeDefined();
		});

		it('should use custom namePattern when specified', () => {
			const project = new SchemaProject({
				outDir: tempDir,
				extractDefinitions: {
					enabled: true,
					namePattern: (schemaId, defName) => `${schemaId}__${defName}`,
				},
			});

			const schema: JSONSchema = {
				type: 'object',
				definitions: {
					Address: {
						type: 'object',
						properties: { street: { type: 'string' } },
					},
				},
			};

			project.addSchema('user', schema);

			const registry = project.getRegistry();
			const entry = registry.getEntry('user__Address');

			expect(entry).toBeDefined();
		});

		it('should not extract when disabled', () => {
			const project = new SchemaProject({
				outDir: tempDir,
				extractDefinitions: false,
			});

			const schema: JSONSchema = {
				type: 'object',
				properties: {
					address: { $ref: '#/definitions/Address' },
				},
				definitions: {
					Address: {
						type: 'object',
						properties: {
							street: { type: 'string' },
						},
					},
				},
			};

			project.addSchema('user', schema);

			// Check that definitions were NOT extracted
			const registry = project.getRegistry();
			const addressEntry = registry.getEntry('definitions/Address');

			expect(addressEntry).toBeUndefined();

			// Original schema should still have definitions
			const userEntry = registry.getEntry('user');
			expect(userEntry?.schema.definitions).toBeDefined();
			expect(userEntry?.schema.definitions.Address).toBeDefined();
		});

		it('should update parent schema references after extraction', () => {
			const project = new SchemaProject({
				outDir: tempDir,
				extractDefinitions: true,
			});

			const schema: JSONSchema = {
				type: 'object',
				properties: {
					address: { $ref: '#/definitions/Address' },
				},
				definitions: {
					Address: {
						type: 'object',
						properties: {
							street: { type: 'string' },
						},
					},
				},
			};

			project.addSchema('user', schema);

			// Check that parent schema now references the extracted definition
			const userEntry = project.getRegistry().getEntry('user');
			expect(userEntry?.schema.definitions.Address).toEqual({
				$ref: 'definitions/Address#/',
			});
		});

		it('should prevent recursive extraction', () => {
			const project = new SchemaProject({
				outDir: tempDir,
				extractDefinitions: true,
			});

			const schema: JSONSchema = {
				type: 'object',
				definitions: {
					Level1: {
						type: 'object',
						definitions: {
							Level2: {
								type: 'string',
							},
						},
					},
				},
			};

			project.addSchema('nested', schema);

			// Level1 should be extracted
			const level1 = project.getRegistry().getEntry('definitions/Level1');
			expect(level1).toBeDefined();

			// Level2 should NOT be re-extracted (prevented by extractDefinitions: false)
			const level2 = project.getRegistry().getEntry('definitions/Level2');
			expect(level2).toBeUndefined();

			// Level2 should remain in Level1's definitions
			expect(level1?.schema.definitions).toBeDefined();
			expect(level1?.schema.definitions.Level2).toBeDefined();
		});
	});
});
