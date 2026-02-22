export * from './JsonSchema/parsers/parseDefault.js';
export * from './JsonSchema/parsers/parseSchema.js';
export * from './Types.js';

// New interfaces (refactor-010)
export type { Builder } from './Builder/index.js';
export type { Parser, ParserConstructor } from './Parser/index.js';
export { AbstractParser } from './Parser/AbstractParser.js';
export { registerParser } from './JsonSchema/parsers/registry.js';
export type {
	SchemaInput,
	SchemaMetadata,
	SchemaInputAdapter,
} from './SchemaInput/index.js';
export { registerAdapter, getGlobalAdapter } from './SchemaInput/index.js';
export {
	JsonSchemaAdapter,
	jsonSchemaAdapter,
} from './SchemaInput/JsonSchemaAdapter.js';

export { toZod as jsonSchemaToZod } from './JsonSchema/toZod.js';
export { toZod as default } from './JsonSchema/toZod.js';

export * as JSONSchema from './JsonSchema/index.js';

/**
 * Multi-schema project support.
 *
 * Use `SchemaProject` to manage multiple JSON Schemas with cross-schema references.
 * See [quickstart guide](../specs/004-multi-schema-projects/quickstart.md) for usage examples.
 *
 * @example
 * ```ts
 * import { SchemaProject } from 'x-to-zod';
 *
 * const project = new SchemaProject.SchemaProject({
 *   outDir: './generated',
 *   moduleFormat: 'both',
 *   zodVersion: 'v4',
 *   generateIndex: true,
 * });
 *
 * project.addSchema('user', userSchema);
 * project.addSchema('post', postSchema);
 * await project.build();
 * ```
 */
export * as SchemaProject from './SchemaProject/index.js';

export * as ZodBuilder from './ZodBuilder/index.js';
export * as PostProcessing from './PostProcessing/index.js';
