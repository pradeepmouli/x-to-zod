import type { ConflictReport, ConflictDetail } from './types.js';

/**
 * Default NameResolver implementation using schema ID-based naming strategy.
 * Converts schema IDs to valid JavaScript export names and detects conflicts.
 */
export class DefaultNameResolver {
	private strategy: 'schemaId' | 'filename' | 'custom';
	private customTransform?: (schemaId: string) => string;
	private reserved = new Set([
		'abstract',
		'arguments',
		'await',
		'boolean',
		'break',
		'byte',
		'case',
		'catch',
		'char',
		'class',
		'const',
		'continue',
		'debugger',
		'default',
		'delete',
		'do',
		'double',
		'else',
		'enum',
		'eval',
		'export',
		'extends',
		'false',
		'final',
		'finally',
		'float',
		'for',
		'function',
		'goto',
		'if',
		'implements',
		'import',
		'in',
		'instanceof',
		'int',
		'interface',
		'let',
		'long',
		'native',
		'new',
		'null',
		'package',
		'private',
		'protected',
		'public',
		'return',
		'short',
		'static',
		'super',
		'switch',
		'synchronized',
		'this',
		'throw',
		'throws',
		'transient',
		'true',
		'try',
		'typeof',
		'var',
		'void',
		'volatile',
		'while',
		'with',
		'yield',
	]);

	constructor(
		strategy: 'schemaId' | 'filename' | 'custom' = 'schemaId',
		customTransform?: (schemaId: string) => string,
	) {
		this.strategy = strategy;
		this.customTransform = customTransform;
	}

	/**
	 * Resolve a schema ID to a valid JavaScript export name.
	 * Applies the configured strategy to derive a valid identifier.
	 */
	resolveExportName(schemaId: string): string {
		let exportName = '';

		switch (this.strategy) {
			case 'custom':
				if (!this.customTransform) {
					throw new Error('Custom strategy requires customTransform function');
				}
				exportName = this.customTransform(schemaId);
				break;

			case 'filename':
				// Extract filename without extension and convert to PascalCase
				const filename = schemaId.split('/').pop() ?? schemaId;
				const withoutExt = filename.replace(/\.[^.]+$/, '');
				// Remove .schema suffix if present (common pattern)
				const cleanedName = withoutExt.replace(/\.schema$/i, '');
				exportName = this.toPascalCase(cleanedName);
				break;

			case 'schemaId':
			default:
				// Use last segment of ID path, convert to PascalCase
				const lastSegment = schemaId.split('/').pop() ?? schemaId;
				exportName = this.toPascalCase(lastSegment);
				break;
		}

		// For custom transform, skip further processing if already valid
		if (this.strategy === 'custom' && this.isValidIdentifier(exportName)) {
			return exportName;
		}

		// Ensure it's a valid JS identifier
		if (!this.isValidIdentifier(exportName)) {
			exportName = this.sanitizeIdentifier(exportName);
		}

		// Check for reserved keywords
		if (this.reserved.has(exportName.toLowerCase())) {
			exportName = `${exportName}Schema`;
		}

		return exportName;
	}

	/**
	 * Validate that a name is a valid JavaScript identifier.
	 */
	validateExportName(name: string): boolean {
		return (
			/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) &&
			!this.reserved.has(name.toLowerCase())
		);
	}

	/**
	 * Detect conflicts in export names across multiple schema IDs.
	 * Returns a report of any duplicate export names found.
	 */
	detectConflicts(nameMap: Map<string, string>): ConflictReport {
		const conflicts: ConflictDetail[] = [];
		const exportToSchemas = new Map<string, string[]>();

		// Group schemas by export name
		for (const [schemaId, exportName] of nameMap) {
			if (!exportToSchemas.has(exportName)) {
				exportToSchemas.set(exportName, []);
			}
			exportToSchemas.get(exportName)!.push(schemaId);
		}

		// Find conflicts (export names used by multiple schemas)
		for (const [exportName, schemaIds] of exportToSchemas) {
			if (schemaIds.length > 1) {
				conflicts.push({
					exportName,
					affectedSchemaIds: schemaIds,
				});
			}
		}

		return {
			hasConflicts: conflicts.length > 0,
			conflicts,
		};
	}

	/**
	 * Convert a string to PascalCase.
	 * Handles kebab-case, snake_case, and mixed separators.
	 */
	private toPascalCase(str: string): string {
		return str
			.replace(/[-_./]/g, ' ') // Replace separators with spaces
			.split(/\s+/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join('');
	}

	/**
	 * Check if a string is a valid JavaScript identifier.
	 */
	private isValidIdentifier(str: string): boolean {
		return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
	}

	/**
	 * Sanitize an identifier by removing invalid characters and prefixing if needed.
	 */
	private sanitizeIdentifier(str: string): string {
		// Remove invalid characters
		let sanitized = str.replace(/[^a-zA-Z0-9_$]/g, '');

		// Ensure it starts with valid character
		if (!sanitized || /^[0-9]/.test(sanitized)) {
			sanitized = `Schema${sanitized}`;
		}

		return sanitized || 'Schema';
	}
}
