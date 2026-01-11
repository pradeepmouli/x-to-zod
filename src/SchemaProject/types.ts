import type { ZodBuilder } from '../ZodBuilder/BaseBuilder.js';
import type { SourceFile, CompilerOptions } from 'ts-morph';

/**
 * Multi-Schema Project Configuration Options
 */
export interface SchemaProjectOptions {
	outDir: string;
	moduleFormat?: 'esm' | 'cjs' | 'both';
	zodVersion?: 'v3' | 'v4';
	generateIndex?: boolean;
	generateDeclarations?: boolean;
	tsconfig?: string | CompilerOptions;
	nameResolver?: NameResolver;
	refResolver?: RefResolver;
	globalPostProcessors?: PostProcessorConfig[];
	prettier?: boolean | PrettierOptions;
	importPathTransformer?: (from: string, to: string) => string;
	extractDefinitions?: boolean | ExtractDefinitionsOptions;
}

/**
 * Options for extracting definitions into separate files
 */
export interface ExtractDefinitionsOptions {
	enabled: boolean;
	subdir?: string; // Subdirectory for definitions (e.g., 'definitions', 'components/schemas')
	namePattern?: (schemaId: string, defName: string) => string;
}

/**
 * Options for individual schema when added to project
 */
export interface SchemaOptions {
	postProcessors?: PostProcessorConfig[];
	moduleFormatOverride?: 'esm' | 'cjs' | 'both';
	extractDefinitions?: boolean;
}

/**
 * Options for adding schema from file
 */
export interface SchemaFileOptions extends SchemaOptions {
	id?: string;
	encoding?: BufferEncoding;
}

/**
 * Single schema entry in the registry
 */
export interface SchemaEntry {
	id: string;
	schema: Record<string, any>; // JsonSchema
	builder: ZodBuilder | null;
	sourceFile: SourceFile | null;
	exportName: string;
	metadata: SchemaMetadata;
}

/**
 * Metadata associated with a schema
 */
export interface SchemaMetadata {
	originalFilePath?: string;
	postProcessors?: PostProcessorConfig[];
	moduleFormatOverride?: 'esm' | 'cjs' | 'both';
	isExternal?: boolean;
	importedFrom?: string;
}

/**
 * Result of resolving a $ref
 */
export interface RefResolution {
	targetSchemaId: string;
	definitionPath: string[];
	isExternal: boolean;
	resolvedBuilder?: ZodBuilder;
	importInfo?: ImportInfo;
}

/**
 * Information needed to import an external schema reference
 */
export interface ImportInfo {
	importName: string;
	importKind: 'named' | 'default' | 'namespace';
	modulePath: string;
	isTypeOnly?: boolean;
}

/**
 * Dependency Graph for schema resolution and build ordering
 */
export interface DependencyGraph {
	nodes: Set<string>; // schema IDs
	edges: Map<string, Set<string>>; // from -> to (schemaId -> [refSchemaIds])
	cycles: Set<Set<string>>; // detected strongly connected components
}

/**
 * Configuration for post-processor application
 */
export interface PostProcessorConfig {
	name: string;
	options?: Record<string, any>;
}

/**
 * Prettier configuration options
 */
export interface PrettierOptions {
	semi?: boolean;
	singleQuote?: boolean;
	trailingComma?: 'es5' | 'none' | 'all';
	printWidth?: number;
	tabWidth?: number;
	useTabs?: boolean;
}

/**
 * Result of a build operation
 */
export interface BuildResult {
	success: boolean;
	errors: BuildError[];
	warnings: BuildWarning[];
	generatedFiles: string[];
}

/**
 * Build-time error
 */
export interface BuildError {
	code: string;
	message: string;
	schemaId?: string;
	details?: Record<string, any>;
}

/**
 * Build-time warning
 */
export interface BuildWarning {
	code: string;
	message: string;
	schemaId?: string;
	details?: Record<string, any>;
}

/**
 * Validation result for schema project
 */
export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
	warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
	code:
		| 'EXPORT_CONFLICT'
		| 'INVALID_SCHEMA'
		| 'UNRESOLVED_REF'
		| 'TSMORPH_ERROR'
		| 'IO_ERROR';
	message: string;
	schemaId?: string;
	details?: Record<string, any>;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
	code: 'MISSING_REF' | 'CIRCULAR_REF' | 'POSTPROCESSOR_ISSUE';
	message: string;
	schemaId?: string;
	details?: Record<string, any>;
}

/**
 * Contract for schema name resolution strategy
 */
export interface NameResolver {
	resolveExportName(schemaId: string): string;
	validateExportName(name: string): boolean;
	detectConflicts(names: Map<string, string>): ConflictReport;
}

/**
 * Report of naming conflicts
 */
export interface ConflictReport {
	hasConflicts: boolean;
	conflicts: ConflictDetail[];
}

/**
 * Individual conflict detail
 */
export interface ConflictDetail {
	exportName: string;
	affectedSchemaIds: string[];
}

/**
 * Contract for reference resolution
 */
export interface RefResolver {
	resolve(ref: string, fromSchemaId: string): RefResolution | null;
	supportsExternalRefs(): boolean;
}

/**
 * Registry for managing schemas
 */
export interface ISchemaRegistry {
	addEntry(entry: SchemaEntry): void;
	getEntry(schemaId: string): SchemaEntry | undefined;
	getAllEntries(): SchemaEntry[];
	hasEntry(schemaId: string): boolean;
	removeEntry(schemaId: string): boolean;
	clear(): void;
}

/**
 * Builder cache for deduplication
 */
export interface IBuilderRegistry {
	register(schemaId: string, exportName: string, builder: ZodBuilder): void;
	get(schemaId: string, exportName: string): ZodBuilder | undefined;
	getKeysForSchema(schemaId: string): Array<[string, ZodBuilder]>;
	has(schemaId: string, exportName: string): boolean;
	clear(): void;
}

/**
 * Import statement manager
 */
export interface ImportManager {
	addImport(
		target: string,
		importInfo: ImportInfo,
		forModule?: 'esm' | 'cjs',
	): void;
	getImports(forModule?: 'esm' | 'cjs'): ImportInfo[];
	optimizeImports(forModule?: 'esm' | 'cjs'): ImportInfo[];
	emitImports(forModule?: 'esm' | 'cjs'): string[]; // Array of import statements
	clear(): void;
}

/**
 * Source file generator using ts-morph
 */
export interface ISourceFileGenerator {
	generateFile(
		schemaId: string,
		builder: ZodBuilder,
		importManager: ImportManager,
		exportName: string,
	): SourceFile | null;
	generateIndex(
		entries: SchemaEntry[],
		importManager: ImportManager,
	): SourceFile | null;
}

/**
 * Validator for schema projects
 */
export interface IValidator {
	detectExportConflicts(entries: SchemaEntry[]): ConflictReport;
	detectMissingRefs(entries: SchemaEntry[]): RefResolution[];
	detectCycles(graph: DependencyGraph): Set<Set<string>>;
	validate(entries: SchemaEntry[], graph: DependencyGraph): ValidationResult;
}

/**
 * Lazy builder support for circular references
 */
export interface LazyBuilderConfig {
	schemaId: string;
	exportName: string;
	isLazy: boolean;
	importInfo?: ImportInfo;
}
