import { JsonSchemaObject } from "../Types.js";
import { buildNull } from "../ZodBuilder/index.js";

export const parseNull = (schema: JsonSchemaObject & { type: "null" }) => {
  return buildNull(schema);
};
