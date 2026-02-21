import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class NotParser extends AbstractParser<'not'> {
	readonly typeKind = 'not' as const;

	protected parseImpl(schema: JSONSchema): ZodBuilder {
		const s = schema as JSONSchemaObject & { not: JSONSchema };
		const notSchema = AbstractParser.parseSchema(s.not, {
			...this.refs,
			path: [...this.refs.path, 'not'],
		}).text();

		return this.refs.build
			.any()
			.refine(
				`(value) => !${notSchema}.safeParse(value).success`,
				'Invalid input: Should NOT be valid against schema',
			);
	}
}
