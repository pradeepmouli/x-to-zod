import type { NullableSchema } from '../types/index.js';
import type { Builder } from '../../Builder/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import { omit } from '../../utils/omit.js';

/**
 * For compatibility with OpenAPI 3.0 nullable
 */
export class NullableParser extends AbstractParser<NullableSchema, 'nullable'> {
	readonly typeKind = 'nullable' as const;

	protected parseImpl(schema: NullableSchema): Builder {
		return AbstractParser.parseSchema(
			omit(schema as any, 'nullable'),
			this.refs,
			true,
		).nullable();
	}
}
