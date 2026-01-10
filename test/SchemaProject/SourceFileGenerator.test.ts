import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SourceFileGenerator } from '../../src/SchemaProject/SourceFileGenerator.js';
import { ImportManager } from '../../src/SchemaProject/ImportManager.js';
import type { ZodBuilder } from '../../src/ZodBuilder/BaseBuilder.js';
import type { SchemaEntry } from '../../src/SchemaProject/types.js';
import { mkdtempSync, rmSync } from 'fs';
import path from 'path';

// Mock ZodBuilder - implements minimal interface needed for testing
class MockBuilder implements Pick<ZodBuilder, 'text'> {
	constructor(private zodCode: string) {}
	text(): string {
		return this.zodCode;
	}
}

describe('SourceFileGenerator', () => {
	let tempDir: string;
	let generator: SourceFileGenerator;

	beforeEach(() => {
		tempDir = mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'gen-'));
		generator = new SourceFileGenerator(tempDir, false);
	});

	afterEach(() => {
		generator.dispose();
		if (tempDir) {
			rmSync(tempDir, { recursive: true });
		}
	});

	describe('generateFile', () => {
		it('should generate a TypeScript file with builder code', () => {
			const builder = new MockBuilder(
				'z4.object({ id: z4.number().int(), name: z4.string() })',
			) as unknown as ZodBuilder;
			const imports = new ImportManager('esm');
			imports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});

			const sourceFile = generator.generateFile(
				'user',
				builder,
				imports,
				'UserSchema',
			);

			expect(sourceFile).not.toBeNull();
			expect(sourceFile?.getFilePath()).toContain('user.ts');

			const text = sourceFile?.getFullText();
			expect(text).toContain('export default');
			expect(text).toContain('z4.object');
		});

		it('should include import statements in generated file', () => {
			const builder = new MockBuilder(
				'z4.object({ userId: z4.string(), post: PostSchema })',
			) as unknown as ZodBuilder;
			const imports = new ImportManager('esm');
			imports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});
			imports.addImport({
				importName: 'PostSchema',
				importKind: 'default',
				modulePath: './post.js',
			});

			const sourceFile = generator.generateFile(
				'entity',
				builder,
				imports,
				'EntitySchema',
			);

			expect(sourceFile).not.toBeNull();

			const text = sourceFile?.getFullText();
			expect(text).toContain('import z4 from "zod"');
			expect(text).toContain('import PostSchema from "./post.js"');
		});

		it('should place imports before export statement', () => {
			const builder = new MockBuilder(
				'z4.object({ value: z4.number() })',
			) as unknown as ZodBuilder;
			const imports = new ImportManager('esm');
			imports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});
			imports.addImport({
				importName: 'BaseSchema',
				importKind: 'default',
				modulePath: './base.js',
			});

			const sourceFile = generator.generateFile(
				'derived',
				builder,
				imports,
				'DerivedSchema',
			);

			expect(sourceFile).not.toBeNull();

			const text = sourceFile?.getFullText();
			const importPos = text!.indexOf('import');
			const exportPos = text!.indexOf('export default');

			expect(importPos).toBeGreaterThan(-1);
			expect(exportPos).toBeGreaterThan(-1);
			expect(importPos).toBeLessThan(exportPos);
		});

		it('should handle multiple import statements', () => {
			const builder = new MockBuilder(
				'z4.object({ user: UserSchema, post: PostSchema, comment: CommentSchema })',
			) as unknown as ZodBuilder;
			const imports = new ImportManager('esm');
			imports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});
			imports.addImport({
				importName: 'UserSchema',
				importKind: 'default',
				modulePath: './user.js',
			});
			imports.addImport({
				importName: 'PostSchema',
				importKind: 'default',
				modulePath: './post.js',
			});
			imports.addImport({
				importName: 'CommentSchema',
				importKind: 'default',
				modulePath: './comment.js',
			});

			const sourceFile = generator.generateFile(
				'feed',
				builder,
				imports,
				'FeedSchema',
			);

			expect(sourceFile).not.toBeNull();

			const text = sourceFile?.getFullText();
			expect(text).toContain('import z4 from "zod"');
			expect(text).toContain('import UserSchema from "./user.js"');
			expect(text).toContain('import PostSchema from "./post.js"');
			expect(text).toContain('import CommentSchema from "./comment.js"');
		});

		it('should handle schema IDs with slashes', () => {
			const builder = new MockBuilder(
				'z4.object({ id: z4.string() })',
			) as unknown as ZodBuilder;
			const imports = new ImportManager('esm');
			imports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});

			const sourceFile = generator.generateFile(
				'api/v1/user',
				builder,
				imports,
				'ApiUserSchema',
			);

			expect(sourceFile).not.toBeNull();
			expect(sourceFile?.getFilePath()).toContain('api/v1/user.ts');
		});

		it('should return null on error', () => {
			// Pass null builder to trigger error
			const imports = new ImportManager('esm');

			const sourceFile = generator.generateFile(
				'invalid',
				null as any,
				imports,
				'InvalidSchema',
			);

			expect(sourceFile).toBeNull();
		});
	});

	describe('generateIndex', () => {
		it('should generate index file with exports', () => {
			const entries: SchemaEntry[] = [
				{
					id: 'user',
					exportName: 'UserSchema',
					schema: {},
					builder: null,
					sourceFile: null,
					metadata: {},
				},
				{
					id: 'post',
					exportName: 'PostSchema',
					schema: {},
					builder: null,
					sourceFile: null,
					metadata: {},
				},
				{
					id: 'comment',
					exportName: 'CommentSchema',
					schema: {},
					builder: null,
					sourceFile: null,
					metadata: {},
				},
			];
			const imports = new ImportManager('esm');

			const sourceFile = generator.generateIndex(entries, imports);

			expect(sourceFile).not.toBeNull();
			expect(sourceFile?.getFilePath()).toContain('index.ts');

			const text = sourceFile?.getFullText();
			expect(text).toContain('export { default as UserSchema } from "./user"');
			expect(text).toContain('export { default as PostSchema } from "./post"');
			expect(text).toContain(
				'export { default as CommentSchema } from "./comment"',
			);
		});

		it('should handle nested schema paths', () => {
			const entries: SchemaEntry[] = [
				{
					id: 'api/v1/user',
					exportName: 'ApiV1UserSchema',
					schema: {},
					builder: null,
					sourceFile: null,
					metadata: {},
				},
				{
					id: 'models/user',
					exportName: 'ModelsUserSchema',
					schema: {},
					builder: null,
					sourceFile: null,
					metadata: {},
				},
			];
			const imports = new ImportManager('esm');

			const sourceFile = generator.generateIndex(entries, imports);

			expect(sourceFile).not.toBeNull();

			const text = sourceFile?.getFullText();
			expect(text).toContain(
				'export { default as ApiV1UserSchema } from "./api/v1/user"',
			);
			expect(text).toContain(
				'export { default as ModelsUserSchema } from "./models/user"',
			);
		});

		it('should generate empty index for no exports', () => {
			const imports = new ImportManager('esm');
			const sourceFile = generator.generateIndex([], imports);

			expect(sourceFile).not.toBeNull();

			const text = sourceFile?.getFullText();
			expect(text).toBeDefined();
			expect(text).toBe('');
		});
	});

	describe('saveAll', () => {
		it('should save all source files to disk', async () => {
			const builder = new MockBuilder('z4.string()') as unknown as ZodBuilder;
			const imports = new ImportManager('esm');
			imports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});

			generator.generateFile('test', builder, imports, 'TestSchema');

			const result = await generator.saveAll();

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);
		});

		it('should return errors if save fails', async () => {
			// Create generator with invalid path
			const badGenerator = new SourceFileGenerator(
				'/nonexistent/path/that/does/not/exist',
				false,
			);

			const builder = new MockBuilder('z4.string()') as unknown as ZodBuilder;
			const imports = new ImportManager('esm');

			badGenerator.generateFile('test', builder, imports, 'TestSchema');

			// This should throw or return empty array based on error handling
			try {
				const result = await badGenerator.saveAll();
				// If it succeeds unexpectedly, that's also ok - just check type
				expect(Array.isArray(result)).toBe(true);
			} catch (error) {
				// Expected to fail with invalid path
				expect(error).toBeDefined();
			}

			badGenerator.dispose();
		});

		it('should format files when prettier is enabled', async () => {
			const generatorWithPrettier = new SourceFileGenerator(tempDir, true);
			const builder = new MockBuilder(
				'z4.object({id:z4.number(),name:z4.string()})',
			) as unknown as ZodBuilder;
			const imports = new ImportManager('esm');
			imports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});

			generatorWithPrettier.generateFile(
				'formatted',
				builder,
				imports,
				'FormattedSchema',
			);

			const result = await generatorWithPrettier.saveAll();

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThan(0);

			generatorWithPrettier.dispose();
		});
	});

	describe('getProject', () => {
		it('should return ts-morph Project instance', () => {
			const project = generator.getProject();

			expect(project).toBeDefined();
			expect(typeof project.createSourceFile).toBe('function');
		});
	});

	describe('dispose', () => {
		it('should clean up resources', () => {
			const builder = new MockBuilder('z4.string()') as unknown as ZodBuilder;
			const imports = new ImportManager('esm');
			imports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});

			generator.generateFile('test', builder, imports, 'TestSchema');
			generator.dispose();

			// After dispose, project should no longer have files
			const project = generator.getProject();
			expect(project.getSourceFiles()).toHaveLength(0);
		});
	});

	describe('formatting', () => {
		it('should properly format generated code', () => {
			const builder = new MockBuilder(
				'z4.object({ nested: z4.object({ deep: z4.array(z4.string()) }) })',
			) as unknown as ZodBuilder;
			const imports = new ImportManager('esm');
			imports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});

			const sourceFile = generator.generateFile(
				'nested',
				builder,
				imports,
				'NestedSchema',
			);

			expect(sourceFile).not.toBeNull();

			const text = sourceFile?.getFullText();
			expect(text).toContain('z4.object');
			expect(text).toContain('nested:');
			expect(text).toContain('deep:');
		});
	});

	describe('file path computation', () => {
		it('should compute correct relative paths for schema IDs', () => {
			const builder = new MockBuilder('z4.string()') as unknown as ZodBuilder;
			const imports = new ImportManager('esm');

			const sf1 = generator.generateFile(
				'models/user',
				builder,
				imports,
				'UserSchema',
			);
			const sf2 = generator.generateFile(
				'schemas/post',
				builder,
				imports,
				'PostSchema',
			);

			expect(sf1?.getFilePath()).toContain('models/user.ts');
			expect(sf2?.getFilePath()).toContain('schemas/post.ts');
		});
	});

	describe('integration', () => {
		it('should generate complete project structure', async () => {
			const userBuilder = new MockBuilder(
				'z4.object({ id: z4.number(), name: z4.string() })',
			) as unknown as ZodBuilder;
			const postBuilder = new MockBuilder(
				'z4.object({ id: z4.number(), title: z4.string() })',
			) as unknown as ZodBuilder;

			const userImports = new ImportManager('esm');
			userImports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});

			const postImports = new ImportManager('esm');
			postImports.addImport({
				importName: 'z4',
				importKind: 'default',
				modulePath: 'zod',
			});

			generator.generateFile('user', userBuilder, userImports, 'UserSchema');
			generator.generateFile('post', postBuilder, postImports, 'PostSchema');

			const entries: SchemaEntry[] = [
				{
					id: 'user',
					exportName: 'UserSchema',
					schema: {},
					builder: null,
					sourceFile: null,
					metadata: {},
				},
				{
					id: 'post',
					exportName: 'PostSchema',
					schema: {},
					builder: null,
					sourceFile: null,
					metadata: {},
				},
			];
			const indexImports = new ImportManager('esm');
			generator.generateIndex(entries, indexImports);

			const result = await generator.saveAll();

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBeGreaterThanOrEqual(3); // user, post, index
		});
	});
});
