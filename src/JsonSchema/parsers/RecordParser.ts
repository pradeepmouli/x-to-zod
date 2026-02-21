import type { Context } from '../../Types.js';
import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import type { Builder } from '../../Builder/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import { parseSchema } from './parseSchema.js';

/**
 * Parser for JSON Schema record / dictionary patterns.
 *
 * Handles schemas that describe open-ended key-value maps via
 * `additionalProperties`. Produces `z.record(keySchema, valueSchema)`.
 *
 * Detection heuristics (used when routed explicitly via `parse.record()`):
 * - `additionalProperties` is a schema object → value type
 * - `additionalProperties: true` → `z.record(z.string(), z.any())`
 * - No `additionalProperties` or `false` → `z.record(z.string(), z.any())`
 */
export class RecordParser extends AbstractParser<'record'> {
	readonly typeKind = 'record' as const;

	constructor(schema: JSONSchemaObject, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(schema: JSONSchema): Builder {
		const s = schema as JSONSchemaObject;
		const ap = (s as any).additionalProperties;

		const keySchema = this.refs.build.string();

		let valueSchema: Builder;
		if (ap !== undefined && ap !== true && ap !== false) {
			// additionalProperties is a schema object
			valueSchema = parseSchema(ap as JSONSchema, {
				...this.refs,
				path: [...this.refs.path, 'additionalProperties'],
			});
		} else {
			// true, false, or absent → any
			valueSchema = this.refs.build.any();
		}

		return this.refs.build.record(keySchema, valueSchema);
	}
}
