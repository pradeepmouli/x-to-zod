import type { Serializable } from '../../Types.js';
import type { JSONSchema } from 'json-schema-typed/draft-2020-12';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class EnumParser extends BaseParser<
  JSONSchema.Interface & { enum: Serializable[] }
> {
  parse(): ZodBuilder {
    return this.refs.build.enum(this.schema.enum);
  }
}
