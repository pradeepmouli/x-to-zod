import type { SchemaEntry, ISchemaRegistry } from './types.js';

/**
 * SchemaRegistry manages the mapping of schema IDs to SchemaEntry instances.
 * It handles registration, lookup, and conflict detection for schema management.
 */
export class SchemaRegistry implements ISchemaRegistry {
	private entries = new Map<string, SchemaEntry>();

	/**
	 * Add a schema entry to the registry.
	 * @throws Error if a schema with the same ID already exists
	 */
	addEntry(entry: SchemaEntry): void {
		if (this.entries.has(entry.id)) {
			throw new Error(
				`Schema with ID "${entry.id}" already exists in registry`,
			);
		}
		this.entries.set(entry.id, entry);
	}

	/**
	 * Get a schema entry by ID.
	 * @returns The SchemaEntry or undefined if not found
	 */
	getEntry(schemaId: string): SchemaEntry | undefined {
		return this.entries.get(schemaId);
	}

	/**
	 * Get all schema entries in the registry.
	 */
	getAllEntries(): SchemaEntry[] {
		return Array.from(this.entries.values());
	}

	/**
	 * Check if a schema exists in the registry.
	 */
	hasEntry(schemaId: string): boolean {
		return this.entries.has(schemaId);
	}

	/**
	 * Remove a schema entry from the registry.
	 * @returns true if the entry was removed, false if not found
	 */
	removeEntry(schemaId: string): boolean {
		return this.entries.delete(schemaId);
	}

	/**
	 * Clear all entries from the registry.
	 */
	clear(): void {
		this.entries.clear();
	}

	/**
	 * Get the number of entries in the registry.
	 */
	size(): number {
		return this.entries.size;
	}

	/**
	 * Get all schema IDs in the registry.
	 */
	getAllIds(): string[] {
		return Array.from(this.entries.keys());
	}

	/**
	 * Update an existing entry.
	 * @throws Error if the schema does not exist
	 */
	updateEntry(schemaId: string, entry: Partial<SchemaEntry>): void {
		const existing = this.entries.get(schemaId);
		if (!existing) {
			throw new Error(`Schema with ID "${schemaId}" not found in registry`);
		}
		const updated = { ...existing, ...entry, id: schemaId };
		this.entries.set(schemaId, updated as SchemaEntry);
	}
}
