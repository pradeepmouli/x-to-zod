import type { JsonSchemaObject, JsonSchema } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

/**
 * Handles if/then/else conditional schemas
 */
export class ConditionalParser extends BaseParser<
  JsonSchemaObject & {
    if: JsonSchema;
    then: JsonSchema;
    else: JsonSchema;
  }
> {
  parse(): ZodBuilder {
    const $if = BaseParser.parseSchema(this.schema.if, {
      ...this.refs,
      path: [...this.refs.path, 'if'],
    });
    const $then = BaseParser.parseSchema(this.schema.then, {
      ...this.refs,
      path: [...this.refs.path, 'then'],
    });
    const $else = BaseParser.parseSchema(this.schema.else, {
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
