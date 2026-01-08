import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultRefResolver } from '../../src/MultiSchema/RefResolver.js';
import { SchemaRegistry } from '../../src/MultiSchema/SchemaRegistry.js';
import type { SchemaEntry } from '../../src/MultiSchema/types.js';

describe('RefResolver - Default Implementation', () => {
	let resolver: DefaultRefResolver;
	let registry: SchemaRegistry;

	beforeEach(() => {
		registry = new SchemaRegistry();
		resolver = new DefaultRefResolver(registry);

		// Register some test schemas
		const userSchema: SchemaEntry = {
			id: 'user',
			schema: { type: 'object' },
			builder: null,
			sourceFile: null,
			exportName: 'User',
			metadata: {},
		};

		const postSchema: SchemaEntry = {
			id: 'post',
			schema: { type: 'object' },
			builder: null,
			sourceFile: null,
			exportName: 'Post',
			metadata: {},
		};

		const profileSchema: SchemaEntry = {
			id: 'schemas/profile',
			schema: { type: 'object' },
			builder: null,
			sourceFile: null,
			exportName: 'Profile',
			metadata: {},
		};

		registry.addEntry(userSchema);
		registry.addEntry(postSchema);
		registry.addEntry(profileSchema);
	});

	describe('resolve - internal references', () => {
		it('should resolve simple internal reference', () => {
			const resolution = resolver.resolve('#/properties/name', 'user');
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('user');
			expect(resolution?.definitionPath).toEqual(['properties', 'name']);
			expect(resolution?.isExternal).toBe(false);
		});

		it('should resolve nested internal reference', () => {
			const resolution = resolver.resolve(
				'#/definitions/Address/properties/street',
				'user',
			);
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('user');
			expect(resolution?.definitionPath).toEqual([
				'definitions',
				'Address',
				'properties',
				'street',
			]);
			expect(resolution?.isExternal).toBe(false);
		});

		it('should resolve root reference', () => {
			const resolution = resolver.resolve('#/', 'user');
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('user');
			expect(resolution?.definitionPath).toEqual([]);
			expect(resolution?.isExternal).toBe(false);
		});

		it('should handle internal reference with no path', () => {
			const resolution = resolver.resolve('#', 'user');
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('user');
		});
	});

	describe('resolve - external references by schema ID', () => {
		it('should resolve direct schema ID reference', () => {
			const resolution = resolver.resolve('user#/properties/id', 'post');
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('user');
			expect(resolution?.definitionPath).toEqual(['properties', 'id']);
			expect(resolution?.isExternal).toBe(true);
			expect(resolution?.importInfo).toBeDefined();
		});

		it('should resolve schema ID reference with empty path', () => {
			const resolution = resolver.resolve('post#/', 'user');
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('post');
			expect(resolution?.definitionPath).toEqual([]);
			expect(resolution?.isExternal).toBe(true);
		});

		it('should resolve nested schema ID reference', () => {
			const resolution = resolver.resolve(
				'schemas/profile#/definitions/Contact',
				'user',
			);
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('schemas/profile');
			expect(resolution?.definitionPath).toEqual(['definitions', 'Contact']);
			expect(resolution?.isExternal).toBe(true);
		});
	});

	describe('resolve - file path references', () => {
		it('should resolve relative file path reference', () => {
			const resolution = resolver.resolve(
				'./post.json#/properties/title',
				'user',
			);
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('post');
			expect(resolution?.definitionPath).toEqual(['properties', 'title']);
		});

		it('should resolve file path without extension', () => {
			const resolution = resolver.resolve('./user#/properties/name', 'post');
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('user');
		});

		it('should handle case-insensitive file matching', () => {
			const resolution = resolver.resolve('./POST.JSON#/', 'user');
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('post');
		});

		it('should resolve nested file path', () => {
			const resolution = resolver.resolve(
				'schemas/profile.json#/definitions/Address',
				'user',
			);
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('schemas/profile');
		});
	});

	describe('resolve - unresolvable references', () => {
		it('should return null for missing schema ID', () => {
			const resolution = resolver.resolve('nonexistent#/properties/id', 'user');
			expect(resolution).toBeNull();
		});

		it('should return null for missing file path', () => {
			const resolution = resolver.resolve(
				'./missing.json#/properties/id',
				'user',
			);
			expect(resolution).toBeNull();
		});

		it('should return null for completely invalid reference', () => {
			const resolution = resolver.resolve('this is not a reference', 'user');
			expect(resolution).toBeNull();
		});
	});

	describe('import info generation', () => {
		it('should create named import info', () => {
			const resolution = resolver.resolve('user#/', 'post');
			expect(resolution?.importInfo?.importKind).toBe('named');
			expect(resolution?.importInfo?.isTypeOnly).toBe(false);
		});

		it('should derive import name from schema ID', () => {
			const resolution = resolver.resolve('user#/', 'post');
			expect(resolution?.importInfo?.importName).toBe('User');
		});

		it('should handle schema IDs with multiple segments', () => {
			const resolution = resolver.resolve('schemas/profile#/', 'user');
			expect(resolution?.importInfo?.importName).toBe('Profile');
		});

		it('should generate relative module path for same directory', () => {
			const resolution = resolver.resolve('post#/', 'user');
			expect(resolution?.importInfo?.modulePath).toMatch(/^\.\/post/);
		});

		it('should generate module path for nested schemas', () => {
			const resolution = resolver.resolve('schemas/profile#/', 'user');
			expect(resolution?.importInfo?.modulePath).toContain('profile');
		});
	});

	describe('custom import path transformer', () => {
		it('should apply custom path transformer', () => {
			const customResolver = new DefaultRefResolver(
				registry,
				(_from: string, to: string) => `./generated/${to}`,
			);

			const resolution = customResolver.resolve('user#/', 'post');
			expect(resolution?.importInfo?.modulePath).toContain('./generated/');
		});

		it('should preserve import name when using transformer', () => {
			const customResolver = new DefaultRefResolver(
				registry,
				(_from: string, to: string) => `@/models/${to}`,
			);

			const resolution = customResolver.resolve('user#/', 'post');
			expect(resolution?.importInfo?.importName).toBe('User');
		});
	});

	describe('supportsExternalRefs', () => {
		it('should indicate support for external refs', () => {
			expect(resolver.supportsExternalRefs()).toBe(true);
		});
	});

	describe('edge cases', () => {
		it('should handle reference with trailing slash', () => {
			const resolution = resolver.resolve('#/properties/', 'user');
			expect(resolution).not.toBeNull();
			expect(resolution?.definitionPath).toEqual(['properties']);
		});

		it('should handle schema ID as bare reference', () => {
			const resolution = resolver.resolve('user', 'post');
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('user');
			expect(resolution?.isExternal).toBe(true);
		});

		it('should preserve path segments with dots', () => {
			const resolution = resolver.resolve('#/definitions/User.Profile', 'user');
			expect(resolution?.definitionPath).toContain('User.Profile');
		});

		it('should handle empty path segments gracefully', () => {
			const resolution = resolver.resolve('#/properties//name', 'user');
			// Empty segment should be filtered out
			expect(resolution?.definitionPath).not.toContain('');
		});
	});

	describe('integration scenarios', () => {
		it('should resolve complex OpenAPI-style reference', () => {
			const resolution = resolver.resolve(
				'user#/definitions/Address/properties/city',
				'post',
			);
			expect(resolution).not.toBeNull();
			expect(resolution?.targetSchemaId).toBe('user');
			expect(resolution?.definitionPath).toContain('Address');
			expect(resolution?.definitionPath).toContain('city');
		});

		it('should handle mixed file path and schema ID registrations', () => {
			const fileBasedResolution = resolver.resolve('./user.json#/', 'post');
			const idBasedResolution = resolver.resolve('user#/', 'post');

			expect(fileBasedResolution?.targetSchemaId).toBe(
				idBasedResolution?.targetSchemaId,
			);
		});
	});
});
