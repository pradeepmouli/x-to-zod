import { JsonSchemaObject, Serializable } from "../Types.js";
import { buildEnum } from "../ZodBuilder/index.js";

export const parseEnum = (schema: JsonSchemaObject & { enum: Serializable[] }) => {
  return buildEnum(schema);
};
