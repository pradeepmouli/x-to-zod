import type { SchemaEntry } from './types.js';
import type { ZodBuilder } from '../ZodBuilder/BaseBuilder.js';
import type { ImportManager } from './ImportManager.js';
import { Project, SourceFile } from 'ts-morph';
import path from 'path';

/**
 * SourceFileGenerator: Generates .ts files for schemas using ts-morph.
 * Manages imports, builder code, and file formatting.
 */
export class SourceFileGenerator {
	private project: Project;
	private outDir: string;
	private prettier: boolean;

	constructor(outDir: string, prettier: boolean = false) {
		this.outDir = outDir;
		this.prettier = prettier;
		this.project = new Project({
			compilerOptions: {
				target: 99, // ES2020
				module: 99, // ES2020
				declaration: true,
				strict: true,
				esModuleInterop: true,
				skipLibCheck: true,
				forceConsistentCasingInFileNames: true,
			},
		});
	}

	/**
	 * Generate a TypeScript file for a schema.
	 * @param schemaId - Schema identifier
	 * @param builder - Zod builder for the schema
	 * @param importManager - Manager for import statements
	 * @param _exportName - Name to export the schema as
	 * @returns SourceFile or null on error
	 */
	generateFile(
		schemaId: string,
		builder: ZodBuilder,
		importManager: ImportManager,
		_exportName: string,
	): SourceFile | null {
		try {
			// Compute output file path
			const filePath = this.computeFilePath(schemaId);

			// Create or get existing source file
			let sourceFile = this.project.getSourceFile(filePath);
			if (!sourceFile) {
				sourceFile = this.project.createSourceFile(filePath, '');
			}

			// Clear existing content
			sourceFile.removeText();

			// Add import statements
			const imports = importManager.getImportStatements();
			if (imports.length > 0) {
				sourceFile.addStatements(imports);
				sourceFile.insertText(sourceFile.getEnd(), '\n');
			}

			// Add builder code
			const builderCode = builder.text();
			const exportStatement = `export default ${builderCode};`;
			sourceFile.addStatements(exportStatement);

			// Format if requested
			if (this.prettier) {
				sourceFile.formatText();
			}

			return sourceFile;
		} catch (error) {
			console.error(`Failed to generate file for schema "${schemaId}":`, error);
			return null;
		}
	}

	/**
	 * Generate an index file that exports all schemas.
	 * @param entries - All schema entries
	 * @param _importManager - Manager for import statements
	 * @returns SourceFile or null on error
	 */
	generateIndex(
		entries: SchemaEntry[],
		_importManager: ImportManager,
	): SourceFile | null {
		try {
			const indexPath = path.join(this.outDir, 'index.ts');

			// Create or get existing source file
			let sourceFile = this.project.getSourceFile(indexPath);
			if (!sourceFile) {
				sourceFile = this.project.createSourceFile(indexPath, '');
			}

			// Clear existing content
			sourceFile.removeText();

			// Add export statements for all schemas
			for (const entry of entries) {
				const filePath = this.computeFilePath(entry.id);
				const relativePath = path
					.relative(this.outDir, filePath)
					.replace(/\.ts$/, '')
					.replace(/\\/g, '/');

				const exportStatement = `export { default as ${entry.exportName} } from "./${relativePath}";`;
				sourceFile.addStatements(exportStatement);
			}

			// Format if requested
			if (this.prettier) {
				sourceFile.formatText();
			}

			return sourceFile;
		} catch (error) {
			console.error('Failed to generate index file:', error);
			return null;
		}
	}

	/**
	 * Save all files to disk.
	 */
	async saveAll(): Promise<string[]> {
		const files: string[] = [];
		for (const sourceFile of this.project.getSourceFiles()) {
			await sourceFile.save();
			files.push(sourceFile.getFilePath());
		}
		return files;
	}

	/**
	 * Get the ts-morph Project instance.
	 */
	getProject(): Project {
		return this.project;
	}

	/**
	 * Dispose of resources.
	 */
	dispose(): void {
		this.project.getSourceFiles().forEach((file) => {
			file.delete();
		});
	}

	/**
	 * Compute output file path for a schema.
	 */
	private computeFilePath(schemaId: string): string {
		// Replace slashes with path separators and add .ts extension
		const fileName = schemaId.replace(/\//g, path.sep) + '.ts';
		return path.join(this.outDir, fileName);
	}
}
