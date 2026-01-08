import type { JsonSchema } from '../Types.js';
import type { DefaultRefResolver } from './RefResolver.js';
import { ReferenceBuilder } from '../ZodBuilder/reference.js';

/**
 * Detects and parses $ref in a JSON schema.
 * Returns ReferenceBuilder for external refs or null for non-refs.
 *
 * @param schema - JSON schema to check for $ref
 * @param refResolver - Resolver for resolving $refs
 * @param _path - Current path in the schema tree (for error messages)
 * @returns ReferenceBuilder for external refs, or null if not a $ref or internal $ref
 */
export function parseRef(
	schema: JsonSchema | undefined,
	refResolver: DefaultRefResolver,
	_path: string[],
): ReferenceBuilder | null {
	if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
		return null;
	}

	const ref = schema.$ref;
	if (!ref || typeof ref !== 'string') {
		return null;
	}

	// Check if this is an internal or external reference
	const isInternal = isInternalRef(ref);

	if (isInternal) {
		// Internal refs are resolved and parsed normally by parseSchema
		return null;
	}

	// External ref: create ReferenceBuilder
	try {
		const resolved = refResolver.resolve(ref, 'unknown');
		if (!resolved || !resolved.importInfo) {
			// Unresolved external ref - could be a warning or error
			console.warn(`Failed to resolve external $ref: ${ref}`);
			return null;
		}

		const refBuilder = new ReferenceBuilder(
			resolved.targetSchemaId,
			'default',
			resolved.importInfo,
		);
		return refBuilder;
	} catch (error) {
		console.error(`Error resolving $ref "${ref}":`, error);
		return null;
	}
}

/**
 * Check if a $ref is internal (starts with # or local path).
 */
function isInternalRef(ref: string): boolean {
	return ref.startsWith('#') || !ref.includes('://');
}

/**
 * Extract all $refs from a schema recursively.
 * Useful for dependency analysis.
 */
export function extractRefs(schema: JsonSchema, refs: Set<string> = new Set()): Set<string> {
	if (!schema || typeof schema !== 'object') {
		return refs;
	}

	if (Array.isArray(schema)) {
		for (const item of schema) {
			extractRefs(item, refs);
		}
		return refs;
	}

	// Check for $ref
	if (schema.$ref && typeof schema.$ref === 'string') {
		refs.add(schema.$ref);
	}

	// Recurse into schema properties
	if (schema.properties && typeof schema.properties === 'object') {
		for (const propSchema of Object.values(schema.properties)) {
			extractRefs(propSchema, refs);
		}
	}

	// Recurse into array items
	if (schema.items) {
		extractRefs(schema.items, refs);
	}

	// Recurse into allOf, anyOf, oneOf
	for (const combiner of ['allOf', 'anyOf', 'oneOf'] as const) {
		if (schema[combiner] && Array.isArray(schema[combiner])) {
			for (const subSchema of schema[combiner]) {
				extractRefs(subSchema, refs);
			}
		}
	}

	// Recurse into additionalProperties
	if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
		extractRefs(schema.additionalProperties, refs);
	}

	return refs;
}
