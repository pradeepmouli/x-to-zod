import type { JSONSchema as JSONSchema07 } from 'json-schema-typed/draft-07';
import type { JSONSchemaAny as JSONSchema } from '../JsonSchema/types/index.js';
import type { Builder } from '../Builder/index.js';

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
		refs: import('../context.js').Context,
	): JSONSchema07.Interface | undefined;
}

export interface PostProcessorContext {
	path: (string | number)[];
	pathString: string;
	schema: JSONSchema;
	build: import('../context.js').BuildFunctions;
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
