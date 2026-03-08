import type {
	SchemaTransformer,
	PostProcessor,
	PostProcessorConfig,
} from './PostProcessing/types.js';

export type BuildFunctions =
	| typeof import('./ZodBuilder/v3.js').buildV3
	| typeof import('./ZodBuilder/v4.js').buildV4;

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
