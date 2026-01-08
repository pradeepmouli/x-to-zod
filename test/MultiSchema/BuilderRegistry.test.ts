import { describe, it, expect, beforeEach } from 'vitest';
import { BuilderRegistry } from '../../src/MultiSchema/BuilderRegistry.js';
import { StringBuilder } from '../../src/ZodBuilder/string.js';

describe('BuilderRegistry', () => {
  let registry: BuilderRegistry;

  beforeEach(() => {
    registry = new BuilderRegistry();
  });

  describe('register and get', () => {
    it('should register and retrieve a builder', () => {
      const builder = new StringBuilder();
      registry.register('user', 'User', builder);

      const retrieved = registry.get('user', 'User');
      expect(retrieved).toBe(builder);
    });

    it('should return undefined for unregistered builder', () => {
      const retrieved = registry.get('user', 'User');
      expect(retrieved).toBeUndefined();
    });

    it('should allow multiple builders for same schema with different export names', () => {
      const builder1 = new StringBuilder();
      const builder2 = new StringBuilder();

      registry.register('user', 'User', builder1);
      registry.register('user', 'AdminUser', builder2);

      expect(registry.get('user', 'User')).toBe(builder1);
      expect(registry.get('user', 'AdminUser')).toBe(builder2);
    });

    it('should allow same export name for different schemas', () => {
      const builder1 = new StringBuilder();
      const builder2 = new StringBuilder();

      registry.register('user', 'Schema', builder1);
      registry.register('post', 'Schema', builder2);

      expect(registry.get('user', 'Schema')).toBe(builder1);
      expect(registry.get('post', 'Schema')).toBe(builder2);
    });

    it('should overwrite existing entry with same key', () => {
      const builder1 = new StringBuilder();
      const builder2 = new StringBuilder();

      registry.register('user', 'User', builder1);
      registry.register('user', 'User', builder2);

      expect(registry.get('user', 'User')).toBe(builder2);
    });
  });

  describe('has', () => {
    it('should return false for unregistered entry', () => {
      expect(registry.has('user', 'User')).toBe(false);
    });

    it('should return true for registered entry', () => {
      const builder = new StringBuilder();
      registry.register('user', 'User', builder);

      expect(registry.has('user', 'User')).toBe(true);
    });

    it('should distinguish between different keys', () => {
      const builder = new StringBuilder();
      registry.register('user', 'User', builder);

      expect(registry.has('user', 'User')).toBe(true);
      expect(registry.has('user', 'AdminUser')).toBe(false);
      expect(registry.has('post', 'User')).toBe(false);
    });
  });

  describe('getKeysForSchema', () => {
    it('should return empty array for schema with no builders', () => {
      const keys = registry.getKeysForSchema('user');
      expect(keys).toEqual([]);
    });

    it('should return all builders for a schema', () => {
      const builder1 = new StringBuilder();
      const builder2 = new StringBuilder();
      const builder3 = new StringBuilder();

      registry.register('user', 'User', builder1);
      registry.register('user', 'AdminUser', builder2);
      registry.register('post', 'Post', builder3);

      const userKeys = registry.getKeysForSchema('user');
      expect(userKeys).toHaveLength(2);
      expect(userKeys.map(([name]) => name)).toContain('User');
      expect(userKeys.map(([name]) => name)).toContain('AdminUser');
    });

    it('should not return builders from other schemas', () => {
      const builder1 = new StringBuilder();
      const builder2 = new StringBuilder();

      registry.register('user', 'User', builder1);
      registry.register('post', 'Post', builder2);

      const userKeys = registry.getKeysForSchema('user');
      expect(userKeys).toHaveLength(1);
      expect(userKeys[0][0]).toBe('User');
    });

    it('should return builders with correct builder instance', () => {
      const builder = new StringBuilder();
      registry.register('user', 'User', builder);

      const keys = registry.getKeysForSchema('user');
      expect(keys[0][1]).toBe(builder);
    });

    it('should handle schema IDs with slashes', () => {
      const builder1 = new StringBuilder();
      const builder2 = new StringBuilder();

      registry.register('schemas/user', 'User', builder1);
      registry.register('schemas/post', 'Post', builder2);

      const userKeys = registry.getKeysForSchema('schemas/user');
      expect(userKeys).toHaveLength(1);
      expect(userKeys[0][0]).toBe('User');
    });
  });

  describe('size', () => {
    it('should return 0 for empty registry', () => {
      expect(registry.size()).toBe(0);
    });

    it('should return correct count', () => {
      registry.register('user', 'User', new StringBuilder());
      expect(registry.size()).toBe(1);

      registry.register('user', 'AdminUser', new StringBuilder());
      expect(registry.size()).toBe(2);

      registry.register('post', 'Post', new StringBuilder());
      expect(registry.size()).toBe(3);
    });

    it('should update size after removal', () => {
      registry.register('user', 'User', new StringBuilder());
      registry.register('post', 'Post', new StringBuilder());

      expect(registry.size()).toBe(2);

      registry.remove('user', 'User');
      expect(registry.size()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      registry.register('user', 'User', new StringBuilder());
      registry.register('post', 'Post', new StringBuilder());

      registry.clear();

      expect(registry.size()).toBe(0);
      expect(registry.get('user', 'User')).toBeUndefined();
      expect(registry.get('post', 'Post')).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should return false when removing non-existent entry', () => {
      const result = registry.remove('user', 'User');
      expect(result).toBe(false);
    });

    it('should return true when removing existing entry', () => {
      registry.register('user', 'User', new StringBuilder());
      const result = registry.remove('user', 'User');
      expect(result).toBe(true);
    });

    it('should actually remove the entry', () => {
      registry.register('user', 'User', new StringBuilder());
      registry.remove('user', 'User');

      expect(registry.get('user', 'User')).toBeUndefined();
      expect(registry.has('user', 'User')).toBe(false);
    });

    it('should not affect other entries', () => {
      registry.register('user', 'User', new StringBuilder());
      registry.register('user', 'AdminUser', new StringBuilder());

      registry.remove('user', 'User');

      expect(registry.get('user', 'AdminUser')).toBeDefined();
    });
  });

  describe('getAllKeys', () => {
    it('should return empty array for empty registry', () => {
      expect(registry.getAllKeys()).toEqual([]);
    });

    it('should return all cache keys', () => {
      registry.register('user', 'User', new StringBuilder());
      registry.register('post', 'Post', new StringBuilder());

      const keys = registry.getAllKeys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain('user::User');
      expect(keys).toContain('post::Post');
    });
  });

  describe('cache key format', () => {
    it('should use schemaId::exportName format', () => {
      registry.register('schemas/user', 'UserSchema', new StringBuilder());

      const keys = registry.getAllKeys();
      expect(keys[0]).toBe('schemas/user::UserSchema');
    });

    it('should handle complex schema IDs', () => {
      registry.register('api/v1/schemas/user.schema', 'User', new StringBuilder());

      const keys = registry.getAllKeys();
      expect(keys[0]).toContain('api/v1/schemas/user.schema');
      expect(keys[0]).toContain('User');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex workflow', () => {
      // Register multiple builders
      const userBuilder = new StringBuilder();
      const adminUserBuilder = new StringBuilder();
      const postBuilder = new StringBuilder();

      registry.register('user', 'User', userBuilder);
      registry.register('user', 'AdminUser', adminUserBuilder);
      registry.register('post', 'Post', postBuilder);

      expect(registry.size()).toBe(3);

      // Retrieve specific builders
      expect(registry.get('user', 'User')).toBe(userBuilder);
      expect(registry.get('user', 'AdminUser')).toBe(adminUserBuilder);
      expect(registry.get('post', 'Post')).toBe(postBuilder);

      // Get all for a schema
      const userBuilders = registry.getKeysForSchema('user');
      expect(userBuilders).toHaveLength(2);

      // Remove one
      registry.remove('user', 'AdminUser');
      expect(registry.size()).toBe(2);
      expect(registry.getKeysForSchema('user')).toHaveLength(1);

      // Clear all
      registry.clear();
      expect(registry.size()).toBe(0);
    });

    it('should maintain correct state with overlapping operations', () => {
      const builder1 = new StringBuilder();
      const builder2 = new StringBuilder();
      const builder3 = new StringBuilder();

      registry.register('schemas/user', 'User', builder1);
      expect(registry.size()).toBe(1);

      registry.register('schemas/user', 'AdminUser', builder2);
      registry.register('schemas/post', 'Post', builder3);
      expect(registry.size()).toBe(3);

      // Overwrite existing
      const newBuilder = new StringBuilder();
      registry.register('schemas/user', 'User', newBuilder);
      expect(registry.size()).toBe(3); // Size should not change
      expect(registry.get('schemas/user', 'User')).toBe(newBuilder);

      // Remove and verify
      registry.remove('schemas/user', 'User');
      expect(registry.getKeysForSchema('schemas/user')).toHaveLength(1);
    });
  });
});
