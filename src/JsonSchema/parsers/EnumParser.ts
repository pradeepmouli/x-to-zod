import type { EnumSchema } from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { buildPathString } from '../../utils/buildPathString.js';

export class EnumParser extends AbstractParser<EnumSchema, 'enum'> {
	readonly typeKind = 'enum' as const;

	protected parseImpl(schema: EnumSchema): ZodBuilder {
		if (!Array.isArray(schema.enum)) {
			throw new Error(
				`EnumParser: schema at path '${
					this.refs.pathString ?? buildPathString(this.refs.path || [])
				}' is missing a valid 'enum' array`,
			);
		}
		return this.refs.build.enum(schema.enum);
	}
}
