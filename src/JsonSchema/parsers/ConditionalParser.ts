import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import type { ConditionalSchema } from '../types/index.js';

/**
 * Handles if/then/else conditional schemas
 */
export class ConditionalParser extends AbstractParser<
	ConditionalSchema,
	'conditional'
> {
	readonly typeKind = 'conditional' as const;

	protected parseImpl(schema: ConditionalSchema): ZodBuilder {
		// Runtime checks for required properties
		if (!schema.if || !schema.then || !schema.else) {
			throw new Error(
				'Conditional schema must have if, then, and else properties',
			);
		}

		const $if = this.parseChild(schema.if, 'if');
		const $then = this.parseChild(schema.then, 'then');
		const $else = this.parseChild(schema.else, 'else');

		return this.refs.build.union([$then, $else]).superRefine(
			`(value,ctx) => {
  const result = ${$if.text()}.safeParse(value).success
    ? ${$then.text()}.safeParse(value)
    : ${$else.text()}.safeParse(value);
  if (!result.success) {
    result.error.errors.forEach((error) => ctx.addIssue(error))
  }
}`,
		);
	}
}
