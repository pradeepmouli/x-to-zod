import { Jsonifiable } from 'type-fest';
import type { JSONSchema as JSONSchema2020 } from 'json-schema-typed/draft-2020-12';
import type { JSONSchema as JSONSchema07 } from 'json-schema-typed/draft-07';
import type { JSONSchema as JSONSchema2019 } from 'json-schema-typed/draft-2019-09';
import type { transformer } from './JsonSchema/index.js';
import type { ZodBuilder as BaseBuilder } from './ZodBuilder/BaseBuilder.js';

export type Serializable = Jsonifiable;

// Type aliases for backward compatibility

export * as JSONSchema2020 from 'json-schema-typed/draft-2020-12';

export * as JSONSchema2019 from 'json-schema-typed/draft-2019-09';

export * as JSONSchema07 from 'json-schema-typed/draft-07';

import { JSONSchema } from 'json-schema-typed/draft-2020-12';

type JSONSchemaMap = {
	'2020-12': JSONSchema2020.Interface;
	'2019-09': JSONSchema2019.Interface;
	'07': JSONSchema07.Interface;
};

export type JSONSchema = JSONSchema;

export type JsonSchemaObject = JSONSchema & {
	// Custom extensions
	errorMessage?: { [key: string]: string | undefined };
	nullable?: boolean; // OpenAPI 3.0 extension
};

export type ParserSelector = (
	schema: JSONSchema.Interface,
	refs: Context,
) => BaseBuilder;
export type ParserOverride = (
	schema: JSONSchema.Interface,
	refs: Context,
) => BaseBuilder | string | void;

export type BuildFunctions =
	| typeof import('./ZodBuilder/v3.js').buildV3
	| typeof import('./ZodBuilder/v4.js').buildV4;

export type ProcessorPathPattern = string | string[];

export interface ProcessorConfig {
	pathPattern?: ProcessorPathPattern;
}

/**
 * Pre-processor: transforms schema before parsing.
 */
export interface PreProcessor extends ProcessorConfig {
	(
		schema: JSONSchema07.Interface,
		refs: Context,
	): JSONSchema07.Interface | undefined;
}

export interface PostProcessorContext {
	path: (string | number)[];
	pathString: string;
	schema: JSONSchema.Interface;
	build: BuildFunctions;
	matchPath: (pattern: string) => boolean;
}

/**
 * Post-processor: transforms a builder after parsing.
 */
export type PostProcessor = (
	builder: BaseBuilder,
	context: PostProcessorContext,
) => BaseBuilder | undefined;

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
	parserOverride?: ParserOverride;
	depth?: number;
	type?: boolean | string;
	noImport?: boolean;
	preferUnions?: boolean;
	disableRefs?: boolean;
	preprocessors?: transformer[];
	/** Zod version to target for generated code (default: 'v4') */
	zodVersion?: 'v3' | 'v4';
	/** Pre-processors to transform schema before parsing */
	preProcessors?: PreProcessor[];
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
		{ n: number; r: import('./ZodBuilder/index.js').BaseBuilder | undefined }
	>;
	preProcessors?: PreProcessor[];
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
};
