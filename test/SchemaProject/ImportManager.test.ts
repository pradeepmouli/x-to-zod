import { describe, it, expect, beforeEach } from 'vitest';
import { ImportManager } from '../../src/SchemaProject/ImportManager.js';
import type { ImportInfo } from '../../src/SchemaProject/types.js';

describe('ImportManager', () => {
	let manager: ImportManager;

	beforeEach(() => {
		manager = new ImportManager('esm');
	});

	describe('addImport', () => {
		it('should add a single import', () => {
			const importInfo: ImportInfo = {
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			};

			manager.addImport(importInfo);
			const imports = manager.getImports();

			expect(imports).toHaveLength(1);
			expect(imports[0]).toEqual(importInfo);
		});

		it('should deduplicate imports by modulePath and importName', () => {
			const importInfo: ImportInfo = {
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			};

			manager.addImport(importInfo);
			manager.addImport(importInfo);
			manager.addImport(importInfo);

			expect(manager.getImports()).toHaveLength(1);
		});

		it('should allow different imports from the same module', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserType',
				importKind: 'named',
				isTypeOnly: true,
			});

			expect(manager.getImports()).toHaveLength(2);
		});

		it('should allow same import name from different modules', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'Schema',
				importKind: 'named',
				isTypeOnly: false,
			});
			manager.addImport({
				modulePath: './post.js',
				importName: 'Schema',
				importKind: 'named',
				isTypeOnly: false,
			});

			expect(manager.getImports()).toHaveLength(2);
		});
	});

	describe('addImports', () => {
		it('should add multiple imports at once', () => {
			const imports: ImportInfo[] = [
				{
					modulePath: './user.js',
					importName: 'UserSchema',
					importKind: 'named',
					isTypeOnly: false,
				},
				{
					modulePath: './post.js',
					importName: 'PostSchema',
					importKind: 'named',
					isTypeOnly: false,
				},
			];

			manager.addImports(imports);
			expect(manager.getImports()).toHaveLength(2);
		});

		it('should deduplicate when adding multiple imports', () => {
			const imports: ImportInfo[] = [
				{
					modulePath: './user.js',
					importName: 'UserSchema',
					importKind: 'named',
					isTypeOnly: false,
				},
				{
					modulePath: './user.js',
					importName: 'UserSchema',
					importKind: 'named',
					isTypeOnly: false,
				},
			];

			manager.addImports(imports);
			expect(manager.getImports()).toHaveLength(1);
		});
	});

	describe('getImportStatements - ESM', () => {
		beforeEach(() => {
			manager = new ImportManager('esm');
		});

		it('should generate ESM named import statement', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(1);
			expect(statements[0]).toBe('import { UserSchema } from "./user.js"');
		});

		it('should generate ESM type-only import statement', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserType',
				importKind: 'named',
				isTypeOnly: true,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(1);
			expect(statements[0]).toBe('import type { UserType } from "./user.js"');
		});

		it('should combine regular and type-only imports from same module', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserType',
				importKind: 'named',
				isTypeOnly: true,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(1);
			expect(statements[0]).toBe(
				'import { UserSchema }, type { UserType } from "./user.js"',
			);
		});

		it('should generate multiple named imports from same module', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});
			manager.addImport({
				modulePath: './user.js',
				importName: 'AdminSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(1);
			expect(statements[0]).toBe(
				'import { UserSchema, AdminSchema } from "./user.js"',
			);
		});

		it('should generate default import statement', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'User',
				importKind: 'default',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(1);
			expect(statements[0]).toBe('import User from "./user.js"');
		});

		it('should generate namespace import statement', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserModule',
				importKind: 'namespace',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(1);
			expect(statements[0]).toBe('import * as UserModule from "./user.js"');
		});

		it('should combine default and named imports', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'User',
				importKind: 'default',
				isTypeOnly: false,
			});
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(1);
			expect(statements[0]).toBe(
				'import { UserSchema }, User from "./user.js"',
			);
		});

		it('should generate separate statements for different modules', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});
			manager.addImport({
				modulePath: './post.js',
				importName: 'PostSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(2);
			expect(statements).toContain('import { UserSchema } from "./user.js"');
			expect(statements).toContain('import { PostSchema } from "./post.js"');
		});
	});

	describe('getImportStatements - CJS', () => {
		beforeEach(() => {
			manager = new ImportManager('cjs');
		});

		it('should generate CJS named import statement', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(1);
			expect(statements[0]).toBe('const { UserSchema } = require("./user.js")');
		});

		it('should generate multiple named imports in CJS', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});
			manager.addImport({
				modulePath: './user.js',
				importName: 'AdminSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(1);
			expect(statements[0]).toBe(
				'const { UserSchema, AdminSchema } = require("./user.js")',
			);
		});

		it('should generate namespace import in CJS', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserModule',
				importKind: 'namespace',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(1);
			expect(statements[0]).toBe('const UserModule = require("./user.js")');
		});

		it('should generate separate statements for different modules in CJS', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});
			manager.addImport({
				modulePath: './post.js',
				importName: 'PostSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements).toHaveLength(2);
			expect(statements).toContain(
				'const { UserSchema } = require("./user.js")',
			);
			expect(statements).toContain(
				'const { PostSchema } = require("./post.js")',
			);
		});
	});

	describe('computeRelativePath', () => {
		it('should compute relative path from one file to another in same directory', () => {
			const result = manager.computeRelativePath(
				'./src/user.ts',
				'./src/post.ts',
			);
			expect(result).toBe('post');
		});

		it('should compute relative path from subdirectory to parent directory', () => {
			const result = manager.computeRelativePath(
				'./src/models/user.ts',
				'./src/base.ts',
			);
			expect(result).toBe('../base');
		});

		it('should compute relative path from parent to subdirectory', () => {
			const result = manager.computeRelativePath(
				'./src/base.ts',
				'./src/models/user.ts',
			);
			expect(result).toBe('models/user');
		});

		it('should compute relative path between different subdirectories', () => {
			const result = manager.computeRelativePath(
				'./src/api/routes.ts',
				'./src/models/user.ts',
			);
			expect(result).toBe('../models/user');
		});

		it('should handle paths with dots correctly', () => {
			const result = manager.computeRelativePath(
				'./src/user.ts',
				'./src/post.ts',
			);
			expect(result).toBe('post');
		});

		it('should strip file extension from target', () => {
			const result = manager.computeRelativePath(
				'./src/user.ts',
				'./src/post.ts',
			);
			expect(result).not.toContain('.ts');
		});
	});

	describe('clear', () => {
		it('should clear all imports', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});
			manager.addImport({
				modulePath: './post.js',
				importName: 'PostSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			expect(manager.getImports()).toHaveLength(2);

			manager.clear();

			expect(manager.getImports()).toHaveLength(0);
		});
	});

	describe('hasImport', () => {
		it('should return true if import exists', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			expect(manager.hasImport('./user.js', 'UserSchema')).toBe(true);
		});

		it('should return false if import does not exist', () => {
			expect(manager.hasImport('./user.js', 'UserSchema')).toBe(false);
		});

		it('should distinguish between different import names from same module', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			expect(manager.hasImport('./user.js', 'UserSchema')).toBe(true);
			expect(manager.hasImport('./user.js', 'AdminSchema')).toBe(false);
		});
	});

	describe('removeImport', () => {
		it('should remove an import', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			expect(manager.getImports()).toHaveLength(1);

			const removed = manager.removeImport('./user.js', 'UserSchema');

			expect(removed).toBe(true);
			expect(manager.getImports()).toHaveLength(0);
		});

		it('should return false when removing non-existent import', () => {
			const removed = manager.removeImport('./user.js', 'UserSchema');
			expect(removed).toBe(false);
		});

		it('should only remove specified import, not others from same module', () => {
			manager.addImport({
				modulePath: './user.js',
				importName: 'UserSchema',
				importKind: 'named',
				isTypeOnly: false,
			});
			manager.addImport({
				modulePath: './user.js',
				importName: 'AdminSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			manager.removeImport('./user.js', 'UserSchema');

			expect(manager.getImports()).toHaveLength(1);
			expect(manager.hasImport('./user.js', 'AdminSchema')).toBe(true);
		});
	});

	describe('edge cases', () => {
		it('should handle empty imports list', () => {
			expect(manager.getImports()).toHaveLength(0);
			expect(manager.getImportStatements()).toHaveLength(0);
		});

		it('should handle imports with special characters in module paths', () => {
			manager.addImport({
				modulePath: './user-profile.js',
				importName: 'UserProfileSchema',
				importKind: 'named',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements[0]).toContain('./user-profile.js');
		});

		it('should handle imports with numbers in names', () => {
			manager.addImport({
				modulePath: './v1.js',
				importName: 'V1Schema',
				importKind: 'named',
				isTypeOnly: false,
			});

			const statements = manager.getImportStatements();
			expect(statements[0]).toContain('V1Schema');
		});
	});
});
