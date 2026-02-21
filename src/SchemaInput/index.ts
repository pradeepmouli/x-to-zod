import type { ParserConstructor } from '../Parser/index.js';
import type { Context } from '../Types.js';

/**
 * Semantic type alias for any schema value passed into the pipeline.
 *
 * The core pipeline accepts `SchemaInput` values and delegates all shape
 * inspection to the active `SchemaInputAdapter`. No structural constraint is
 * placed on the type itself because adapters own validity and parsing decisions.
 */
export type SchemaInput = unknown;

/**
 * Normalised field bag extracted by a `SchemaInputAdapter` from a schema node.
 * Used by `AbstractParser.applyMetadata` to apply common modifiers.
 */
export interface SchemaMetadata {
	description?: string;
	default?: unknown;
	readOnly?: boolean;
}

/**
 * Protocol for plugging alternative input formats into the x-to-zod pipeline.
 *
 * Implement this interface to teach x-to-zod about a new schema format without
 * modifying any core file.
 */
export interface SchemaInputAdapter {
	isValid(input: unknown): boolean;
	selectParser(input: unknown, refs: Context): ParserConstructor | undefined;
	getRef(input: unknown): string | undefined;
	getMetadata(input: unknown): SchemaMetadata;
}

let _globalAdapter: SchemaInputAdapter | undefined;

/**
 * Register a `SchemaInputAdapter` as the active pipeline adapter.
 * Replaces the default `JsonSchemaAdapter` for the current process.
 */
export function registerAdapter(adapter: SchemaInputAdapter): void {
	_globalAdapter = adapter;
}

/**
 * Return the active adapter, or the default `JsonSchemaAdapter` if none registered.
 *
 * Note: The JsonSchemaAdapter default is wired lazily via the initializer in
 * `src/JsonSchema/parsers/parseSchema.ts` which calls `registerAdapter(jsonSchemaAdapter)`
 * on module load, ensuring the default is always available before any parse call.
 */
export function getGlobalAdapter(): SchemaInputAdapter {
	if (_globalAdapter === undefined) {
		throw new Error(
			'No SchemaInputAdapter registered. Call registerAdapter(jsonSchemaAdapter) first, ' +
				'or import from "x-to-zod" which auto-initialises the default adapter.',
		);
	}
	return _globalAdapter;
}

/**
 * Internal: set the default adapter without overwriting a user-registered one.
 * Called by JsonSchemaAdapter module initialisation.
 */
export function _setDefaultAdapter(adapter: SchemaInputAdapter): void {
	if (_globalAdapter === undefined) {
		_globalAdapter = adapter;
	}
}
