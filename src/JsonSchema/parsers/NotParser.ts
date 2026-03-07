import type { NotSchema } from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class NotParser extends AbstractParser<NotSchema, 'not'> {
	readonly typeKind = 'not' as const;

	protected parseImpl(schema: NotSchema): ZodBuilder {
		const notSchema = AbstractParser.parseSchema(schema.not, {
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
