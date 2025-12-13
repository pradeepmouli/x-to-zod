import { JsonSchemaObject } from "../Types.js";
import { buildBoolean } from "../ZodBuilder/index.js";

export const parseBoolean = (schema: JsonSchemaObject & { type: "boolean" }) => {
  return buildBoolean(schema);
};
