import type { ConstSchema } from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class ConstParser extends AbstractParser<ConstSchema, 'const'> {
	readonly typeKind = 'const' as const;

	protected parseImpl(schema: ConstSchema): ZodBuilder {
		const hasOwnConst =
			Object.prototype.hasOwnProperty.call(schema, 'const') &&
			schema.const !== undefined;
		if (!hasOwnConst) {
			throw new Error(
				`ConstParser: schema at path '${this.refs.pathString}' is missing a 'const' property`,
			);
		}
		return this.refs.build.literal(schema.const);
	}
}
