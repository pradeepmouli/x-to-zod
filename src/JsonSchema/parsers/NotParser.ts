import type { JsonSchemaObject, JsonSchema } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class NotParser extends BaseParser<'not'> {
	readonly typeKind = 'not' as const;

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const s = schema as JsonSchemaObject & { not: JsonSchema };
		const notSchema = BaseParser.parseSchema(s.not, {
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
