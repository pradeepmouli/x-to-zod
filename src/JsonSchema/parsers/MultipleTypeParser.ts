import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class MultipleTypeParser extends AbstractParser<'multipleType'> {
	readonly typeKind = 'multipleType' as const;

	protected parseImpl(schema: JSONSchema): ZodBuilder {
		const s = schema as JSONSchemaObject & { type: string[] };
		return this.refs.build.union(
			s.type.map((type: string) =>
				AbstractParser.parseSchema({ ...s, type } as any, {
					...this.refs,
					withoutDefaults: true,
				}),
			),
		);
	}
}
