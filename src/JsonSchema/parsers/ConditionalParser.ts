import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import type { JSONSchemaObject } from '../types/index.js';

/**
 * Handles if/then/else conditional schemas
 */
export class ConditionalParser extends BaseParser<'conditional'> {
	readonly typeKind = 'conditional' as const;

	protected parseImpl(schema: JSONSchemaObject<'OpenAPI3.1'>): ZodBuilder {
		const s = schema;
		const $if = BaseParser.parseSchema(s.if!, {
			...this.refs,
			path: [...this.refs.path, 'if'],
		});
		const $then = BaseParser.parseSchema(s.then!, {
			...this.refs,
			path: [...this.refs.path, 'then'],
		});
		const $else = BaseParser.parseSchema(s.else!, {
			...this.refs,
			path: [...this.refs.path, 'else'],
		});

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
