import { describe, it, expect } from 'vitest';
import { DefaultNameResolver } from '../../src/SchemaProject/NameResolver.js';

describe('NameResolver - Default Implementation', () => {
	describe('resolveExportName', () => {
		it('should convert schemaId to PascalCase by default', () => {
			const resolver = new DefaultNameResolver();
			expect(resolver.resolveExportName('user')).toBe('User');
			expect(resolver.resolveExportName('User')).toBe('User');
			expect(resolver.resolveExportName('user-profile')).toBe('UserProfile');
			expect(resolver.resolveExportName('user_profile')).toBe('UserProfile');
		});

		it('should use last path segment for nested IDs', () => {
			const resolver = new DefaultNameResolver();
			expect(resolver.resolveExportName('schemas/user')).toBe('User');
			expect(resolver.resolveExportName('api/v1/models/post')).toBe('Post');
			expect(resolver.resolveExportName('a/b/c/test-schema')).toBe(
				'TestSchema',
			);
		});

		it('should handle filename strategy', () => {
			const resolver = new DefaultNameResolver('filename');
			expect(resolver.resolveExportName('user.json')).toBe('User');
			expect(resolver.resolveExportName('user-profile.schema.json')).toBe(
				'UserProfile',
			);
			expect(resolver.resolveExportName('schemas/post.json')).toBe('Post');
		});

		it('should apply custom transform function', () => {
			const resolver = new DefaultNameResolver(
				'custom',
				(id: string) => `${id.charAt(0).toUpperCase() + id.slice(1)}Type`,
			);
			expect(resolver.resolveExportName('user')).toBe('UserType');
			expect(resolver.resolveExportName('post')).toBe('PostType');
		});

		it('should avoid reserved keywords', () => {
			const resolver = new DefaultNameResolver();
			const reserved = ['const', 'class', 'function', 'if', 'return'];
			for (const keyword of reserved) {
				const name = resolver.resolveExportName(keyword);
				expect(name).not.toBe(keyword);
				expect(name.length).toBeGreaterThan(keyword.length);
			}
		});

		it('should sanitize invalid identifiers', () => {
			const resolver = new DefaultNameResolver();
			expect(resolver.resolveExportName('123test')).toMatch(/^[a-zA-Z_$]/);
			expect(resolver.resolveExportName('test-@#$-name')).toMatch(
				/^[a-zA-Z_$][a-zA-Z0-9_$]*$/,
			);
			expect(resolver.resolveExportName('api user.schema@id')).toBe(
				'ApiUserSchemaid',
			);
		});

		it('should handle empty or invalid input', () => {
			const resolver = new DefaultNameResolver();
			const result = resolver.resolveExportName('');
			expect(result).toMatch(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/);
			expect(result).toBeTruthy();
		});
	});

	describe('validateExportName', () => {
		it('should accept valid identifiers', () => {
			const resolver = new DefaultNameResolver();
			expect(resolver.validateExportName('User')).toBe(true);
			expect(resolver.validateExportName('_user')).toBe(true);
			expect(resolver.validateExportName('$user')).toBe(true);
			expect(resolver.validateExportName('user123')).toBe(true);
		});

		it('should reject invalid identifiers', () => {
			const resolver = new DefaultNameResolver();
			expect(resolver.validateExportName('123user')).toBe(false);
			expect(resolver.validateExportName('user-profile')).toBe(false);
			expect(resolver.validateExportName('user profile')).toBe(false);
			expect(resolver.validateExportName('user@profile')).toBe(false);
		});

		it('should reject reserved keywords', () => {
			const resolver = new DefaultNameResolver();
			expect(resolver.validateExportName('const')).toBe(false);
			expect(resolver.validateExportName('class')).toBe(false);
			expect(resolver.validateExportName('function')).toBe(false);
			expect(resolver.validateExportName('return')).toBe(false);
		});
	});

	describe('detectConflicts', () => {
		it('should detect no conflicts for unique export names', () => {
			const resolver = new DefaultNameResolver();
			const names = new Map([
				['schemas/user', 'User'],
				['schemas/post', 'Post'],
				['schemas/comment', 'Comment'],
			]);
			const report = resolver.detectConflicts(names);
			expect(report.hasConflicts).toBe(false);
			expect(report.conflicts).toHaveLength(0);
		});

		it('should detect conflicts for duplicate export names', () => {
			const resolver = new DefaultNameResolver();
			const names = new Map([
				['schemas/user', 'User'],
				['models/user', 'User'],
			]);
			const report = resolver.detectConflicts(names);
			expect(report.hasConflicts).toBe(true);
			expect(report.conflicts).toHaveLength(1);
			expect(report.conflicts[0].exportName).toBe('User');
			expect(report.conflicts[0].affectedSchemaIds).toContain('schemas/user');
			expect(report.conflicts[0].affectedSchemaIds).toContain('models/user');
		});

		it('should report multiple conflicts correctly', () => {
			const resolver = new DefaultNameResolver();
			const names = new Map([
				['api/user', 'User'],
				['models/user', 'User'],
				['v1/post', 'Post'],
				['v2/post', 'Post'],
				['schemas/comment', 'Comment'],
			]);
			const report = resolver.detectConflicts(names);
			expect(report.hasConflicts).toBe(true);
			expect(report.conflicts).toHaveLength(2);

			const conflictNames = report.conflicts.map((c: any) => c.exportName);
			expect(conflictNames).toContain('User');
			expect(conflictNames).toContain('Post');
		});

		it('should handle many schemas with same conflict name', () => {
			const resolver = new DefaultNameResolver();
			const names = new Map([
				['path1/user', 'User'],
				['path2/user', 'User'],
				['path3/user', 'User'],
			]);
			const report = resolver.detectConflicts(names);
			expect(report.hasConflicts).toBe(true);
			expect(report.conflicts[0].affectedSchemaIds).toHaveLength(3);
		});

		it('should handle empty name map', () => {
			const resolver = new DefaultNameResolver();
			const report = resolver.detectConflicts(new Map());
			expect(report.hasConflicts).toBe(false);
			expect(report.conflicts).toHaveLength(0);
		});
	});

	describe('edge cases', () => {
		it('should handle kebab-case correctly', () => {
			const resolver = new DefaultNameResolver();
			expect(resolver.resolveExportName('user-account-settings')).toBe(
				'UserAccountSettings',
			);
			expect(resolver.resolveExportName('api-v1-user-schema')).toBe(
				'ApiV1UserSchema',
			);
		});

		it('should handle snake_case correctly', () => {
			const resolver = new DefaultNameResolver();
			expect(resolver.resolveExportName('user_account_settings')).toBe(
				'UserAccountSettings',
			);
			expect(resolver.resolveExportName('api_v1_user_schema')).toBe(
				'ApiV1UserSchema',
			);
		});

		it('should handle mixed separators', () => {
			const resolver = new DefaultNameResolver();
			expect(resolver.resolveExportName('user-account_settings')).toBe(
				'UserAccountSettings',
			);
			expect(resolver.resolveExportName('api.v1.user-schema')).toBe(
				'ApiV1UserSchema',
			);
		});

		it('should handle all caps words', () => {
			const resolver = new DefaultNameResolver();
			expect(resolver.resolveExportName('URL')).toBe('Url');
			expect(resolver.resolveExportName('api-url')).toBe('ApiUrl');
		});

		it('should be deterministic across calls', () => {
			const resolver = new DefaultNameResolver();
			const id = 'user-account-settings';
			const result1 = resolver.resolveExportName(id);
			const result2 = resolver.resolveExportName(id);
			expect(result1).toBe(result2);
		});
	});
});
