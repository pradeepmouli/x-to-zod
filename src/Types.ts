import { Jsonifiable } from 'type-fest';
import type { JSONSchema as JSONSchema07 } from 'json-schema-typed/draft-07';
import type { JSONSchemaAny as JSONSchema } from './JsonSchema/types/index.js';
import type { Builder } from './Builder/index.js';

export type Serializable = Jsonifiable;

export type ParserSelector = (schema: JSONSchema, refs: Context) => Builder;

export type BuildFunctions =
	| typeof import('./ZodBuilder/v3.js').buildV3
	| typeof import('./ZodBuilder/v4.js').buildV4;

export type ZodVersion = 'v3' | 'v4';

export type ProcessorPathPattern = string | string[];

export interface ProcessorConfig {
	pathPattern?: ProcessorPathPattern;
}

/**
 * Schema transformer: mutates/transforms a schema node before parsing.
 */
export interface SchemaTransformer extends ProcessorConfig {
	(
		schema: JSONSchema07.Interface,
		refs: Context,
	): JSONSchema07.Interface | undefined;
}

export interface PostProcessorContext {
	path: (string | number)[];
	pathString: string;
	schema: JSONSchema;
	build: BuildFunctions;
	matchPath: (pattern: string) => boolean;
}

/**
 * Post-processor: transforms a builder after parsing.
 */
export type PostProcessor = (
	builder: Builder,
	context: PostProcessorContext,
) => Builder | undefined;

export interface PostProcessorConfig extends ProcessorConfig {
	processor: PostProcessor;
	typeFilter?: string | string[];
}

export type Options = {
	name?: string;
	module?: 'cjs' | 'esm' | 'none';
	withoutDefaults?: boolean;
	withoutDescribes?: boolean;
	withJsdocs?: boolean;
	depth?: number;
	type?: boolean | string;
	noImport?: boolean;
	preferUnions?: boolean;
	disableRefs?: boolean;
	/** Zod version to target for generated code (default: 'v4') */
	zodVersion?: 'v3' | 'v4';
	/** Schema transformers applied before parsing */
	transformers?: SchemaTransformer[];
	/** Post-processors to transform builders after parsing */
	postProcessors?: (PostProcessor | PostProcessorConfig)[];
};

export type Context = Options & {
	build:
		| typeof import('./ZodBuilder/v3.js').buildV3
		| typeof import('./ZodBuilder/v4.js').buildV4;
	path: (string | number)[];
	pathString?: string;
	matchPath?: (pattern: string) => boolean;
	seen: Map<
		object | boolean,
		{ n: number; r: import('./Builder/index.js').Builder | undefined }
	>;
	transformers?: SchemaTransformer[];
	postProcessors?: PostProcessorConfig[];
	/** Optional SchemaProject resolver for cross-schema $refs */
	refResolver?: import('./SchemaProject/RefResolver.js').DefaultRefResolver;
	/** Current schema ID (used for resolving relative refs) */
	currentSchemaId?: string;
	/** Optional import manager for collecting import statements */
	importManager?: import('./SchemaProject/ImportManager.js').ImportManager;
	/** Optional builder registry for caching builders across schemas */
	builderRegistry?: import('./SchemaProject/BuilderRegistry.js').BuilderRegistry;
	/** Optional dependency graph for cycle detection in SchemaProject */
	dependencyGraph?: import('./SchemaProject/types.js').DependencyGraph;
	/** Optional per-call adapter override; defaults to the global adapter */
	adapter?: import('./SchemaInput/index.js').SchemaInputAdapter;
};
