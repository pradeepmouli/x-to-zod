import type { MultipleTypeSchema } from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class MultipleTypeParser extends AbstractParser<
	MultipleTypeSchema,
	'multipleType'
> {
	readonly typeKind = 'multipleType' as const;

	protected parseImpl(schema: MultipleTypeSchema): ZodBuilder {
		return this.refs.build.union(
			schema.type.map((type: string) =>
				AbstractParser.parseSchema({ ...schema, type } as any, {
					...this.refs,
					withoutDefaults: true,
				}),
			),
		);
	}
}
