import { describe, it, expect, beforeEach } from 'vitest';
import { SchemaRegistry } from '../../src/MultiSchema/SchemaRegistry.js';
import type { SchemaEntry } from '../../src/MultiSchema/types.js';

describe('SchemaRegistry', () => {
	let registry: SchemaRegistry;
	let testEntry: SchemaEntry;

	beforeEach(() => {
		registry = new SchemaRegistry();
		testEntry = {
			id: 'user',
			schema: { type: 'object', properties: { name: { type: 'string' } } },
			builder: null,
			sourceFile: null,
			exportName: 'User',
			metadata: {},
		};
	});

	describe('addEntry', () => {
		it('should add a new entry to the registry', () => {
			registry.addEntry(testEntry);
			expect(registry.hasEntry('user')).toBe(true);
		});

		it('should throw error when adding duplicate ID', () => {
			registry.addEntry(testEntry);
			expect(() => registry.addEntry(testEntry)).toThrow(
				'already exists in registry',
			);
		});

		it('should allow adding multiple entries with different IDs', () => {
			registry.addEntry(testEntry);
			const postEntry: SchemaEntry = {
				...testEntry,
				id: 'post',
				exportName: 'Post',
			};
			registry.addEntry(postEntry);
			expect(registry.size()).toBe(2);
		});
	});

	describe('getEntry', () => {
		it('should return undefined for non-existent entries', () => {
			expect(registry.getEntry('nonexistent')).toBeUndefined();
		});

		it('should retrieve a stored entry by ID', () => {
			registry.addEntry(testEntry);
			const retrieved = registry.getEntry('user');
			expect(retrieved).toEqual(testEntry);
			expect(retrieved?.exportName).toBe('User');
		});

		it('should retrieve correct entry among multiple', () => {
			const entry1: SchemaEntry = {
				...testEntry,
				id: 'user',
				exportName: 'User',
			};
			const entry2: SchemaEntry = {
				...testEntry,
				id: 'post',
				exportName: 'Post',
			};
			registry.addEntry(entry1);
			registry.addEntry(entry2);

			expect(registry.getEntry('user')?.exportName).toBe('User');
			expect(registry.getEntry('post')?.exportName).toBe('Post');
		});
	});

	describe('getAllEntries', () => {
		it('should return empty array for empty registry', () => {
			expect(registry.getAllEntries()).toEqual([]);
		});

		it('should return all entries', () => {
			const entry1: SchemaEntry = {
				...testEntry,
				id: 'user',
				exportName: 'User',
			};
			const entry2: SchemaEntry = {
				...testEntry,
				id: 'post',
				exportName: 'Post',
			};
			registry.addEntry(entry1);
			registry.addEntry(entry2);

			const all = registry.getAllEntries();
			expect(all).toHaveLength(2);
			expect(all.map((e) => e.id)).toContain('user');
			expect(all.map((e) => e.id)).toContain('post');
		});
	});

	describe('hasEntry', () => {
		it('should return false for empty registry', () => {
			expect(registry.hasEntry('user')).toBe(false);
		});

		it('should return true for existing entry', () => {
			registry.addEntry(testEntry);
			expect(registry.hasEntry('user')).toBe(true);
		});

		it('should return false for non-existent entry', () => {
			registry.addEntry(testEntry);
			expect(registry.hasEntry('nonexistent')).toBe(false);
		});
	});

	describe('removeEntry', () => {
		it('should return false when removing non-existent entry', () => {
			expect(registry.removeEntry('nonexistent')).toBe(false);
		});

		it('should return true when removing existing entry', () => {
			registry.addEntry(testEntry);
			expect(registry.removeEntry('user')).toBe(true);
			expect(registry.hasEntry('user')).toBe(false);
		});

		it('should not affect other entries when removing one', () => {
			const entry1: SchemaEntry = {
				...testEntry,
				id: 'user',
				exportName: 'User',
			};
			const entry2: SchemaEntry = {
				...testEntry,
				id: 'post',
				exportName: 'Post',
			};
			registry.addEntry(entry1);
			registry.addEntry(entry2);

			registry.removeEntry('user');
			expect(registry.hasEntry('user')).toBe(false);
			expect(registry.hasEntry('post')).toBe(true);
		});
	});

	describe('clear', () => {
		it('should remove all entries', () => {
			const entry1: SchemaEntry = {
				...testEntry,
				id: 'user',
				exportName: 'User',
			};
			const entry2: SchemaEntry = {
				...testEntry,
				id: 'post',
				exportName: 'Post',
			};
			registry.addEntry(entry1);
			registry.addEntry(entry2);

			registry.clear();
			expect(registry.size()).toBe(0);
			expect(registry.getAllEntries()).toHaveLength(0);
		});
	});

	describe('size', () => {
		it('should return 0 for empty registry', () => {
			expect(registry.size()).toBe(0);
		});

		it('should return correct count after additions', () => {
			registry.addEntry(testEntry);
			expect(registry.size()).toBe(1);

			const entry2: SchemaEntry = {
				...testEntry,
				id: 'post',
				exportName: 'Post',
			};
			registry.addEntry(entry2);
			expect(registry.size()).toBe(2);
		});

		it('should decrease after removals', () => {
			registry.addEntry(testEntry);
			registry.addEntry({ ...testEntry, id: 'post', exportName: 'Post' });

			registry.removeEntry('user');
			expect(registry.size()).toBe(1);
		});
	});

	describe('getAllIds', () => {
		it('should return empty array for empty registry', () => {
			expect(registry.getAllIds()).toEqual([]);
		});

		it('should return all schema IDs', () => {
			registry.addEntry(testEntry);
			registry.addEntry({ ...testEntry, id: 'post', exportName: 'Post' });
			registry.addEntry({ ...testEntry, id: 'comment', exportName: 'Comment' });

			const ids = registry.getAllIds();
			expect(ids).toHaveLength(3);
			expect(ids).toContain('user');
			expect(ids).toContain('post');
			expect(ids).toContain('comment');
		});
	});

	describe('updateEntry', () => {
		it('should throw error when updating non-existent entry', () => {
			expect(() =>
				registry.updateEntry('nonexistent', { exportName: 'New' }),
			).toThrow('not found in registry');
		});

		it('should update partial fields', () => {
			registry.addEntry(testEntry);
			registry.updateEntry('user', { exportName: 'UpdatedUser' });

			const updated = registry.getEntry('user');
			expect(updated?.exportName).toBe('UpdatedUser');
			expect(updated?.id).toBe('user'); // id should not change
		});

		it('should preserve other fields when updating', () => {
			registry.addEntry(testEntry);
			const metadata = { custom: true };
			registry.updateEntry('user', { metadata });

			const updated = registry.getEntry('user');
			expect(updated?.metadata).toEqual(metadata);
			expect(updated?.exportName).toBe('User'); // original export name preserved
		});
	});

	describe('integration', () => {
		it('should handle complex workflow', () => {
			// Add entries
			const userEntry: SchemaEntry = {
				...testEntry,
				id: 'user',
				exportName: 'User',
			};
			const postEntry: SchemaEntry = {
				...testEntry,
				id: 'post',
				exportName: 'Post',
			};
			const commentEntry: SchemaEntry = {
				...testEntry,
				id: 'comment',
				exportName: 'Comment',
			};

			registry.addEntry(userEntry);
			registry.addEntry(postEntry);
			registry.addEntry(commentEntry);

			expect(registry.size()).toBe(3);

			// Update one entry
			registry.updateEntry('post', { exportName: 'BlogPost' });
			expect(registry.getEntry('post')?.exportName).toBe('BlogPost');

			// Remove one entry
			registry.removeEntry('comment');
			expect(registry.size()).toBe(2);
			expect(registry.getAllIds()).toEqual(['user', 'post']);

			// Clear remaining
			registry.clear();
			expect(registry.size()).toBe(0);
		});
	});
});
