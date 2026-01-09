import type { JsonSchemaObject } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class MultipleTypeParser extends BaseParser<
  JsonSchemaObject & { type: string[] }
> {
  parse(): ZodBuilder {
    return this.refs.build.union(
      this.schema.type.map((type: string) =>
        BaseParser.parseSchema(
          { ...this.schema, type } as any,
          {
            ...this.refs,
            withoutDefaults: true,
          },
        ),
      ),
    );
  }
}
