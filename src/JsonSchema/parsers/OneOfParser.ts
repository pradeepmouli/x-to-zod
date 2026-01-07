import { BaseParser } from './BaseParser.js';
import type { JsonSchema } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import type { buildV4 } from '../../ZodBuilder/v4.js';
import { parseSchema } from './parseSchema.js';

/**
 * Parser for JSON Schema oneOf keyword.
 * Converts oneOf constraints to Zod xor (v4) or union (v3).
 */
export class OneOfParser extends BaseParser<'oneOf'> {
	readonly typeKind = 'oneOf' as const;

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const oneOfSchema = schema as { oneOf?: JsonSchema[] };
		const oneOf = oneOfSchema.oneOf || [];

		if (oneOf.length === 0) {
			return this.refs.build.any();
		}

		if (oneOf.length === 1) {
			return this.parseChild(oneOf[0], 'oneOf', 0);
		}

		const schemaBuilders = oneOf.map((subSchema: JsonSchema, i: number) =>
			parseSchema(subSchema, {
				...this.refs,
				path: [...(this.refs.path || []), 'oneOf', i],
			}),
		);

		// Use xor for v4, union for v3
		if (this.refs.zodVersion === 'v4' && 'xor' in this.refs.build) {
			return (this.refs.build as typeof buildV4).xor(schemaBuilders);
		}

		return this.refs.build.union(schemaBuilders);
	}

	protected canProduceType(type: string): boolean {
		return (
			type === this.typeKind || type === 'OneOfBuilder' || type === 'XorBuilder'
		);
	}
}
