import type { IBuilderRegistry } from './types.js';
import type { Builder } from '../Builder/index.js';

/**
 * BuilderRegistry caches Builder instances by schema ID and export name.
 * Used to avoid duplication of builder code across multiple references to the same schema.
 */
export class BuilderRegistry implements IBuilderRegistry {
	private cache = new Map<string, Builder>();

	/**
	 * Generate a cache key from schema ID and export name.
	 */
	private getCacheKey(schemaId: string, exportName: string): string {
		return `${schemaId}::${exportName}`;
	}

	/**
	 * Register a builder in the cache.
	 */
	register(schemaId: string, exportName: string, builder: Builder): void {
		const key = this.getCacheKey(schemaId, exportName);
		this.cache.set(key, builder);
	}

	/**
	 * Get a builder from the cache.
	 * Returns undefined if not found.
	 */
	get(schemaId: string, exportName: string): Builder | undefined {
		const key = this.getCacheKey(schemaId, exportName);
		return this.cache.get(key);
	}

	/**
	 * Check if a builder exists in the cache.
	 */
	has(schemaId: string, exportName: string): boolean {
		const key = this.getCacheKey(schemaId, exportName);
		return this.cache.has(key);
	}

	/**
	 * Get all builder entries for a specific schema.
	 */
	getKeysForSchema(schemaId: string): Array<[string, Builder]> {
		const prefix = `${schemaId}::`;
		const results: Array<[string, Builder]> = [];

		for (const [key, builder] of this.cache) {
			if (key.startsWith(prefix)) {
				// Extract export name from cache key
				const exportName = key.substring(prefix.length);
				results.push([exportName, builder]);
			}
		}

		return results;
	}

	/**
	 * Get the number of cached builders.
	 */
	size(): number {
		return this.cache.size;
	}

	/**
	 * Clear all entries from the cache.
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get all cache keys for debugging purposes.
	 */
	getAllKeys(): string[] {
		return Array.from(this.cache.keys());
	}

	/**
	 * Remove a specific entry from the cache.
	 */
	remove(schemaId: string, exportName: string): boolean {
		const key = this.getCacheKey(schemaId, exportName);
		return this.cache.delete(key);
	}
}
