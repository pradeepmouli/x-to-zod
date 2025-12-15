import { JsonSchemaObject, Serializable } from "../Types.js";
import { EnumBuilder } from "../ZodBuilder/index.js";

export const parseEnum = (schema: JsonSchemaObject & { enum: Serializable[] }) => {
  return new EnumBuilder(schema.enum).done();
};
