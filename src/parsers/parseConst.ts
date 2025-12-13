import { JsonSchemaObject, Serializable } from "../Types.js";
import { buildConst } from "../ZodBuilder/index.js";

export const parseConst = (schema: JsonSchemaObject & { const: Serializable }) => {
  return buildConst(schema);
};
