import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import type { JSONSchemaObject } from '../types/index.js';

/**
 * Handles if/then/else conditional schemas
 */
export class ConditionalParser extends BaseParser<'conditional'> {
	readonly typeKind = 'conditional' as const;

	protected parseImpl(schema: JSONSchemaObject): ZodBuilder {
		const s = schema as any;

		// Runtime checks for required properties
		if (!s.if || !s.then || !s.else) {
			throw new Error(
				'Conditional schema must have if, then, and else properties',
			);
		}

		const $if = this.parseChild(s.if, 'if');
		const $then = this.parseChild(s.then, 'then');
		const $else = this.parseChild(s.else, 'else');

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
