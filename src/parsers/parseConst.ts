import { JsonSchemaObject, Serializable } from "../Types.js";
import { buildLiteral } from "../ZodBuilder/index.js";

export const parseConst = (schema: JsonSchemaObject & { const: Serializable }) => {
  return buildLiteral(schema.const);
};
