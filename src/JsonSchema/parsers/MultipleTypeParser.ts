import type { JsonSchemaObject, JsonSchema } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class MultipleTypeParser extends BaseParser<'multipleType'> {
	readonly typeKind = 'multipleType' as const;

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const s = schema as JsonSchemaObject & { type: string[] };
		return this.refs.build.union(
			s.type.map((type: string) =>
				BaseParser.parseSchema({ ...s, type } as any, {
					...this.refs,
					withoutDefaults: true,
				}),
			),
		);
	}
}
