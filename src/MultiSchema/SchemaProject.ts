import type {
	SchemaProjectOptions,
	SchemaEntry,
	SchemaOptions,
	SchemaFileOptions,
	RefResolution,
	BuildResult,
} from './types.js';
import type { JsonSchema } from '../Types.js';
import { SchemaRegistry } from './SchemaRegistry.js';
import { DefaultNameResolver } from './NameResolver.js';
import { DefaultRefResolver } from './RefResolver.js';
import { DependencyGraphBuilder } from './DependencyGraph.js';
import { Validator } from './Validator.js';
import { ImportManager } from './ImportManager.js';
import { SourceFileGenerator } from './SourceFileGenerator.js';
import { BuilderRegistry } from './BuilderRegistry.js';
import { extractRefs } from './parseRef.js';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * SchemaProject: Main API for multi-schema projects.
 * Manages schema registration, validation, dependency analysis, and code generation.
 */
export class SchemaProject {
	private registry: SchemaRegistry;
	private nameResolver: DefaultNameResolver;
	private refResolver: DefaultRefResolver;
	private builderRegistry: BuilderRegistry;
	private validator: Validator;
	private options: SchemaProjectOptions;
	private dependencyGraph: DependencyGraphBuilder;

	constructor(options: SchemaProjectOptions) {
		this.options = options;
		this.registry = new SchemaRegistry();
		this.nameResolver =
			(options.nameResolver as DefaultNameResolver) ||
			new DefaultNameResolver();
		this.builderRegistry = new BuilderRegistry();
		this.refResolver =
			(options.refResolver as DefaultRefResolver) ||
			new DefaultRefResolver(this.registry);
		this.dependencyGraph = new DependencyGraphBuilder();
		this.validator = new Validator(
			this.registry,
			this.nameResolver,
			this.refResolver,
			this.dependencyGraph,
		);
	}

	/**
	 * Add a schema from a JSON object.
	 * @param id - Unique schema identifier
	 * @param schema - JSON schema object
	 * @param options - Additional schema options
	 */
	addSchema(id: string, schema: JsonSchema, options?: SchemaOptions): void {
		const exportName = this.nameResolver.resolveExportName(id);

		const entry: SchemaEntry = {
			id,
			schema: schema as Record<string, any>,
			builder: null,
			sourceFile: null,
			exportName,
			metadata: {
				postProcessors: options?.postProcessors,
				moduleFormatOverride: options?.moduleFormatOverride,
				isExternal: false,
			},
		};

		this.registry.addEntry(entry);
		this.dependencyGraph.addNode(id);
	}

	/**
	 * Add a schema from a file.
	 * @param filePath - Path to the schema file
	 * @param id - Optional unique identifier; defaults to relative file path
	 * @param options - Additional schema options
	 */
	addSchemaFromFile(
		filePath: string,
		id?: string,
		options?: SchemaFileOptions,
	): void {
		const content = readFileSync(filePath, options?.encoding || 'utf8');
		const schema = JSON.parse(content.toString());
		const schemaId = id || path.relative(process.cwd(), filePath);

		this.addSchema(schemaId, schema, {
			postProcessors: options?.postProcessors,
			moduleFormatOverride: options?.moduleFormatOverride,
		});

		const entry = this.registry.getEntry(schemaId);
		if (entry) {
			entry.metadata.originalFilePath = filePath;
		}
	}

	/**
	 * Validate the project configuration and schema relationships.
	 * @returns ValidationResult with errors and warnings
	 */
	validate() {
		this.rebuildDependencyGraph();
		return this.validator.validate();
	}

	/**
	 * Build the project: parse schemas, apply post-processors, generate code.
	 * @returns BuildResult with success status and generated file paths
	 */
	async build(): Promise<BuildResult> {
		const errors: any[] = [];
		const warnings: any[] = [];
		const generatedFiles: string[] = [];

		try {
			// Step 1: Validate project
			const validation = this.validate();
			if (!validation.valid) {
				return {
					success: false,
					errors: validation.errors,
					warnings: validation.warnings,
					generatedFiles: [],
				};
			}

			// Add warnings from validation
			warnings.push(...validation.warnings);

			// Step 2: Topological sort for build order
			const buildOrder = this.topologicalSort();

			// Step 3: Generate source files
			const fileGenerator = new SourceFileGenerator(
				this.options.outDir,
				!!this.options.prettier,
			);

			for (const schemaId of buildOrder) {
				const entry = this.registry.getEntry(schemaId);
				if (!entry) continue;

				// TODO: Parse schema and generate builder
				// builder = parseSchema(entry.schema, entry.metadata);
				// entry.builder = builder;

				// Create import manager for this file
				const format =
					this.options.moduleFormat === 'both'
						? 'esm'
						: this.options.moduleFormat || 'esm';
				const _importMgr = new ImportManager(format);

				// Generate source file
				// const sourceFile = fileGenerator.generateFile(
				//   schemaId,
				//   builder,
				//   importMgr,
				//   entry.exportName,
				// );
				// if (sourceFile) {
				//   entry.sourceFile = sourceFile;
				// }
			}

			// Step 4: Save files
			const saved = await fileGenerator.saveAll();
			generatedFiles.push(...saved);

			fileGenerator.dispose();

			return {
				success: true,
				errors,
				warnings,
				generatedFiles,
			};
		} catch (error) {
			return {
				success: false,
				errors: [
					{
						code: 'BUILD_FAILED',
						message: `Build failed: ${error instanceof Error ? error.message : String(error)}`,
						details: { error },
					},
				],
				warnings,
				generatedFiles,
			};
		}
	}

	/**
	 * Get the dependency graph for schemas.
	 */
	getDependencyGraph() {
		this.rebuildDependencyGraph();
		return this.dependencyGraph;
	}

	/**
	 * Resolve a $ref using the configured resolver.
	 */
	resolveRef(ref: string, fromSchemaId: string): RefResolution | null {
		return this.refResolver.resolve(ref, fromSchemaId);
	}

	/**
	 * Get schema registry for direct access.
	 */
	getRegistry(): SchemaRegistry {
		return this.registry;
	}

	/**
	 * Get builder registry for direct access.
	 */
	getBuilderRegistry(): BuilderRegistry {
		return this.builderRegistry;
	}

	/**
	 * Topological sort of schema dependencies.
	 * Returns schema IDs in build order (dependencies first).
	 */
	private topologicalSort(): string[] {
		try {
			return this.dependencyGraph.topologicalSort();
		} catch (error) {
			throw new Error(
				`Dependency cycle detected: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private rebuildDependencyGraph(): void {
		this.dependencyGraph.clear();

		for (const entry of this.registry.getAllEntries()) {
			this.dependencyGraph.addNode(entry.id);
			const refs = extractRefs(entry.schema as JsonSchema);
			for (const ref of refs) {
				const resolution = this.refResolver.resolve(ref, entry.id);
				if (resolution && resolution.isExternal && resolution.targetSchemaId) {
					this.dependencyGraph.addEdge(entry.id, resolution.targetSchemaId);
				}
			}
		}

		this.dependencyGraph.detectCycles();
	}
}
