import type { JsonSchema } from '../Types.js';
import type { DefaultRefResolver } from './RefResolver.js';
import type { DependencyGraph } from './types.js';
import { ReferenceBuilder } from '../ZodBuilder/reference.js';

/**
 * Detects and parses external $ref entries in a JSON schema.
 * Returns ReferenceBuilder for external refs or null for non-refs/internal refs.
 */
export function parseRef(
	schema: JsonSchema | undefined,
	refResolver: DefaultRefResolver,
	fromSchemaId: string,
	dependencyGraph?: DependencyGraph,
): ReferenceBuilder | null {
	if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
		return null;
	}

	const ref = (schema as { $ref?: unknown }).$ref;
	if (!ref || typeof ref !== 'string') {
		return null;
	}

	if (ref.startsWith('#')) {
		return null;
	}

	try {
		const resolved = refResolver.resolve(ref, fromSchemaId);

		if (!resolved || !resolved.importInfo || !resolved.isExternal) {
			console.warn(`Failed to resolve external $ref: ${ref}`);
			return new ReferenceBuilder(
				'UnknownRef',
				'UnknownRef',
				{
					importName: 'UnknownRef',
					importKind: 'named',
					modulePath: '',
					isTypeOnly: true,
				},
				{ unknownFallback: true },
			);
		}

		const importInfo = resolved.importInfo;
		const targetImportName = importInfo.importName;
		const targetExportName =
			importInfo.importKind === 'default' ? 'default' : importInfo.importName;

		const inCycle = isInCycle(fromSchemaId, resolved.targetSchemaId, dependencyGraph);
		if (inCycle) {
			importInfo.isTypeOnly = true;
		}

		return new ReferenceBuilder(targetImportName, targetExportName, importInfo, {
			isLazy: inCycle,
			isTypeOnly: !!importInfo.isTypeOnly,
		});
	} catch (error) {
		console.error(`Error resolving $ref "${ref}":`, error);
		return null;
	}
}

function isInCycle(
	fromSchemaId: string,
	targetSchemaId: string,
	dependencyGraph?: DependencyGraph,
): boolean {
	if (!dependencyGraph || !dependencyGraph.cycles.size) return false;

	for (const scc of dependencyGraph.cycles) {
		if (scc.has(fromSchemaId) && scc.has(targetSchemaId)) {
			return true;
		}
	}

	return false;
}

/**
 * Extract all $refs from a schema recursively.
 * Useful for dependency analysis.
 */
export function extractRefs(
	schema: JsonSchema,
	refs: Set<string> = new Set(),
): Set<string> {
	if (!schema || typeof schema !== 'object') {
		return refs;
	}

	if (Array.isArray(schema)) {
		for (const item of schema) {
			extractRefs(item as JsonSchema, refs);
		}
		return refs;
	}

	const refValue = (schema as { $ref?: unknown }).$ref;
	if (refValue && typeof refValue === 'string') {
		refs.add(refValue);
	}

	if (schema.properties && typeof schema.properties === 'object') {
		for (const propSchema of Object.values(schema.properties)) {
			extractRefs(propSchema as JsonSchema, refs);
		}
	}

	if (schema.items) {
		extractRefs(schema.items as JsonSchema, refs);
	}

	for (const combiner of ['allOf', 'anyOf', 'oneOf'] as const) {
		const combined = (schema as Record<string, unknown>)[combiner];
		if (combined && Array.isArray(combined)) {
			for (const subSchema of combined as JsonSchema[]) {
				extractRefs(subSchema, refs);
			}
		}
	}

	if (
		schema.additionalProperties &&
		typeof schema.additionalProperties === 'object'
	) {
		extractRefs(schema.additionalProperties as JsonSchema, refs);
	}

	return refs;
}
