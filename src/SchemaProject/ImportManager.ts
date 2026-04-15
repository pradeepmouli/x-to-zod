import type { ImportInfo } from './types.js';
import path from 'path';

/**
 * ImportManager: Manages imports for a source file.
 * Handles deduplication, relative path computation, and ESM/CJS syntax.
 */
export class ImportManager {
	private imports = new Map<string, ImportInfo>();
	private moduleFormat: 'esm' | 'cjs';

	constructor(moduleFormat: 'esm' | 'cjs' = 'esm') {
		this.moduleFormat = moduleFormat;
	}

	/**
	 * Add an import to the manager.
	 * Deduplicates based on modulePath and importName.
	 */
	addImport(importInfo: ImportInfo): void {
		const key = this.getImportKey(importInfo);
		if (!this.imports.has(key)) {
			this.imports.set(key, importInfo);
		}
	}

	/**
	 * Add multiple imports at once.
	 */
	addImports(importInfos: ImportInfo[]): void {
		for (const importInfo of importInfos) {
			this.addImport(importInfo);
		}
	}

	/**
	 * Get all imports.
	 */
	getImports(): ImportInfo[] {
		return Array.from(this.imports.values());
	}

	/**
	 * Get imports as formatted statements (ESM or CJS).
	 */
	getImportStatements(): string[] {
		const statements: string[] = [];

		if (this.moduleFormat === 'esm') {
			statements.push(...this.getESMStatements());
		} else {
			statements.push(...this.getCJSStatements());
		}

		return statements;
	}

	/**
	 * Group imports by module path.
	 */
	private groupByModule(): Map<string, ImportInfo[]> {
		const byModule = new Map<string, ImportInfo[]>();
		for (const importInfo of this.imports.values()) {
			if (!byModule.has(importInfo.modulePath)) {
				byModule.set(importInfo.modulePath, []);
			}
			byModule.get(importInfo.modulePath)!.push(importInfo);
		}
		return byModule;
	}

	/**
	 * Generate ESM import statements.
	 */
	private getESMStatements(): string[] {
		const statements: string[] = [];
		const byModule = this.groupByModule();

		// Generate statements
		for (const [modulePath, imports] of byModule) {
			const namedImports = imports.filter(
				(info) => info.importKind === 'named',
			);
			const defaultImport = imports.find(
				(info) => info.importKind === 'default',
			);
			const namespaceImport = imports.find(
				(info) => info.importKind === 'namespace',
			);
			const namedSpecifiers = namedImports.map((info) =>
				info.isTypeOnly ? `type ${info.importName}` : info.importName,
			);
			const typeOnlyNames = namedImports
				.filter((info) => info.isTypeOnly)
				.map((info) => info.importName);

			if (namespaceImport && namedImports.length > 0) {
				statements.push(
					`import * as ${namespaceImport.importName} from "${modulePath}"`,
				);
				if (defaultImport || namedSpecifiers.length > 0) {
					const head = defaultImport ? defaultImport.importName : '';
					const namedBlock =
						namedSpecifiers.length > 0
							? `{ ${namedSpecifiers.join(', ')} }`
							: '';
					const clause = [head, namedBlock].filter(Boolean).join(', ');
					statements.push(`import ${clause} from "${modulePath}"`);
				}
				continue;
			}

			if (namespaceImport) {
				const clause = defaultImport
					? `${defaultImport.importName}, * as ${namespaceImport.importName}`
					: `* as ${namespaceImport.importName}`;
				statements.push(`import ${clause} from "${modulePath}"`);
				continue;
			}

			const namedBlock =
				namedSpecifiers.length > 0 ? `{ ${namedSpecifiers.join(', ')} }` : '';
			const onlyTypeNamedImports =
				namedImports.length > 0 &&
				namedImports.every((info) => info.isTypeOnly);
			const clause = [defaultImport?.importName, namedBlock]
				.filter(Boolean)
				.join(', ');

			if (onlyTypeNamedImports && !defaultImport) {
				statements.push(
					`import type { ${typeOnlyNames.join(', ')} } from "${modulePath}"`,
				);
				continue;
			}

			if (clause) {
				statements.push(`import ${clause} from "${modulePath}"`);
			}
		}

		return statements;
	}

	/**
	 * Generate CommonJS require statements.
	 */
	private getCJSStatements(): string[] {
		const statements: string[] = [];
		const byModule = this.groupByModule();

		// Generate statements
		for (const [modulePath, imports] of byModule) {
			const namespaceImport = imports.find(
				(info) => info.importKind === 'namespace',
			);

			if (namespaceImport) {
				// Namespace import: const ns = require('module')
				statements.push(
					`const ${namespaceImport.importName} = require("${modulePath}")`,
				);
			} else {
				// Named and/or default imports: const { name1, name2 } = require('module')
				const importNames = imports.map((info) => info.importName).join(', ');
				statements.push(`const { ${importNames} } = require("${modulePath}")`);
			}
		}

		return statements;
	}

	/**
	 * Compute relative path from one file to another.
	 */
	computeRelativePath(fromFile: string, toFile: string): string {
		const fromDir = path.dirname(fromFile);
		const toDir = path.dirname(toFile);
		const baseName = path.basename(toFile, path.extname(toFile));

		let relativePath = path.relative(fromDir, toDir);
		if (!relativePath.startsWith('.')) {
			relativePath = './' + relativePath;
		}

		return path.join(relativePath, baseName).replace(/\\/g, '/');
	}

	/**
	 * Clear all imports.
	 */
	clear(): void {
		this.imports.clear();
	}

	/**
	 * Check if an import exists.
	 */
	hasImport(modulePath: string, importName: string): boolean {
		const key = `${modulePath}::${importName}`;
		return this.imports.has(key);
	}

	/**
	 * Remove an import.
	 */
	removeImport(modulePath: string, importName: string): boolean {
		const key = `${modulePath}::${importName}`;
		return this.imports.delete(key);
	}

	/**
	 * Get unique key for an import (modulePath::importName).
	 */
	private getImportKey(importInfo: ImportInfo): string {
		return `${importInfo.modulePath}::${importInfo.importName}`;
	}
}
