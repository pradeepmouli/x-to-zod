import type { Context } from '../../Types.js';
import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { BaseParser } from './BaseParser.js';
import { parseSchema } from './parseSchema.js';

/**
 * Parser for JSON Schema tuple types.
 *
 * Handles both:
 * - `prefixItems` (draft 2020-12): The standard tuple keyword
 * - `items` as array (draft-07): Legacy tuple syntax
 *
 * Produces `z.tuple([...])` via the TupleBuilder.
 */
export class TupleParser extends BaseParser<'tuple'> {
	readonly typeKind = 'tuple' as const;

	constructor(schema: JSONSchemaObject, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(schema: JSONSchema): ZodBuilder {
		const s = schema as JSONSchemaObject;
		const tupleSchema = s as any;

		// Draft 2020-12: prefixItems is the standard tuple keyword
		const tupleItems: JSONSchema[] =
			tupleSchema.prefixItems ??
			(Array.isArray(tupleSchema.items) ? tupleSchema.items : []);

		const itemSchemas = tupleItems.map((item, i) =>
			parseSchema(item, {
				...this.refs,
				path: [
					...this.refs.path,
					tupleSchema.prefixItems ? 'prefixItems' : 'items',
					i,
				],
			}),
		);

		return this.refs.build.tuple(itemSchemas);
	}
}
